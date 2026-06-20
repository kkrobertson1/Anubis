import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { del } from "@vercel/blob";

// Save uploaded media URL to DB
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, publicId, mediaType, caption } = await req.json();

  const { error } = await supabase.from("gravesite_media").insert({
    gravesite_id: id,
    uploaded_by: user.id,
    media_type: mediaType,
    url,
    public_id: publicId || null,
    caption: caption || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// Delete media from DB and Vercel Blob
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, publicId } = await req.json();

  // Verify ownership via gravesite
  const { data: media } = await supabase
    .from("gravesite_media")
    .select("gravesite_id, gravesite_profiles!inner(user_id)")
    .eq("id", mediaId)
    .single();

  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.from("gravesite_media").delete().eq("id", mediaId);

  // Remove the underlying file from Vercel Blob. publicId holds the blob URL,
  // which is what del() expects.
  if (publicId) {
    try {
      await del(publicId);
    } catch {
      // Non-fatal — DB record is already removed
    }
  }

  return NextResponse.json({ success: true });
}
