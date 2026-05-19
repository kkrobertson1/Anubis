"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendConnectionRequest(recipientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (user.id === recipientId) return { error: "Cannot connect with yourself" };

  // Check not already connected / pending
  const { data: existing } = await supabase
    .from("connections")
    .select("id, status")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),` +
      `and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing && existing.status !== "declined") {
    return { error: "Request already exists" };
  }

  if (existing && existing.status === "declined") {
    // Remove the old declined record so a fresh request can be made
    await supabase.from("connections").delete().eq("id", existing.id);
  }

  const { error } = await supabase.from("connections").insert({
    requester_id: user.id,
    recipient_id: recipientId,
  });
  if (error) return { error: error.message };

  // Fetch requester's name for the notification
  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const name = requesterProfile
    ? `${requesterProfile.first_name} ${requesterProfile.last_name}`.trim()
    : "A member";

  await supabase.from("notifications").insert({
    user_id: recipientId,
    type: "connection_request",
    title: "Connection Request",
    message: `${name} would like to connect with you.`,
    data: { from_user_id: user.id },
  });

  revalidatePath("/dashboard/connections");
  return { success: true };
}

export async function respondToConnection(
  connectionId: string,
  accept: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const newStatus = accept ? "accepted" : "declined";

  const { data: conn, error } = await supabase
    .from("connections")
    .update({ status: newStatus })
    .eq("id", connectionId)
    .eq("recipient_id", user.id) // only recipient can respond
    .select("requester_id")
    .single();

  if (error) return { error: error.message };

  if (accept && conn) {
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const name = recipientProfile
      ? `${recipientProfile.first_name} ${recipientProfile.last_name}`.trim()
      : "A member";

    await supabase.from("notifications").insert({
      user_id: conn.requester_id,
      type: "connection_accepted",
      title: "Connection Accepted",
      message: `${name} accepted your connection request.`,
      data: { from_user_id: user.id },
    });
  }

  revalidatePath("/dashboard/connections");
  return { success: true };
}
