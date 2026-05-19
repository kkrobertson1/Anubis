import Image from "next/image";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1A] flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="inline-flex items-center gap-2 justify-center mb-12">
        <Image src="/logo.png" alt="ANUBIS" width={46} height={15} className="object-contain" />
        <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
      </Link>

      {/* Icon */}
      <div className="w-20 h-20 rounded-full border border-[#C9A84C]/40 flex items-center justify-center mb-8">
        <svg className="w-9 h-9 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Payment Confirmed</p>
      <h1 className="font-display text-4xl md:text-5xl font-light text-[#EDE8DC] mb-4">
        Welcome to ANUBIS
      </h1>
      <div className="gold-divider max-w-xs mx-auto mb-6" />
      <p className="text-[#A09880] max-w-md leading-relaxed mb-10">
        Your memorial account is now active. You have 28 slots ready to honor the lives of those
        you love. Begin adding gravesite profiles from your dashboard.
      </p>

      <Link
        href="/dashboard"
        className="px-10 py-3 bg-[#C9A84C] text-[#0A0F1A] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors duration-300 cursor-pointer gold-glow"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
