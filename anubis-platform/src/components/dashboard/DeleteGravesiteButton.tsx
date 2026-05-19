"use client";

import { useState } from "react";
import { deleteGravesite } from "@/app/actions/gravesite";
import { Trash2 } from "lucide-react";

export default function DeleteGravesiteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteGravesite(id);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#6B82A0]">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-red-900/30 border border-red-800/40 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-xs border border-[#1E2A3D] text-[#6B82A0] hover:text-[#EDE8DC] transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-4 py-2 border border-[#1E2A3D] text-xs text-[#6B82A0] hover:text-red-400 hover:border-red-800/40 transition-colors"
    >
      <Trash2 size={12} />
      Delete
    </button>
  );
}
