import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { transactionId } = await req.json();

  if (!transactionId) {
    return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const serviceClient = await createServiceClient();

    // Idempotency: don't double-record the same transaction
    const { data: existing } = await serviceClient
      .from("payments")
      .select("id")
      .eq("transaction_id", String(transactionId))
      .maybeSingle();

    if (existing) {
      await serviceClient
        .from("profiles")
        .update({ account_status: "active", payment_status: "paid" })
        .eq("id", user.id);
      return NextResponse.json({ success: true });
    }

    // Verify the transaction with Helcim
    const res = await fetch(
      `https://api.helcim.com/v2/payment/card?transactionId=${encodeURIComponent(transactionId)}`,
      {
        headers: {
          "api-token": process.env.HELCIM_API_TOKEN!,
        },
      }
    );

    const data = await res.json();
    const transaction = data.transactions?.[0];

    if (!transaction || transaction.status !== "APPROVED") {
      return NextResponse.json({ error: "Payment not approved" }, { status: 400 });
    }

    // Guard against wrong amounts
    const amount = parseFloat(transaction.amount);
    if (amount < 35.0) {
      return NextResponse.json({ error: "Incorrect payment amount" }, { status: 400 });
    }

    await serviceClient.from("payments").insert({
      user_id: user.id,
      processor: "helcim",
      amount: 35.0,
      payment_type: "account_creation",
      transaction_id: String(transactionId),
      status: "completed",
      metadata: { helcim_transaction_id: transactionId },
    });

    await serviceClient
      .from("profiles")
      .update({ account_status: "active", payment_status: "paid" })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
