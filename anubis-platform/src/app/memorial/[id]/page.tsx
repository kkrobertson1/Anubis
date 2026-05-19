import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, FileText } from "lucide-react";
import PublicGuestbookForm from "@/components/memorial/PublicGuestbookForm";
import AdUnit from "@/components/AdUnit";
import Navbar from "@/components/Navbar";

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("gravesite_profiles")
    .select("deceased_name, cemetery_name")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!data) return { title: "Memorial — ANUBIS" };

  return {
    title: `${data.deceased_name} — ANUBIS Memorial`,
    description: data.cemetery_name
      ? `Memorial profile for ${data.deceased_name} at ${data.cemetery_name}`
      : `Memorial profile for ${data.deceased_name}`,
  };
}

export default async function PublicMemorialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: gravesite }, { data: media }, { data: entries }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("gravesite_profiles")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .single(),
    supabase
      .from("gravesite_media")
      .select("*")
      .eq("gravesite_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("guestbook_entries")
      .select("*")
      .eq("gravesite_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!gravesite) notFound();

  const dob = formatDate(gravesite.date_of_birth);
  const dod = formatDate(gravesite.date_of_death);
  const photos = media?.filter((m) => m.media_type === "photo") ?? [];
  const docs = media?.filter((m) => m.media_type !== "photo") ?? [];

  return (
    <main className="min-h-screen bg-[#f0ecf5]">
      <Navbar isLoggedIn={!!user} />

      <div className="h-[120px]" />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          {gravesite.slot_category && gravesite.slot_category !== "other" && (
            <p className="text-[10px] tracking-[0.5em] text-[#C9A84C] uppercase mb-4 capitalize">
              {gravesite.slot_category}
            </p>
          )}
          <h1 className="font-display text-5xl md:text-6xl font-light text-[#1a1a2e] mb-4">
            {gravesite.deceased_name}
          </h1>

          {(dob || dod) && (
            <p className="text-[#5c6b7a] text-sm tracking-wider mb-2">
              {dob ?? "Unknown"} — {dod ?? "Unknown"}
            </p>
          )}

          {gravesite.cemetery_name && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#5c6b7a]">
              <MapPin size={11} className="text-[#C9A84C]" />
              {gravesite.cemetery_name}
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-[#d1c4e9] to-transparent max-w-[200px] mx-auto mt-8" />
        </div>

        {/* Bio */}
        {gravesite.bio && (
          <div className="bg-white border border-[#e2d8ed] rounded p-8 mb-6 text-center shadow-sm">
            <p className="font-display text-lg text-[#5a5a6a] leading-relaxed italic">
              &ldquo;{gravesite.bio}&rdquo;
            </p>
          </div>
        )}

        {/* Ad — Memorial page */}
        <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MEMORIAL ?? ""} />

        {/* GPS */}
        {!!gravesite.latitude && !!gravesite.longitude && (
          <div className="bg-white border border-[#e2d8ed] rounded p-5 mb-6 flex items-center gap-3 shadow-sm">
            <MapPin size={14} className="text-[#C9A84C] flex-shrink-0" />
            <div>
              <p className="text-[10px] text-[#5c6b7a] uppercase tracking-wider mb-0.5">GPS Coordinates</p>
              <p className="text-sm text-[#1a1a2e] font-mono">
                {Number(gravesite.latitude).toFixed(6)}, {Number(gravesite.longitude).toFixed(6)}
              </p>
            </div>
            <a
              href={`https://maps.google.com/?q=${gravesite.latitude},${gravesite.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-[#5c6b7a] hover:text-[#C9A84C] transition-colors"
            >
              Open in Maps →
            </a>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] text-[#5c6b7a] uppercase tracking-wider mb-4">Photos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? gravesite.deceased_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {docs.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] text-[#5c6b7a] uppercase tracking-wider mb-3">Documents & Obituaries</p>
            <div className="space-y-2">
              {docs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 border border-[#e2d8ed] bg-white rounded text-sm text-[#5a5a6a] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-colors"
                >
                  <FileText size={14} className="text-[#C9A84C] flex-shrink-0" />
                  <span className="capitalize">{doc.media_type}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Guest Book */}
        <div className="bg-white border border-[#e2d8ed] rounded p-8 shadow-sm">
          <p className="text-[10px] tracking-[0.4em] text-[#5a5a6a] uppercase mb-2">Virtual</p>
          <h2 className="font-display text-2xl font-light text-[#1a1a2e] mb-2">Guest Book</h2>
          <div className="h-px bg-gradient-to-r from-transparent via-[#d1c4e9] to-transparent mb-8" />

          <PublicGuestbookForm gravesiteId={id} />

          {entries && entries.length > 0 ? (
            <div className="mt-8 space-y-5">
              {entries.map((entry) => (
                <div key={entry.id} className="border-l-2 border-[#d1c4e9] pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-[#1a1a2e] font-medium">{entry.visitor_name}</p>
                    <p className="text-[10px] text-[#8a8a9a]">{timeAgo(entry.created_at)}</p>
                  </div>
                  <p className="text-sm text-[#5a5a6a] leading-relaxed">{entry.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8a8a9a] text-center mt-6">
              No tributes yet — be the first to leave a message
            </p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#8a8a9a] mb-3">
            Honor your loved ones with your own ANUBIS memorial account
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-2.5 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors"
          >
            Get Started — $35 Lifetime
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#1E2A3D] bg-[#0A0F1A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Image src="/AunbisTheme.png" alt="ANUBIS" width={120} height={40} className="object-contain" />
            <p className="text-xs text-[#6B82A0] tracking-wider mt-1">A RR&amp;W Platform</p>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-8 justify-center">
            <Link href="/about" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">About</Link>
            <Link href="/faq" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">FAQ</Link>
            <Link href="/contact" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Contact</Link>
            <Link href="/privacy" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Terms</Link>
            <Link href="/disclaimer" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Disclaimer</Link>
          </div>
          <p className="text-xs text-[#6B82A0]">© {new Date().getFullYear()} RR&amp;W. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
