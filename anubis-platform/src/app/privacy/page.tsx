import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: `We collect information you provide when creating an account (name, email, password), completing payment, and adding memorial profiles (names, dates, cemetery information, GPS coordinates, biographical content, and photos). We also collect standard server logs including IP addresses and browser types.`,
  },
  {
    title: "How We Use Your Information",
    body: `We use your information to provide and improve the platform, process payments, send account-related notifications (location matches, guest book activity, connection requests), and respond to support requests. We do not sell your personal information to third parties.`,
  },
  {
    title: "Location Data",
    body: `GPS coordinates you enter for gravesites are stored and used solely to power the location matching feature — alerting members whose loved ones are buried near one another. Profiles marked as private are excluded from location matching and public searches.`,
  },
  {
    title: "Data Sharing",
    body: `We share data with third-party service providers only as necessary to operate the platform: Supabase (database & authentication), Cloudinary (media storage), Helcim and PayPal (payment processing), and Vercel (hosting). Each provider is bound by their own privacy policies and data processing agreements.`,
  },
  {
    title: "Public Profiles",
    body: `Memorial profiles set to "public" are visible to all visitors. Guest book entries on public profiles are visible to anyone who views that profile. You may switch any profile to private at any time from your dashboard.`,
  },
  {
    title: "Data Security",
    body: `We use industry-standard security measures including encrypted connections (HTTPS/TLS), hashed passwords, and row-level security policies on our database. No system is completely secure, and we cannot guarantee absolute security of your data.`,
  },
  {
    title: "Data Retention",
    body: `Your account and memorial data is retained for as long as your account is active. You may request deletion of your account and associated data by contacting support. Note that guest book entries written by others may be retained separately.`,
  },
  {
    title: "Your Rights",
    body: `You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at support@anubiskemet2.com. We will respond to valid requests within 30 days.`,
  },
  {
    title: "Cookies",
    body: `We use session cookies to maintain your logged-in state. We do not use tracking or advertising cookies. You may disable cookies in your browser settings, but this may prevent you from logging in.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy periodically. We will notify members of material changes via email or a notice on the platform. Continued use after changes constitutes acceptance of the revised policy.`,
  },
  {
    title: "Contact",
    body: `For privacy-related questions or requests, contact us at support@anubiskemet2.com.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1A] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-8">
            <Image src="/logo.png" alt="ANUBIS" width={38} height={12} className="object-contain" />
            <span className="font-display text-xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-3">Legal</p>
          <h1 className="font-display text-4xl font-light text-[#EDE8DC] mb-2">Privacy Policy</h1>
          <div className="gold-divider max-w-[160px] mx-auto mt-4 mb-4" />
          <p className="text-xs text-[#6B82A0]">Last updated: March 2026</p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((section, i) => (
            <div key={section.title} className="luxury-card p-6">
              <p className="text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase mb-2">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="font-display text-xl font-light text-[#EDE8DC] mb-3">{section.title}</h2>
              <p className="text-sm text-[#A09880] leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
