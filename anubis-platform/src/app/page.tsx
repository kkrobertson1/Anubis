import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import AdUnit from "@/components/AdUnit";
import { createClient } from "@/lib/supabase/server";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1920&q=85",
  flowers: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&h=600&q=80",
  candle: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&h=600&q=80",
  phone: "https://images.unsplash.com/photo-1693598746464-038b578a32e9?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=800&h=1000&fit=crop",
  cemetery: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&h=800&q=80",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#0A0F1A]">
      <Navbar isLoggedIn={!!user} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <Image
          src={IMAGES.hero}
          alt="Autumn forest with warm earthy tones"
          fill
          className="object-cover opacity-55"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0F05]/30 via-transparent to-[#0A0F1A]" />
        <div className="relative text-center max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-6">
            RR&amp;W Presents
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light text-[#EDE8DC] leading-tight mb-6">
            Honor Their
            <span className="block text-gold-gradient italic">Memory</span>
          </h1>
          <div className="gold-divider my-8 max-w-xs mx-auto" />
          <p className="text-lg text-[#EDE8DC]/75 leading-relaxed max-w-2xl mx-auto mb-12 font-light">
            Save gravesite locations, preserve stories, and connect with others
            who share the same sacred ground. Never lose your way to those who matter most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-10 py-4 bg-[#C9A84C] text-[#0D0D0D] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-all duration-300 gold-glow"
            >
              Create Your Memorial
            </Link>
            <Link
              href="#how-it-works"
              className="px-10 py-4 border border-[#EDE8DC]/50 text-[#EDE8DC]/80 text-sm tracking-widest uppercase hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
          <p className="text-xs text-[#EDE8DC]/50 mt-8 tracking-wider">
            One-time account creation · 28 memorial slots · Lifetime access
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[#1E2A3D]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "400+", label: "Community Members" },
            { value: "134K+", label: "Cemetery Locations" },
            { value: "50 States", label: "Coverage" },
            { value: "Android & iOS", label: "App Available" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl md:text-4xl font-light text-[#C9A84C] mb-2">
                {stat.value}
              </p>
              <p className="text-xs tracking-widest text-[#6B82A0] uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">The Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-[#EDE8DC]">
              How It Works
            </h2>
            <div className="gold-divider my-6 max-w-xs mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Locate the Gravesite",
                description:
                  "Use the ANUBIS app to navigate to any cemetery across 50 states. Plot the exact gravesite location and capture the precise latitude and longitude.",
                image: IMAGES.phone,
                alt: "Person using phone in the dark",
              },
              {
                step: "02",
                title: "Create Your Memorial",
                description:
                  "Save the gravesite to your account. Upload photos, obituaries, and stories. Each slot is dedicated to a family member, friend, or loved one.",
                image: IMAGES.candle,
                alt: "Memorial candle burning in the dark",
              },
              {
                step: "03",
                title: "Connect & Remember",
                description:
                  "When others visit the same gravesite, you will be notified. Choose to connect, share memories, and discover unexpected family connections.",
                image: IMAGES.flowers,
                alt: "Flowers on a grave",
              },
            ].map((item) => (
              <div key={item.step} className="luxury-card overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                  <p className="absolute bottom-4 left-6 font-display text-4xl font-light text-[#C9A84C]/50">
                    {item.step}
                  </p>
                </div>
                <div className="p-8">
                  <h3 className="font-display text-xl font-medium text-[#C9A84C] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-[#A09880] leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Video */}
      <section className="py-24 px-6 bg-[#080D16]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">See It In Action</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-[#EDE8DC]">
              How the ANUBIS App Works
            </h2>
            <div className="gold-divider my-6 max-w-xs mx-auto" />
            <p className="text-[#A09880] text-sm max-w-xl mx-auto">
              Watch how easy it is to locate, save, and share gravesite locations using the ANUBIS mobile app.
            </p>
          </div>
          <div className="relative w-full aspect-video border border-[#1E2A3D]">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="How the ANUBIS App Works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <p className="text-xs text-[#3A4A5E] text-center mt-4">
            Available on Android and iOS
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">What You Get</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-[#EDE8DC]">
              A Living Memorial
            </h2>
            <div className="gold-divider my-6 max-w-xs mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "28 Memorial Slots", desc: "Dedicated slots for parents, grandparents, siblings, aunts, uncles, cousins, friends, and others." },
              { title: "Photo & Obituary Upload", desc: "Preserve photos, official obituaries, and personal documents for each memorial profile." },
              { title: "Gravesite Navigation", desc: "Precise lat/long coordinates guide you directly to the gravesite — within feet." },
              { title: "Virtual Guest Book", desc: "Let others sign and leave messages of remembrance on each memorial profile." },
              { title: "Location Matching", desc: "Get notified when another member saves the same gravesite. Discover shared connections." },
              { title: "Community Network", desc: "Opt in to connect with others who share your loved ones. Trace family trees together." },
            ].map((feature) => (
              <div key={feature.title} className="p-6 border border-[#1E2A3D] hover:border-[#C9A84C]/40 transition-colors duration-300 group">
                <div className="w-8 h-px bg-[#C9A84C] mb-4 group-hover:w-16 transition-all duration-300" />
                <h3 className="font-display text-lg font-medium text-[#EDE8DC] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#A09880] text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Simple Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-[#EDE8DC]">
              One Investment, Lifetime Access
            </h2>
            <div className="gold-divider my-6 max-w-xs mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="luxury-card p-10 text-center">
              <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-4">Foundation</p>
              <p className="font-display text-6xl font-light text-[#C9A84C] mb-2">$35</p>
              <p className="text-xs text-[#6B82A0] tracking-wider mb-8">One-Time Fee</p>
              <ul className="text-sm text-[#A09880] space-y-3 mb-10 text-left">
                {[
                  "28 memorial slots",
                  "Photo & obituary uploads",
                  "Gravesite navigation",
                  "Virtual guest book",
                  "Community access",
                  "Location match notifications",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="text-[#C9A84C] text-xs">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 bg-[#C9A84C] text-[#0D0D0D] text-sm tracking-widest uppercase hover:bg-[#D4AF37] transition-colors duration-300"
              >
                Get Started
              </Link>
            </div>
            <div className="border border-[#1E2A3D] p-10 text-center">
              <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-4">Expanded</p>
              <p className="font-display text-6xl font-light text-[#C9A84C] mb-2">$8</p>
              <p className="text-xs text-[#6B82A0] tracking-wider mb-8">Starting at $8 for +10 Slots</p>
              <ul className="text-sm text-[#A09880] space-y-2 mb-10 text-left">
                {[
                  "+10 slots — $8",
                  "+100 slots — $60",
                  "+250 slots — $140",
                  "+500 slots — $280",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="text-[#C9A84C] text-xs">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 border border-[#C9A84C] text-[#C9A84C] text-sm tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
              >
                Start with Foundation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 bg-[#0F1A2E]">
        <Image
          src={IMAGES.cemetery}
          alt="Misty cemetery"
          fill
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-[#0F1A2E]/80" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-6">Begin Today</p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-[#EDE8DC] leading-tight mb-6">
            Their Story
            <span className="block italic text-gold-gradient">Deserves to Live On</span>
          </h2>
          <div className="gold-divider my-8 max-w-xs mx-auto" />
          <p className="text-[#A09880] leading-relaxed mb-10">
            Join a community dedicated to preserving the memory of those we have lost.
            Never struggle to find a gravesite again.
          </p>
          <Link
            href="/register"
            className="inline-block px-12 py-4 bg-[#C9A84C] text-[#0D0D0D] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-all duration-300 gold-glow"
          >
            Create Your Memorial
          </Link>
        </div>
      </section>

      {/* Cemetery Submission */}
      <section className="py-16 px-6 border-t border-[#1E2A3D]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Can&apos;t Find a Cemetery?</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-[#EDE8DC] mb-4">
            Submit a New Cemetery Location
          </h2>
          <div className="gold-divider my-6 max-w-xs mx-auto" />
          <p className="text-[#A09880] text-sm leading-relaxed max-w-xl mx-auto mb-8">
            Our database covers 134,000+ cemetery locations across all 50 states. If you can&apos;t find a cemetery near you, let us know and we&apos;ll work to add it.
          </p>
          <a
            href="mailto:anubiskemet2@gmail.com?subject=New Cemetery Submission&body=Cemetery Name:%0ACemetery Address:%0ACity:%0AState:%0AZip Code:%0AAdditional Notes:"
            className="inline-flex items-center gap-3 px-8 py-4 border border-[#C9A84C] text-[#C9A84C] text-sm tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
          >
            Submit Cemetery Information
          </a>
          <p className="text-xs text-[#3A4A5E] mt-4">
            Opens your email client with a pre-filled form
          </p>
        </div>
      </section>

      {/* Ad — Homepage */}
      <section className="px-6 py-4 max-w-4xl mx-auto">
        <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? ""} />
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#1E2A3D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Image src="/AunbisTheme.png" alt="ANUBIS" width={120} height={40} className="object-contain" />
            <p className="text-xs text-[#6B82A0] tracking-wider mt-1">A RR&amp;W Platform</p>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-8 justify-center">
            <Link href="/about" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">About</Link>
            <Link href="/faq" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">FAQ</Link>
            <Link href="/contact" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Contact</Link>
            <Link href="/privacy" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Terms</Link>
            <Link href="/disclaimer" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Disclaimer</Link>
          </div>
          <p className="text-xs text-[#6B82A0]">
            © {new Date().getFullYear()} RR&amp;W. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
