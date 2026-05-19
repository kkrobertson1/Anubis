import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        amount: 35.0,
        currency: "USD",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Return the full Helcim error so we can debug it
      console.error("Helcim init error:", JSON.stringify(data));
      return NextResponse.json(
        { error: data.errors?.[0]?.message ?? data.message ?? JSON.stringify(data) },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Helcim init exception:", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
