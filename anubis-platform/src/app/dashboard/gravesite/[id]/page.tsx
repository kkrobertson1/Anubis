import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, ArrowLeft, Edit, BookOpen, Upload } from "lucide-react";
import ShareButton from "@/components/dashboard/ShareButton";
import GuestbookForm from "@/components/dashboard/GuestbookForm";
import DeleteGravesiteButton from "@/components/dashboard/DeleteGravesiteButton";
import MediaUpload from "@/components/dashboard/MediaUpload";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function GravesiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: gravesite }, { data: entries }, { data: mediaItems }] = await Promise.all([
    supabase
      .from("gravesite_profiles")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single(),
    supabase
      .from("guestbook_entries")
      .select("*")
      .eq("gravesite_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("gravesite_media")
      .select("*")
      .eq("gravesite_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!gravesite) notFound();

  const dob = formatDate(gravesite.date_of_birth);
  const dod = formatDate(gravesite.date_of_death);

  return (
    <div className="pt-16 lg:pt-0 max-w-3xl">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors mb-6"
      >
        <ArrowLeft size={13} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="luxury-card p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#C9A84C] uppercase mb-2 capitalize">
              {gravesite.slot_category}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-light text-[#EDE8DC]">
              {gravesite.deceased_name}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            {gravesite.is_public && (
              <ShareButton url={`${process.env.NEXT_PUBLIC_APP_URL}/memorial/${id}`} />
            )}
            <Link
              href={`/dashboard/gravesite/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border border-[#1E2A3D] text-xs text-[#6B82A0] hover:text-[#EDE8DC] hover:border-[#2A3A4E] transition-colors"
            >
              <Edit size={12} />
              Edit
            </Link>
            <DeleteGravesiteButton id={id} />
          </div>
        </div>

        <div className="gold-divider mb-6" />

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Dates */}
          {(dob || dod) && (
            <div className="flex items-start gap-3">
              <Calendar size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-1">Life</p>
                <p className="text-sm text-[#EDE8DC]">
                  {dob ?? "Unknown"} — {dod ?? "Unknown"}
                </p>
              </div>
            </div>
          )}

          {/* Cemetery */}
          {gravesite.cemetery_name && (
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-1">Cemetery</p>
                <p className="text-sm text-[#EDE8DC]">
                  {gravesite.cemetery_name}
                  {gravesite.cemetery_state ? `, ${gravesite.cemetery_state}` : ""}
                </p>
              </div>
            </div>
          )}

          {/* Coordinates */}
          {!!gravesite.latitude && !!gravesite.longitude && (
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-1">GPS Coordinates</p>
                <p className="text-sm text-[#EDE8DC] font-mono">
                  {Number(gravesite.latitude).toFixed(6)}, {Number(gravesite.longitude).toFixed(6)}
                </p>
              </div>
            </div>
          )}

          {/* Visibility */}
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${gravesite.is_public ? "bg-[#C9A84C]" : "bg-[#3A4A5E]"}`} />
            <div>
              <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-1">Visibility</p>
              <p className="text-sm text-[#EDE8DC]">{gravesite.is_public ? "Public" : "Private"}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {gravesite.bio && (
          <div className="mt-6 pt-6 border-t border-[#1E2A3D]">
            <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-3">Biography</p>
            <p className="text-sm text-[#A09880] leading-relaxed">{gravesite.bio}</p>
          </div>
        )}
      </div>

      {/* Media */}
      <div className="luxury-card p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Upload size={15} className="text-[#C9A84C]" />
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#A09880] uppercase">Photos & Documents</p>
            <h2 className="font-display text-xl font-light text-[#EDE8DC]">Media</h2>
          </div>
        </div>
        <div className="gold-divider mb-6" />
        <MediaUpload gravesiteId={id} initialMedia={mediaItems ?? []} />
      </div>

      {/* Guest Book */}
      <div className="luxury-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={15} className="text-[#C9A84C]" />
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#A09880] uppercase">Virtual</p>
            <h2 className="font-display text-xl font-light text-[#EDE8DC]">Guest Book</h2>
          </div>
        </div>

        <div className="gold-divider mb-6" />

        {/* Add Entry Form */}
        <GuestbookForm gravesiteId={id} />

        {/* Entries */}
        {entries && entries.length > 0 ? (
          <div className="mt-8 space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border-l-2 border-[#1E2A3D] pl-4 py-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-[#EDE8DC] font-medium">{entry.visitor_name}</p>
                  <p className="text-[10px] text-[#3A4A5E]">{timeAgo(entry.created_at)}</p>
                </div>
                <p className="text-sm text-[#A09880] leading-relaxed">{entry.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#3A4A5E] text-center mt-6">
            No messages yet — be the first to leave a tribute
          </p>
        )}
      </div>
    </div>
  );
}
