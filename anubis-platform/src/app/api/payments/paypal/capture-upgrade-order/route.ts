import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SLOT_PRICES, MAX_SLOTS } from "@/lib/upgrade-tiers";

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
  const { orderId, slots } = await req.json();

  if (!orderId || !slots) {
    return NextResponse.json({ error: "Missing orderId or slots" }, { status: 400 });
  }

  // Validate tier server-side
  const expectedPrice = SLOT_PRICES[slots as keyof typeof SLOT_PRICES];
  if (!expectedPrice) {
    return NextResponse.json({ error: "Invalid slot tier" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const serviceClient = await createServiceClient();

    // Idempotency: don't double-apply the same order
    const { data: existing } = await serviceClient
      .from("payments")
      .select("id")
      .eq("transaction_id", orderId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ status: "COMPLETED" });
    }

    const { token: accessToken, error: tokenError } = await getPayPalAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: `PayPal auth failed: ${tokenError}` }, { status: 502 });
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
      // Re-check cap at capture time (race condition guard)
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("slots_total")
        .eq("id", user.id)
        .single();

      const currentSlots = profile?.slots_total ?? 28;
      const newTotal = currentSlots + slots;

      if (newTotal > MAX_SLOTS) {
        return NextResponse.json(
          { error: `Upgrade would exceed the ${MAX_SLOTS} slot maximum` },
          { status: 400 }
        );
      }

      await serviceClient.from("payments").insert({
        user_id: user.id,
        processor: "paypal",
        amount: expectedPrice,
        payment_type: "slot_upgrade",
        transaction_id: capture.id,
        status: "completed",
        metadata: { paypal_order_id: orderId, slots_added: slots },
      });

      await serviceClient
        .from("profiles")
        .update({ slots_total: newTotal })
        .eq("id", user.id);
    }

    return NextResponse.json(capture);
  } catch (err) {
    console.error("PayPal capture-upgrade-order exception:", err);
    return NextResponse.json({ error: "Failed to capture order" }, { status: 500 });
  }
}
