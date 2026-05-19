import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  if (!res.ok) {
    console.error("PayPal token error:", JSON.stringify(data));
    return { error: data.error_description ?? data.message ?? JSON.stringify(data) };
  }
  return { token: data.access_token };
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token, error: tokenError } = await getPayPalAccessToken();
    if (!token) {
      return NextResponse.json({ error: `PayPal auth failed: ${tokenError}` }, { status: 502 });
    }

    const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: "35.00" },
            description: "ANUBIS Memorial Account — Lifetime Access",
          },
        ],
      }),
    });

    const order = await res.json();
    if (!res.ok) {
      console.error("PayPal create-order error:", JSON.stringify(order));
      return NextResponse.json(
        { error: order.message ?? JSON.stringify(order) },
        { status: res.status }
      );
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("PayPal create-order exception:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
