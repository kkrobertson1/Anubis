import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ slots?: string }>;
}) {
  const { slots } = await searchParams;
  const slotsAdded = slots ? parseInt(slots, 10) : null;

  return (
    <div className="pt-16 lg:pt-0 max-w-lg mx-auto text-center">
      <div className="luxury-card p-12">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={28} className="text-[#C9A84C]" />
        </div>

        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-3">Upgrade Complete</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC] mb-4">
          Slots Added Successfully
        </h1>
        <div className="gold-divider max-w-[120px] mx-auto mb-6" />

        {slotsAdded && (
          <p className="text-sm text-[#A09880] mb-8">
            <span className="text-[#C9A84C] font-medium">+{slotsAdded} memorial slots</span> have
            been added to your account. You can start adding new memorials right away.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/gravesite/new"
            className="w-full py-3 bg-[#C9A84C] text-[#0A0F1A] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors gold-glow text-center"
          >
            Add a Memorial
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-3 border border-[#1E2A3D] text-sm text-[#6B82A0] hover:text-[#EDE8DC] hover:border-[#2A3A4E] transition-colors text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
