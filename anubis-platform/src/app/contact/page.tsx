import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Mail, MapPin, Smartphone } from "lucide-react";

export const metadata = {
  title: "Contact Us — ANUBIS Memorial Community Platform",
  description:
    "Get in touch with the ANUBIS team. Submit new cemetery locations, ask questions, or share feedback.",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#0A0F1A]">
      <Navbar isLoggedIn={!!user} />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Get In Touch</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-[#EDE8DC] mb-4">
            Contact Us
          </h1>
          <div className="gold-divider max-w-[200px] mx-auto my-6" />
          <p className="text-[#A09880] text-sm max-w-xl mx-auto">
            Have a question, need help, or want to submit a new cemetery location? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {/* General inquiries */}
          <div className="luxury-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={16} className="text-[#C9A84C]" />
              <p className="text-[10px] tracking-[0.4em] text-[#C9A84C] uppercase">General Inquiries</p>
            </div>
            <div className="gold-divider mb-6" />
            <p className="text-sm text-[#A09880] leading-relaxed mb-6">
              For questions about ANUBIS, your membership, account issues, or general feedback, reach out to us directly.
            </p>
            <a
              href="mailto:anubiskemet2@gmail.com?subject=General Inquiry"
              className="inline-flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#D4AF37] transition-colors"
            >
              <Mail size={13} />
              anubiskemet2@gmail.com
            </a>
          </div>

          {/* Cemetery submissions */}
          <div className="luxury-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={16} className="text-[#C9A84C]" />
              <p className="text-[10px] tracking-[0.4em] text-[#C9A84C] uppercase">Submit a Cemetery</p>
            </div>
            <div className="gold-divider mb-6" />
            <p className="text-sm text-[#A09880] leading-relaxed mb-6">
              Can&apos;t find a cemetery in our database? Let us know and we&apos;ll add it within 2–3 business days. Please include the cemetery name, address, city, state, and zip code.
            </p>
            <a
              href="mailto:anubiskemet2@gmail.com?subject=New Cemetery Submission&body=Cemetery Name:%0ACemetery Address:%0ACity:%0AState:%0AZip Code:%0AAdditional Notes:"
              className="inline-block px-6 py-2.5 border border-[#C9A84C] text-[#C9A84C] text-xs tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
            >
              Submit Cemetery
            </a>
          </div>
        </div>
      </section>

      {/* App availability */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto luxury-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone size={16} className="text-[#C9A84C]" />
            <p className="text-[10px] tracking-[0.4em] text-[#C9A84C] uppercase">Download the App</p>
          </div>
          <div className="gold-divider mb-6" />
          <p className="text-sm text-[#A09880] leading-relaxed mb-4">
            The ANUBIS app is available on both major platforms. Use it to locate gravesites, save GPS coordinates, and transfer locations directly to your memorial profile on the website.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="text-xs text-[#6B82A0] border border-[#1E2A3D] px-4 py-2">
              Google Play Store
            </span>
            <span className="text-xs text-[#6B82A0] border border-[#1E2A3D] px-4 py-2">
              Apple App Store
            </span>
          </div>
        </div>
      </section>

      {/* Company info */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-[#6B82A0] tracking-wider">
            RR&amp;W — Dedicated to preserving the memory of those we love.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#1E2A3D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Image src="/AunbisTheme.png" alt="ANUBIS" width={120} height={40} className="object-contain" />
            <p className="text-xs text-[#6B82A0] tracking-wider mt-1">A RR&amp;W Platform</p>
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">About</Link>
            <Link href="/faq" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">FAQ</Link>
            <Link href="/contact" className="text-xs tracking-widest text-[#C9A84C] uppercase transition-colors">Contact</Link>
            <Link href="/privacy" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Terms</Link>
            <Link href="/disclaimer" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Disclaimer</Link>
          </div>
          <p className="text-xs text-[#6B82A0]">© {new Date().getFullYear()} RR&amp;W. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
