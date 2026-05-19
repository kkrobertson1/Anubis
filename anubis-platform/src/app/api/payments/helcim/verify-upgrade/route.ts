import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SLOT_PRICES, MAX_SLOTS } from "@/lib/upgrade-tiers";

export async function POST(req: NextRequest) {
  const { transactionId, slots } = await req.json();

  if (!transactionId || !slots) {
    return NextResponse.json({ error: "Missing transactionId or slots" }, { status: 400 });
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

    // Idempotency
    const { data: existing } = await serviceClient
      .from("payments")
      .select("id")
      .eq("transaction_id", String(transactionId))
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true });
    }

    // Verify transaction with Helcim
    const res = await fetch(
      `https://api.helcim.com/v2/payment/card?transactionId=${encodeURIComponent(transactionId)}`,
      { headers: { "api-token": process.env.HELCIM_API_TOKEN! } }
    );

    const data = await res.json();
    const transaction = data.transactions?.[0];

    if (!transaction || transaction.status !== "APPROVED") {
      return NextResponse.json({ error: "Payment not approved" }, { status: 400 });
    }

    // Guard against wrong amount
    const paidAmount = parseFloat(transaction.amount);
    if (paidAmount < expectedPrice) {
      return NextResponse.json({ error: "Incorrect payment amount" }, { status: 400 });
    }

    // Re-check cap at verify time (race condition guard)
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
      processor: "helcim",
      amount: expectedPrice,
      payment_type: "slot_upgrade",
      transaction_id: String(transactionId),
      status: "completed",
      metadata: { helcim_transaction_id: transactionId, slots_added: slots },
    });

    await serviceClient
      .from("profiles")
      .update({ slots_total: newTotal })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Helcim verify-upgrade exception:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
