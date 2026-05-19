import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SLOT_PRICES, MAX_SLOTS } from "@/lib/upgrade-tiers";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slots } = await req.json();

  // Validate tier server-side
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
    const res = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-token": process.env.HELCIM_API_TOKEN!,
      },
      body: JSON.stringify({
        paymentType: "purchase",
        amount: price,
        currency: "USD",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Helcim init-upgrade error:", JSON.stringify(data));
      return NextResponse.json(
        { error: data.errors?.[0]?.message ?? data.message ?? JSON.stringify(data) },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Helcim init-upgrade exception:", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
