"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateGravesite(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const lat = formData.get("latitude") as string;
  const lng = formData.get("longitude") as string;
  const latNum = lat ? parseFloat(lat) : null;
  const lngNum = lng ? parseFloat(lng) : null;

  if (latNum !== null && (latNum < -90 || latNum > 90))
    return { error: "Latitude must be between -90 and 90" };
  if (lngNum !== null && (lngNum < -180 || lngNum > 180))
    return { error: "Longitude must be between -180 and 180" };

  const { error } = await supabase
    .from("gravesite_profiles")
    .update({
      deceased_name: (formData.get("deceased_name") as string).trim(),
      slot_category: formData.get("slot_category") as string,
      cemetery_name: (formData.get("cemetery_name") as string) || null,
      cemetery_state: (formData.get("cemetery_state") as string) || null,
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      date_of_death: (formData.get("date_of_death") as string) || null,
      bio: (formData.get("bio") as string) || null,
      latitude: latNum,
      longitude: lngNum,
      is_public: formData.get("is_public") === "true",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/gravesite/${id}`);
  revalidatePath("/dashboard");
  redirect(`/dashboard/gravesite/${id}`);
}

export async function deleteGravesite(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("gravesite_profiles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Decrement slots_used
  const { data: profile } = await supabase
    .from("profiles")
    .select("slots_used")
    .eq("id", user.id)
    .single();

  if (profile && profile.slots_used > 0) {
    await supabase
      .from("profiles")
      .update({ slots_used: profile.slots_used - 1 })
      .eq("id", user.id);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function addGuestbookEntry(gravesiteId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const visitorName = formData.get("visitor_name") as string;
  const message = formData.get("message") as string;

  if (!visitorName?.trim() || !message?.trim()) {
    return { error: "Name and message are required" };
  }

  const { error } = await supabase.from("guestbook_entries").insert({
    gravesite_id: gravesiteId,
    user_id: user?.id ?? null,
    visitor_name: visitorName.trim(),
    message: message.trim(),
  });

  if (error) return { error: error.message };

  // Notify the gravesite owner (skip if the owner signed their own guest book)
  const { data: gravesite } = await supabase
    .from("gravesite_profiles")
    .select("user_id, deceased_name")
    .eq("id", gravesiteId)
    .single();

  if (gravesite && gravesite.user_id !== user?.id) {
    await supabase.from("notifications").insert({
      user_id: gravesite.user_id,
      type: "guestbook_entry",
      title: "New Guest Book Entry",
      message: `${visitorName.trim()} left a tribute on ${gravesite.deceased_name}'s memorial.`,
      data: { gravesite_id: gravesiteId },
    });
  }

  revalidatePath(`/dashboard/gravesite/${gravesiteId}`);
  revalidatePath(`/memorial/${gravesiteId}`);
  return { success: true };
}

export async function createGravesite(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Check slot availability — count actual rows to avoid counter drift
  const [{ data: profile }, { count: actualUsed }] = await Promise.all([
    supabase.from("profiles").select("slots_total, slots_used").eq("id", user.id).single(),
    supabase.from("gravesite_profiles").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  if (!profile) return { error: "Profile not found" };

  const slotsUsed = actualUsed ?? profile.slots_used;
  if (slotsUsed >= profile.slots_total) {
    return { error: "No slots available" };
  }

  const deceasedName = formData.get("deceased_name") as string;
  if (!deceasedName?.trim()) return { error: "Deceased name is required" };

  const lat = formData.get("latitude") as string;
  const lng = formData.get("longitude") as string;
  const latNum = lat ? parseFloat(lat) : null;
  const lngNum = lng ? parseFloat(lng) : null;

  if (latNum !== null && (latNum < -90 || latNum > 90))
    return { error: "Latitude must be between -90 and 90" };
  if (lngNum !== null && (lngNum < -180 || lngNum > 180))
    return { error: "Longitude must be between -180 and 180" };

  const { data: newGravesite, error } = await supabase
    .from("gravesite_profiles")
    .insert({
      user_id: user.id,
      deceased_name: deceasedName.trim(),
      slot_category: (formData.get("slot_category") as string) || "other",
      cemetery_name: (formData.get("cemetery_name") as string) || null,
      cemetery_state: (formData.get("cemetery_state") as string) || null,
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      date_of_death: (formData.get("date_of_death") as string) || null,
      bio: (formData.get("bio") as string) || null,
      latitude: latNum,
      longitude: lngNum,
      is_public: formData.get("is_public") === "true",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Increment slots_used — use actual count to stay in sync
  await supabase
    .from("profiles")
    .update({ slots_used: slotsUsed + 1 })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  return { id: newGravesite!.id };
}
