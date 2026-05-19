import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Plus, ExternalLink } from "lucide-react";

const TREE_ORDER = [
  { category: "grandparent", label: "Grandparents", row: 0 },
  { category: "parent", label: "Parents", row: 1 },
  { category: "sibling", label: "Siblings", row: 2 },
  { category: "aunt", label: "Aunts", row: 2 },
  { category: "uncle", label: "Uncles", row: 2 },
  { category: "cousin", label: "Cousins", row: 3 },
  { category: "friend", label: "Friends", row: 3 },
  { category: "other", label: "Other", row: 3 },
];

type Gravesite = {
  id: string;
  deceased_name: string;
  slot_category: string;
  cemetery_name: string | null;
  cemetery_state: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  latitude: number | null;
  longitude: number | null;
  is_public: boolean;
};

function formatYear(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).getFullYear();
}

function TreeCard({ g }: { g: Gravesite }) {
  const dob = formatYear(g.date_of_birth);
  const dod = formatYear(g.date_of_death);

  return (
    <div className="relative group">
      <Link
        href={`/dashboard/gravesite/${g.id}`}
        className="block w-36 luxury-card p-3 text-center hover:border-[#C9A84C]/50 transition-all duration-200"
      >
        {/* Avatar circle */}
        <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/30 group-hover:border-[#C9A84C]/60 bg-[#0F1A2E] flex items-center justify-center mx-auto mb-2 transition-colors">
          <span className="font-display text-lg text-[#C9A84C]">
            {g.deceased_name.charAt(0)}
          </span>
        </div>

        <p className="text-xs text-[#EDE8DC] font-medium leading-tight truncate">
          {g.deceased_name}
        </p>

        {(dob || dod) && (
          <p className="text-[10px] text-[#6B82A0] mt-0.5">
            {dob ?? "?"} — {dod ?? "?"}
          </p>
        )}

        {g.cemetery_name && (
          <p className="text-[9px] text-[#3A4A5E] mt-1 truncate">{g.cemetery_name}</p>
        )}

        {g.latitude && g.longitude && (
          <div className="flex items-center justify-center gap-0.5 mt-1">
            <MapPin size={8} className="text-[#C9A84C]" />
            <span className="text-[9px] text-[#C9A84C]">Located</span>
          </div>
        )}
      </Link>

      {g.is_public && (
        <a
          href={`/memorial/${g.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="View public memorial"
        >
          <ExternalLink size={9} className="text-[#0A0F1A]" />
        </a>
      )}
    </div>
  );
}

function EmptySlot({ category }: { category: string }) {
  return (
    <Link
      href={`/dashboard/gravesite/new?category=${category}`}
      className="w-36 h-28 border border-dashed border-[#1E2A3D] hover:border-[#C9A84C]/30 flex flex-col items-center justify-center gap-1.5 transition-colors group"
    >
      <Plus size={14} className="text-[#2A3A4E] group-hover:text-[#C9A84C] transition-colors" />
      <span className="text-[10px] text-[#3A4A5E] group-hover:text-[#6B82A0] transition-colors capitalize">{category}</span>
    </Link>
  );
}

export default async function FamilyTreePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: gravesites } = await supabase
    .from("gravesite_profiles")
    .select("id, deceased_name, slot_category, cemetery_name, cemetery_state, date_of_birth, date_of_death, latitude, longitude, is_public")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const byCategory = (cat: string) =>
    (gravesites ?? []).filter((g) => g.slot_category === cat);

  const rows = [
    {
      label: "Grandparents",
      categories: ["grandparent"],
      connector: false,
    },
    {
      label: "Parents",
      categories: ["parent"],
      connector: true,
    },
    {
      label: "Siblings & Extended Family",
      categories: ["sibling", "aunt", "uncle"],
      connector: true,
    },
    {
      label: "Cousins, Friends & Others",
      categories: ["cousin", "friend", "other"],
      connector: false,
    },
  ];

  return (
    <div className="pt-16 lg:pt-0">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">Member View</p>
          <h1 className="font-display text-3xl font-light text-[#EDE8DC]">Family Tree</h1>
          <div className="gold-divider max-w-[160px] mt-4" />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors border border-[#1E2A3D] px-4 py-2"
          >
            Grid View
          </Link>
          <Link
            href="/dashboard/gravesite/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors"
          >
            <Plus size={13} />
            Add Memorial
          </Link>
        </div>
      </div>

      {/* Tree */}
      <div className="pb-8">
        <div className="space-y-0">
          {rows.map((row, rowIdx) => {
            const items = row.categories.flatMap((cat) => byCategory(cat));

            return (
              <div key={row.label} className="relative">
                {/* Connector line from row above */}
                {row.connector && rowIdx > 0 && (
                  <div className="flex justify-center">
                    <div className="w-px h-6 bg-[#C9A84C]/20" />
                  </div>
                )}

                {/* Row label */}
                <p className="text-[10px] tracking-[0.4em] text-[#A09880] uppercase text-center mb-4">
                  {row.label}
                </p>

                {/* Cards */}
                <div className="flex items-start justify-center gap-4 flex-wrap px-4">
                  {items.length > 0 ? (
                    items.map((g) => <TreeCard key={g.id} g={g as Gravesite} />)
                  ) : (
                    row.categories.map((cat) => (
                      <EmptySlot key={cat} category={cat} />
                    ))
                  )}
                </div>

                {/* Horizontal connector between cards if multiple */}
                {items.length > 1 && rowIdx < rows.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="w-px h-4 bg-[#C9A84C]/20" />
                  </div>
                )}

                <div className="mb-8" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="luxury-card p-5 flex flex-wrap items-center gap-6 text-xs text-[#6B82A0]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-[#C9A84C]/30 bg-[#0F1A2E]" />
          <span>Memorial saved</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={11} className="text-[#C9A84C]" />
          <span>GPS location recorded</span>
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink size={11} className="text-[#C9A84C]" />
          <span>Public memorial (hover to view)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-px border-t border-dashed border-[#1E2A3D]" />
          <span>Empty slot — click to add</span>
        </div>
      </div>
    </div>
  );
}
