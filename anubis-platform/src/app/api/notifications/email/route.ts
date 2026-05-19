import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotificationEmail } from "@/lib/email";

// Service-role client — bypasses RLS so we can read auth.users and profiles
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Verify the request comes from Supabase via the shared secret
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Supabase webhook payload shape: { type, table, record, old_record, schema }
  if (body.type !== "INSERT" || body.table !== "notifications") {
    return NextResponse.json({ ok: true });
  }

  const notification = body.record as {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, string> | null;
  };

  // Look up the recipient's email and name in parallel
  const [{ data: authUser }, { data: profile }] = await Promise.all([
    serviceClient.auth.admin.getUserById(notification.user_id),
    serviceClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", notification.user_id)
      .single(),
  ]);

  const email = authUser.user?.email;
  if (!email) {
    return NextResponse.json({ error: "No email for user" }, { status: 200 });
  }

  const userName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "Member";

  const { error } = await sendNotificationEmail({
    to: email,
    userName,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
