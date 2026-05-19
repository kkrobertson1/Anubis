import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: `By creating an account and using the ANUBIS Memorial Community Platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.`,
  },
  {
    title: "Membership & Payment",
    body: `A one-time membership fee of $35 USD grants you lifetime access to 28 memorial slots. This is a non-refundable fee. All payments are processed securely through Helcim or PayPal. ANUBIS does not store your payment card details.`,
  },
  {
    title: "User Content",
    body: `You retain ownership of all photos, obituaries, biographies, and other content you upload. By uploading content, you grant ANUBIS a non-exclusive license to store and display it as part of the platform. You are solely responsible for ensuring you have the right to upload any content.`,
  },
  {
    title: "Prohibited Use",
    body: `You agree not to use the platform for any unlawful purpose, to harass or harm others, to upload content that is offensive or defamatory, or to attempt to gain unauthorized access to other accounts or systems.`,
  },
  {
    title: "Location Data",
    body: `Gravesite coordinates entered on the platform are stored and may be used to notify other members of nearby memorials. You may choose to keep individual profiles private, which will exclude them from location matching.`,
  },
  {
    title: "Guest Book",
    body: `Guest book entries on public profiles are visible to all visitors. ANUBIS reserves the right to remove entries that violate these terms. The profile owner may contact support to request removal of specific entries.`,
  },
  {
    title: "Account Termination",
    body: `ANUBIS reserves the right to suspend or terminate accounts that violate these terms. In the event of termination, no refund of the membership fee will be issued.`,
  },
  {
    title: "Limitation of Liability",
    body: `ANUBIS is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid for your membership.`,
  },
  {
    title: "Changes to Terms",
    body: `We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised Terms. We will make reasonable efforts to notify members of significant changes.`,
  },
  {
    title: "Contact",
    body: `For any questions regarding these Terms, please contact us at support@anubiskemet2.com.`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1A] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-8">
            <Image src="/logo.png" alt="ANUBIS" width={38} height={12} className="object-contain" />
            <span className="font-display text-xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-3">Legal</p>
          <h1 className="font-display text-4xl font-light text-[#EDE8DC] mb-2">Terms of Service</h1>
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
