"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 border border-[#1E2A3D] text-xs text-[#6B82A0] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors"
    >
      {copied ? <Check size={12} className="text-[#C9A84C]" /> : <Share2 size={12} />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
