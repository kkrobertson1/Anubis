import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slots } = await req.json();

  // Validate tier server-side — never trust client-supplied price
  const price = SLOT_PRICES[slots as keyof typeof SLOT_PRICES];
  if (!price) {
    return NextResponse.json({ error: "Invalid slot tier" }, { status: 400 });
  }

  // Enforce max slots cap
  const { data: profile } = await supabase
    .from("profiles")
    .select("slots_total")
    .eq("id", user.id)
    .single();

  const currentSlots = profile?.slots_total ?? 28;
  if (currentSlots + slots > MAX_SLOTS) {
    return NextResponse.json(
      { error: `This upgrade would exceed the ${MAX_SLOTS} slot maximum` },
      { status: 400 }
    );
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
            amount: { currency_code: "USD", value: price.toFixed(2) },
            description: `ANUBIS Memorial — +${slots} Slot Upgrade`,
          },
        ],
      }),
    });

    const order = await res.json();
    if (!res.ok) {
      console.error("PayPal create-upgrade-order error:", JSON.stringify(order));
      return NextResponse.json(
        { error: order.message ?? JSON.stringify(order) },
        { status: res.status }
      );
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("PayPal create-upgrade-order exception:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
