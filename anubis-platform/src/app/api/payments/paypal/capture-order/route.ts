import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

async function getPayPalAccessToken(): Promise<{ token?: string; error?: string }> {
  const credentials = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) return { error: data.error_description ?? "PayPal auth failed" };
  return { token: data.access_token };
}

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token: accessToken, error: tokenError } = await getPayPalAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: `PayPal auth failed: ${tokenError}` }, { status: 502 });
    }

    // Idempotency: don't double-record the same order
    const serviceClient = await createServiceClient();
    const { data: existing } = await serviceClient
      .from("payments")
      .select("id")
      .eq("transaction_id", orderId)
      .maybeSingle();

    if (existing) {
      // Already recorded — just ensure profile is active and redirect
      await serviceClient
        .from("profiles")
        .update({ account_status: "active", payment_status: "paid" })
        .eq("id", user.id);
      return NextResponse.json({ status: "COMPLETED" });
    }

    const res = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const capture = await res.json();

    if (capture.status === "COMPLETED") {
      await serviceClient.from("payments").insert({
        user_id: user.id,
        processor: "paypal",
        amount: 35.0,
        payment_type: "account_creation",
        transaction_id: capture.id,
        status: "completed",
        metadata: { paypal_order_id: orderId },
      });

      await serviceClient
        .from("profiles")
        .update({ account_status: "active", payment_status: "paid" })
        .eq("id", user.id);
    }

    return NextResponse.json(capture);
  } catch {
    return NextResponse.json({ error: "Failed to capture order" }, { status: 500 });
  }
}
