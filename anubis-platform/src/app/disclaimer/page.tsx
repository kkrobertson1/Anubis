import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Disclaimer — ANUBIS Memorial Community Platform",
  description: "Legal disclaimer for the ANUBIS Memorial Community Platform operated by RR&W.",
};

const SECTIONS = [
  {
    title: "General Information",
    body: `The information contained in this website is for general information purposes only. The information is provided by RR&W and while we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.`,
  },
  {
    title: "Limitation of Liability",
    body: `In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.`,
  },
  {
    title: "External Links",
    body: `Through this website you are able to link to other websites which are not under the control of RR&W. We have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.`,
  },
  {
    title: "Availability",
    body: `Every effort is made to keep the website up and running smoothly. However, RR&W takes no responsibility for, and will not be liable for, the website being temporarily unavailable due to technical issues beyond our control.`,
  },
];

export default async function DisclaimerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#0A0F1A]">
      <Navbar isLoggedIn={!!user} />

      {/* Hero */}
      <section className="relative pt-40 pb-12 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Legal</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-[#EDE8DC] mb-4">
            Disclaimer
          </h1>
          <div className="gold-divider max-w-[200px] mx-auto my-6" />
        </div>
      </section>

      {/* Sections */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="luxury-card p-8">
              <h2 className="font-display text-xl text-[#EDE8DC] mb-4">{section.title}</h2>
              <div className="gold-divider mb-4" />
              <p className="text-sm text-[#A09880] leading-relaxed">{section.body}</p>
            </div>
          ))}
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
            <Link href="/contact" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Contact</Link>
            <Link href="/privacy" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Terms</Link>
            <Link href="/disclaimer" className="text-xs tracking-widest text-[#C9A84C] uppercase transition-colors">Disclaimer</Link>
          </div>
          <p className="text-xs text-[#6B82A0]">© {new Date().getFullYear()} RR&amp;W. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
