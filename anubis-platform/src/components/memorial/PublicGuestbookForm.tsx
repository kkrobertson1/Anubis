"use client";

import { useState } from "react";
import { addGuestbookEntry } from "@/app/actions/gravesite";

export default function PublicGuestbookForm({ gravesiteId }: { gravesiteId: string }) {
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
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="px-4 py-6 text-center border border-[#C9A84C]/20 bg-[#C9A84C]/5 rounded">
        <p className="text-[#C9A84C] text-sm mb-1">Thank you</p>
        <p className="text-xs text-[#5a5a6a]">Your tribute has been added to the guest book.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-xs text-red-600 px-3 py-2 bg-red-50 border border-red-200 rounded">
          {error}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="visitor_name"
          required
          placeholder="Your name"
          className="w-full bg-white border border-[#d1c4e9] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#9e9e9e] focus:outline-none focus:border-[#C9A84C] transition-colors rounded"
        />
        <textarea
          name="message"
          required
          rows={1}
          placeholder="Leave a tribute or memory..."
          className="w-full bg-white border border-[#d1c4e9] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#9e9e9e] focus:outline-none focus:border-[#C9A84C] transition-colors resize-none rounded"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50 rounded"
      >
        {loading ? "Submitting..." : "Leave a Tribute"}
      </button>
    </form>
  );
}
