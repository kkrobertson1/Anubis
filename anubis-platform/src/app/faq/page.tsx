import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Frequently Asked Questions — ANUBIS Memorial Community Platform",
  description:
    "Answers to common questions about the ANUBIS app, membership, memorials, and how our gravesite locator platform works.",
};

const FAQS = [
  {
    question: "Do I have to be a member of the community page to use ANUBIS?",
    answer:
      "No, you don't have to be a member to use the ANUBIS App. However, you do have to be a registered member to save gravesite locations, upload photos, interact with the community, and access all of the memorial features.",
  },
  {
    question: "Does the ANUBIS app work in other places outside of the United States?",
    answer:
      "At this time, the ANUBIS database only has cemetery locations in the United States. We continue to expand our database and may add international locations in the future.",
  },
  {
    question: "Does ANUBIS mapping only work when you're at a cemetery location?",
    answer:
      "If you have a physical map of your cemetery and you know the gravesite location, you can pull up that cemetery, plot the location, press start, and ANUBIS will map you from your current position to your plotted gravesite location. Most cemeteries have their maps posted at their location, so most users will be mapping from their cemetery location.",
  },
  {
    question: "What if I cannot find my cemetery in the ANUBIS database?",
    answer:
      "If a cemetery is not yet listed, we offer quick additions within 2–3 business days upon request. Just reach out through our contact page with the cemetery name, address, city, state, and zip code, and we'll get it added to the database.",
  },
  {
    question: "If I become a member of the community, will the information I upload become public on the community page?",
    answer:
      "As a member you will be able to choose what memorials you want to be public or private. However, the community page is designed to notify you if someone saves the same gravesite location you have — at that point you will have the option to stay anonymous or acknowledge them.",
  },
  {
    question: "Will I be able to add memorials to my account that are not family or friends?",
    answer:
      "Yes, you will be able to name your memorial as family, friends, famous, historical, etc. Members can honor and preserve the memory of anyone who is meaningful to them, whether a loved one or a notable figure they wish to commemorate.",
  },
  {
    question: "How many slots do I get for my membership? Can I request more slots?",
    answer:
      "Your account will have 28 memorial slots. If you need more, you can request additional slots for a fee. We offer tiered packages: 10 additional slots for $8, 100 slots for $60, 250 slots for $140, and 500 slots for $280, up to a maximum of 1,000 total slots per account.",
  },
  {
    question: "Can I customize my account page?",
    answer:
      "At this time, the account pages have a standard look for all members to keep the experience consistent across the platform. As the platform evolves, we may introduce customization options in the future.",
  },
  {
    question: "Will I be able to access my account on my desktop and cell phone?",
    answer:
      "Yes, your account will work on both PC and Mac desktops, as well as Android and iPhone mobile devices. The platform is fully responsive and accessible from any device with a web browser.",
  },
  {
    question: "If I am being harassed or see something offensive or defamatory, what can I do?",
    answer:
      "All members agree to the Terms and Conditions of this platform when they sign up. If these terms are violated, the offending account will be terminated immediately after an investigation has identified the violation. If you encounter inappropriate content or harassment, please contact us right away and we will take prompt action.",
  },
];

export default async function FAQPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#0A0F1A]">
      <Navbar isLoggedIn={!!user} />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Help Center</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-[#EDE8DC] mb-4">
            Frequently Asked Questions
          </h1>
          <div className="gold-divider max-w-[200px] mx-auto my-6" />
          <p className="text-[#A09880] text-sm max-w-xl mx-auto">
            Everything you need to know about using ANUBIS. Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" className="text-[#C9A84C] hover:text-[#D4AF37] transition-colors underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-5">
          {FAQS.map((faq, i) => (
            <div key={i} className="luxury-card p-8">
              <h2 className="font-display text-xl text-[#EDE8DC] mb-3 flex items-start gap-3">
                <span className="text-[#C9A84C] text-sm mt-1.5">Q{i + 1}.</span>
                <span>{faq.question}</span>
              </h2>
              <div className="gold-divider mb-4" />
              <p className="text-sm text-[#A09880] leading-relaxed pl-8">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto luxury-card p-10 text-center">
          <p className="text-[10px] tracking-[0.5em] text-[#C9A84C] uppercase mb-3">Still Have Questions?</p>
          <h2 className="font-display text-3xl font-light text-[#EDE8DC] mb-4">
            We&apos;re here to help
          </h2>
          <p className="text-sm text-[#A09880] mb-6 max-w-md mx-auto">
            If your question wasn&apos;t answered above, please reach out to our team directly and we&apos;ll get back to you.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 border border-[#C9A84C] text-[#C9A84C] text-xs tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>
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
            <Link href="/faq" className="text-xs tracking-widest text-[#C9A84C] uppercase transition-colors">FAQ</Link>
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
