import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, BookOpen } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import CommunityFilters from "@/components/community/CommunityFilters";
import Navbar from "@/components/Navbar";
import { US_STATES } from "@/lib/constants";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; q?: string; page?: string }>;
}) {
  const { state, q, page } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const PAGE_SIZE = 24;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("gravesite_profiles")
    .select(
      "id, deceased_name, cemetery_name, cemetery_state, date_of_birth, date_of_death, slot_category, bio, created_at",
      { count: "exact" }
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (state) query = query.eq("cemetery_state", state);
  if (q) query = query.ilike("deceased_name", `%${q}%`);

  const { data: memorials, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Recent activity stats
  const { count: totalMemorials } = await supabase
    .from("gravesite_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_public", true);

  const { count: totalEntries } = await supabase
    .from("guestbook_entries")
    .select("*", { count: "exact", head: true });

  const { count: totalMembers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "paid");

  return (
    <main className="min-h-screen bg-[#f0ecf5]">
      <Navbar isLoggedIn={!!user} />

      {/* Spacer for fixed navbar */}
      <div className="h-[120px]" />

      {/* Hero banner */}
      <div className="relative py-24 px-6 text-center overflow-hidden">
        <Image
          src="/bg-daisy-field.jpg"
          alt="Field of daisies at sunrise"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#0A0F1A]/50" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">ANUBIS Memorial Community</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Honoring Lives Across America
          </h1>
          <div className="gold-divider max-w-[200px] mx-auto my-6" />
          <p className="text-white/80 text-sm leading-relaxed max-w-xl mx-auto">
            Browse memorials shared by families across the United States. Connect with those who share your loved ones and keep their memory alive.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-[#1E2A3D] bg-[#0A0F1A]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { icon: MapPin, label: "Public Memorials", value: totalMemorials ?? 0 },
            { icon: Users, label: "Active Members", value: totalMembers ?? 0 },
            { icon: BookOpen, label: "Guest Book Tributes", value: totalEntries ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={14} className="text-[#C9A84C]" />
              <div>
                <p className="font-display text-2xl font-light text-[#EDE8DC]">{value.toLocaleString()}</p>
                <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Ad — Community top */}
        <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COMMUNITY ?? ""} />

        {/* Search + Filter — client component */}
        <CommunityFilters states={US_STATES} currentState={state} currentQ={q} />

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-[#5c6b7a]">
            {count === 0
              ? "No memorials found"
              : `Showing ${from + 1}–${Math.min(to + 1, count ?? 0)} of ${count?.toLocaleString()} memorial${(count ?? 0) !== 1 ? "s" : ""}${state ? ` in ${state}` : ""}${q ? ` matching "${q}"` : ""}`}
          </p>
          {(state || q) && (
            <Link href="/community" className="text-xs text-[#C9A84C] hover:text-[#D4AF37] transition-colors">
              Clear filters
            </Link>
          )}
        </div>

        {/* Memorial grid */}
        {!memorials?.length ? (
          <div className="bg-white border border-[#e2d8ed] rounded p-16 text-center shadow-sm">
            <MapPin size={28} className="text-[#c9a8d8] mx-auto mb-4" />
            <p className="text-[#5c6b7a] text-sm mb-1">No memorials found</p>
            <p className="text-xs text-[#8a8a9a]">Try a different state or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {memorials.map((m) => {
              const dob = formatDate(m.date_of_birth);
              const dod = formatDate(m.date_of_death);
              return (
                <Link
                  key={m.id}
                  href={`/memorial/${m.id}`}
                  className="bg-white border border-[#e2d8ed] rounded p-5 shadow-sm group flex flex-col hover:border-[#C9A84C] hover:shadow-md transition-all duration-200"
                >
                  {/* Category */}
                  {m.slot_category && m.slot_category !== "other" && (
                    <p className="text-[10px] tracking-[0.4em] text-[#C9A84C] uppercase mb-2 capitalize">
                      {m.slot_category}
                    </p>
                  )}

                  {/* Name */}
                  <h2 className="font-display text-xl font-light text-[#1a1a2e] group-hover:text-[#C9A84C] transition-colors leading-snug mb-3 flex-1">
                    {m.deceased_name}
                  </h2>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#d1c4e9] to-transparent mb-3" />

                  {/* Dates */}
                  {(dob || dod) && (
                    <p className="text-xs text-[#5c6b7a] mb-2">
                      {dob ?? "?"} — {dod ?? "?"}
                    </p>
                  )}

                  {/* Cemetery */}
                  {m.cemetery_name && (
                    <div className="flex items-start gap-1.5 text-xs text-[#5c6b7a]">
                      <MapPin size={10} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                      <span className="truncate">{m.cemetery_name}</span>
                    </div>
                  )}

                  {/* State badge */}
                  {m.cemetery_state && (
                    <span className="mt-3 self-start text-[10px] border border-[#d1c4e9] text-[#5c6b7a] px-2 py-0.5 tracking-wider uppercase rounded">
                      {m.cemetery_state}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {currentPage > 1 && (
              <Link
                href={`/community?${new URLSearchParams({ ...(state ? { state } : {}), ...(q ? { q } : {}), page: String(currentPage - 1) })}`}
                className="px-4 py-2 border border-[#d1c4e9] text-xs text-[#5c6b7a] hover:text-[#1a1a2e] hover:border-[#C9A84C] transition-colors rounded"
              >
                ← Previous
              </Link>
            )}
            <span className="text-xs text-[#8a8a9a]">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/community?${new URLSearchParams({ ...(state ? { state } : {}), ...(q ? { q } : {}), page: String(currentPage + 1) })}`}
                className="px-4 py-2 border border-[#d1c4e9] text-xs text-[#5c6b7a] hover:text-[#1a1a2e] hover:border-[#C9A84C] transition-colors rounded"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Ad — Community bottom */}
        <div className="mt-10">
          <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COMMUNITY ?? ""} />
        </div>

        {/* CTA for non-members */}
        <div className="mt-10 bg-white border border-[#e2d8ed] rounded p-10 text-center shadow-sm">
          <p className="text-[10px] tracking-[0.5em] text-[#C9A84C] uppercase mb-3">Join ANUBIS</p>
          <h2 className="font-display text-3xl font-light text-[#1a1a2e] mb-3">
            Honor your loved ones
          </h2>
          <p className="text-sm text-[#5a5a6a] mb-6 max-w-md mx-auto">
            Create your own memorial profiles, save gravesite locations, and connect with families who share the same sacred ground.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors gold-glow"
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
