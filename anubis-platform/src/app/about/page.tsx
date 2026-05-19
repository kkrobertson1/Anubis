import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "About Us — ANUBIS Memorial Community Platform",
  description:
    "Learn about the story behind ANUBIS and the RR&W team dedicated to helping families locate and honor their loved ones.",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#0A0F1A]">
      <Navbar isLoggedIn={!!user} />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-[#EDE8DC] mb-4">
            About Us
          </h1>
          <div className="gold-divider max-w-[200px] mx-auto my-6" />
        </div>
      </section>

      {/* Story */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="luxury-card p-8 md:p-12 space-y-6 text-[#A09880] text-sm leading-relaxed">
            <p>
              After losing a loved one, one of the founding members (Dennis Winkler) of RR&amp;W
              visited a cemetery and was unable to locate his brother&apos;s grave. In that moment of
              grief, confusion, and frustration, he realized how many families may face this same
              challenge. From that experience, we (RR&amp;W) were inspired to create something that
              could bring comfort, clarity, and ease during such an emotional time.
            </p>

            <p>
              Over the past several years, RR&amp;W developed ANUBIS, a gravesite locator
              application designed to help individuals quickly and accurately find the final resting
              place of their loved ones. Our database currently includes over 134,000 cemeteries, and
              we continue to expand daily.
            </p>

            <div className="border-l-2 border-[#C9A84C]/30 pl-6 py-2">
              <p className="text-[10px] tracking-[0.4em] text-[#C9A84C] uppercase mb-4">
                Our Mission
              </p>
              <p className="mb-4">
                ANUBIS is designed to support families, funeral homes, and cemetery staff by:
              </p>
              <ul className="space-y-3">
                {[
                  "Helping families locate gravesites with ease",
                  "Reducing the burden on staff for directions and assistance",
                  "Enhancing the overall service experience at cemeteries on weekends and after hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#C9A84C] text-xs mt-0.5">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              We also have a community page where you can create your own memorial. Save the
              gravesite to your account. Upload photos, obituaries, and stories — each one dedicated
              to a family member, friend, or loved one.{" "}
              If a cemetery is not yet listed, we offer quick additions within 2–3 business days{" "}
              <Link
                href="/contact"
                className="text-[#C9A84C] hover:text-[#D4AF37] transition-colors underline"
              >
                upon request
              </Link>
              .
            </p>

            <p>
              The app is currently available on the Google Play Store and Apple App Store. You can
              also access the app through our landing page.
            </p>

            <p>
              We are honored to have ANUBIS available as a resource to aid families and loved ones.
            </p>

            <p className="italic text-[#EDE8DC]/80">
              May ANUBIS provide less stress and relief for your families during their most difficult
              times.
            </p>

            <div className="pt-4 border-t border-[#1E2A3D]">
              <p className="text-[#C9A84C] font-medium">With respect,</p>
              <p className="text-[#EDE8DC]">RR&amp;W / ANUBIS App</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "134K+", label: "Cemeteries" },
            { value: "400+", label: "Members" },
            { value: "50", label: "US States" },
            { value: "2", label: "Mobile Apps" },
          ].map((stat) => (
            <div key={stat.label} className="luxury-card p-5 text-center">
              <p className="font-display text-2xl text-[#C9A84C] mb-1">{stat.value}</p>
              <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto luxury-card p-10 text-center">
          <h2 className="font-display text-2xl font-light text-[#EDE8DC] mb-4">
            Ready to honor your loved ones?
          </h2>
          <p className="text-sm text-[#A09880] mb-6">
            Join the ANUBIS community and never struggle to find a gravesite again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-[#C9A84C] text-[#C9A84C] text-xs tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
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
            <Link href="/about" className="text-xs tracking-widest text-[#C9A84C] uppercase transition-colors">About</Link>
            <Link href="/faq" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">FAQ</Link>
            <Link href="/contact" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Contact</Link>
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
