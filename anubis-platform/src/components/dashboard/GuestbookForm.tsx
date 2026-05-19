"use client";

import { useState } from "react";
import { addGuestbookEntry } from "@/app/actions/gravesite";

export default function GuestbookForm({ gravesiteId }: { gravesiteId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const result = await addGuestbookEntry(gravesiteId, new FormData(form));

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      form.reset();
      setTimeout(() => setSuccess(false), 4000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-xs text-red-400 px-3 py-2 bg-red-900/20 border border-red-800/30">
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-[#C9A84C] px-3 py-2 bg-[#C9A84C]/5 border border-[#C9A84C]/20">
          Your tribute has been added.
        </p>
      )}
      <input
        name="visitor_name"
        required
        placeholder="Your name"
        className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="Leave a tribute or memory..."
        className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Leave a Tribute"}
      </button>
    </form>
  );
}
