"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const PUBLISHER_ID = "ca-pub-2240572702544337";

// slot — the data-ad-slot value from your AdSense ad unit
// Returns null (renders nothing) if slot is not yet configured
export default function AdUnit({ slot }: { slot: string }) {
  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not loaded yet — script may still be initialising
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div className="my-6 w-full overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
