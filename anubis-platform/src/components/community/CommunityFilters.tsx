"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

export default function CommunityFilters({
  states,
  currentState,
  currentQ,
}: {
  states: readonly string[];
  currentState?: string;
  currentQ?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(currentQ ?? "");

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const state = overrides.state ?? searchParams.get("state") ?? undefined;
    const search = overrides.q ?? searchParams.get("q") ?? undefined;
    if (state) params.set("state", state);
    if (search) params.set("q", search);
    return `/community${params.toString() ? `?${params}` : ""}`;
  }

  function onStateChange(s: string) {
    startTransition(() => {
      router.push(buildUrl({ state: s || undefined, q: q || undefined }));
    });
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(buildUrl({ q: q || undefined }));
    });
  }

  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <form onSubmit={onSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name..."
            className="w-full bg-white border border-[#d1c4e9] pl-9 pr-4 py-2.5 text-sm text-[#1a1a2e] placeholder-[#9e9e9e] focus:outline-none focus:border-[#C9A84C] transition-colors rounded"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50 rounded"
        >
          Search
        </button>
      </form>

      {/* State filter */}
      <select
        value={currentState ?? ""}
        onChange={(e) => onStateChange(e.target.value)}
        disabled={isPending}
        className="bg-white border border-[#d1c4e9] px-4 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#C9A84C] transition-colors min-w-[160px] disabled:opacity-50 rounded"
      >
        <option value="">All States</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
