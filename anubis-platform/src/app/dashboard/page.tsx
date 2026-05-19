import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Bell, Users, Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: gravesites }, { count: notifCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase
        .from("gravesite_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_read", false),
    ]);

  const slotsTotal = profile?.slots_total ?? 28;
  const slotsUsed = gravesites?.length ?? 0;
  const slotsRemaining = slotsTotal - slotsUsed;

  const slots = Array.from({ length: slotsTotal }, (_, i) => gravesites?.[i] ?? null);

  return (
    <div className="pt-16 lg:pt-0">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">
          Member Dashboard
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-light text-[#EDE8DC]">
          Welcome back, {profile?.first_name}
        </h1>
        <div className="gold-divider max-w-[200px] mt-4" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Slots", value: slotsTotal, icon: MapPin },
          { label: "Memorials Added", value: slotsUsed, icon: Users },
          { label: "Slots Available", value: slotsRemaining, icon: Plus },
          { label: "Unread Notifications", value: notifCount ?? 0, icon: Bell },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="luxury-card p-5">
            <div className="flex items-start justify-between mb-3">
              <Icon size={15} className="text-[#C9A84C] mt-0.5" />
              <span className="font-display text-3xl text-[#EDE8DC]">{value}</span>
            </div>
            <p className="text-xs text-[#6B82A0] tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Slots grid header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-1">
            Memorial Slots
          </p>
          <p className="text-[#6B82A0] text-sm">
            {slotsUsed} of {slotsTotal} slots used
          </p>
        </div>
        {slotsRemaining > 0 && (
          <Link
            href="/dashboard/gravesite/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors"
          >
            <Plus size={13} />
            Add Memorial
          </Link>
        )}
      </div>

      {/* 28-slot grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slots.map((slot, i) =>
          slot ? (
            <Link
              key={slot.id}
              href={`/dashboard/gravesite/${slot.id}`}
              className="luxury-card p-5 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider">
                  Slot {i + 1}
                </p>
              </div>
              <p className="font-display text-lg leading-snug text-[#EDE8DC] group-hover:text-[#C9A84C] transition-colors mb-1">
                {slot.deceased_name}
              </p>
              {slot.cemetery_name && (
                <p className="text-xs text-[#6B82A0] truncate">{slot.cemetery_name}</p>
              )}
              {slot.latitude && slot.longitude && (
                <div className="flex items-center gap-1 mt-3">
                  <MapPin size={10} className="text-[#C9A84C]" />
                  <span className="text-[10px] text-[#C9A84C]">Location saved</span>
                </div>
              )}
            </Link>
          ) : (
            <Link
              key={`empty-${i}`}
              href="/dashboard/gravesite/new"
              className="luxury-card p-5 border-dashed flex flex-col items-center justify-center min-h-[130px] group hover:border-[#C9A84C]/40 transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-full border border-[#1E2A3D] group-hover:border-[#C9A84C]/40 flex items-center justify-center mb-2 transition-colors duration-300">
                <Plus size={14} className="text-[#2A3A4E] group-hover:text-[#C9A84C] transition-colors duration-300" />
              </div>
              <p className="text-xs text-[#3A4A5E] group-hover:text-[#6B82A0] transition-colors">
                Add Memorial
              </p>
              <p className="text-[10px] text-[#2A3A4E] mt-0.5">Slot {i + 1}</p>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
