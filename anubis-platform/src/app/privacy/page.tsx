import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Privacy Policy — ANUBIS Memorial Community Platform",
  description:
    "How ANUBIS Memorial and RR&W collect, use, and protect your information.",
};

const EFFECTIVE_DATE = "May 30, 2026";

const THIRD_PARTIES: Array<{ name: string; purpose: string; url: string }> = [
  { name: "Google Maps and Google Navigation SDK", purpose: "location data for navigation", url: "https://policies.google.com/privacy" },
  { name: "Firebase Analytics and Crashlytics", purpose: "anonymous usage data", url: "https://policies.google.com/privacy" },
  { name: "Google AdMob", purpose: "advertising identifier", url: "https://policies.google.com/privacy" },
  { name: "Supabase", purpose: "database and authentication hosting", url: "https://supabase.com/privacy" },
  { name: "Vercel", purpose: "website hosting and media (photo/document) storage", url: "https://vercel.com/legal/privacy-policy" },
  { name: "Resend", purpose: "transactional email", url: "https://resend.com/legal/privacy-policy" },
  { name: "PayPal", purpose: "payment processing", url: "https://www.paypal.com/us/legalhub/privacy-full" },
  { name: "Helcim", purpose: "payment processing", url: "https://www.helcim.com/legal/privacy/" },
];

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#0A0F1A]">
      <Navbar isLoggedIn={!!user} />

      <section className="relative pt-40 pb-12 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-4">Legal</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-[#EDE8DC] mb-4">
            Privacy Policy
          </h1>
          <div className="gold-divider max-w-[200px] mx-auto my-6" />
          <p className="text-xs text-[#6B82A0] tracking-widest uppercase">
            Effective Date: {EFFECTIVE_DATE} &middot; Last Updated: {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto luxury-card p-8">
          <p className="text-sm text-[#A09880] leading-relaxed">
            This Privacy Policy describes how RR&amp;W (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) collects, uses, and shares information when you use the ANUBIS
            Memorial mobile application and the website located at anubiskemet2.com
            (together, the &ldquo;Service&rdquo;). It also explains your choices regarding
            the information we collect.
          </p>
          <p className="text-sm text-[#A09880] leading-relaxed mt-4">
            By using the Service, you agree to the terms of this Privacy Policy. If you do
            not agree, please do not use the Service.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <Section title="1. Who We Are">
            <p>
              The ANUBIS Memorial Service is operated by RR&amp;W. You can contact us at{" "}
              <a href="mailto:anubiskemet2@gmail.com" className="text-[#C9A84C] hover:underline">anubiskemet2@gmail.com</a>{" "}
              for any questions about this policy or your data.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection title="2.1 Location Information">
              <p>
                The ANUBIS mobile app collects your device&apos;s precise location data
                (including in the background, with your permission) for the sole purpose of
                providing turn-by-turn navigation to cemetery gravesites. Specifically:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>
                  <strong className="text-[#EDE8DC]">Foreground location</strong> is used to
                  display your current position on the map, to show your distance from a
                  selected gravesite, and to power turn-by-turn navigation when you start a
                  guidance session.
                </li>
                <li>
                  <strong className="text-[#EDE8DC]">Background location</strong> is used so
                  that turn-by-turn navigation can continue working when the screen is locked
                  or when you switch to another app. This is essential to safely follow
                  driving or walking directions to a gravesite without having to keep the
                  ANUBIS app in the foreground.
                </li>
                <li>
                  <strong className="text-[#EDE8DC]">Stored location</strong> is collected
                  only when you explicitly tap the &ldquo;Save to ANUBIS Website&rdquo;
                  button. In that case, the app captures the current GPS coordinates and
                  sends them to the ANUBIS website so you can record the exact gravesite
                  location to your memorial profile.
                </li>
              </ul>
              <p className="mt-3">
                We do not sell your location data, and we do not share it with advertisers or
                third parties for marketing purposes. Location data used for navigation is
                processed on your device and through the Google Maps and Google Navigation
                SDKs (see Section 4).
              </p>
            </SubSection>

            <SubSection title="2.2 Account Information">
              <p>When you create an account on anubiskemet2.com, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>First name and last name</li>
                <li>Email address</li>
                <li>Password (stored as a one-way hash, never in plain text)</li>
                <li>Profile photo (optional, if you upload one)</li>
              </ul>
            </SubSection>

            <SubSection title="2.3 Memorial Information">
              <p>When you create memorial records on the website, you provide:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Name of the deceased</li>
                <li>Optional dates of birth and death</li>
                <li>Optional relationship (e.g., parent, grandparent, friend)</li>
                <li>Optional cemetery name and state</li>
                <li>Optional gravesite GPS coordinates (from the mobile app&apos;s Save feature)</li>
                <li>Optional photos and videos</li>
                <li>Optional biographical text or memorial messages</li>
              </ul>
              <p className="mt-3">
                This information is provided voluntarily by you, the account holder. You may
                mark memorial profiles as private (visible only to you) or public (visible to
                anyone on anubiskemet2.com).
              </p>
            </SubSection>

            <SubSection title="2.4 Payment Information">
              <p>
                When you pay for an ANUBIS subscription or upgrade, payments are processed by
                our third-party providers, PayPal and Helcim. We do not store your full
                credit card or bank account information on our servers. We store only a
                transaction reference, the amount, and the date so we can keep records of
                your purchase.
              </p>
            </SubSection>

            <SubSection title="2.5 Analytics and Crash Data">
              <p>
                The mobile app uses Firebase Analytics and Firebase Crashlytics (operated by
                Google) to collect anonymous usage information (such as how often the app is
                opened, which screens are visited, and whether the app crashed). This data is
                aggregated, does not identify you personally, and is used solely to improve
                the app.
              </p>
            </SubSection>

            <SubSection title="2.6 Advertising Identifier">
              <p>
                The mobile app may display advertisements through Google AdMob. AdMob may
                collect your device&apos;s advertising identifier (a non-personal identifier
                that can be reset by you in your device settings) in order to serve relevant
                ads. You can opt out of personalized advertising at any time in your device
                settings.
              </p>
            </SubSection>

            <SubSection title="2.7 Cookies and Site Usage">
              <p>
                The anubiskemet2.com website uses standard cookies to keep you signed in and
                to remember your preferences. We also use Google Analytics (or equivalent) to
                understand traffic patterns to the website. You can disable cookies through
                your browser settings, though some parts of the website may not function
                properly if you do.
              </p>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>Operate the ANUBIS mobile app and website</li>
              <li>Provide turn-by-turn navigation to gravesites</li>
              <li>Save and display the memorials you create</li>
              <li>Process payments for subscriptions and upgrades</li>
              <li>Send transactional emails (account verification, password resets, payment receipts, family connection notifications)</li>
              <li>Diagnose technical issues and improve the Service</li>
              <li>Display advertisements where applicable</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not use your information to make automated decisions that have legal or
              significant effects on you.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>
              The ANUBIS Service uses the following third-party services. Each has its own
              privacy policy that governs how they handle data we send them:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              {THIRD_PARTIES.map((p) => (
                <li key={p.name}>
                  <strong className="text-[#EDE8DC]">{p.name}</strong> ({p.purpose}):{" "}
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline break-all">
                    {p.url}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3">We do not sell your personal data to any third party.</p>
          </Section>

          <Section title="5. Sharing of Information">
            <p>We share information only:</p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>With the third-party service providers listed above, as needed to operate the Service</li>
              <li>When you make a memorial public, the memorial&apos;s content (name, dates, photos, location, biography you wrote) becomes visible to all visitors of anubiskemet2.com</li>
              <li>If required by law, regulation, court order, or governmental request</li>
              <li>To protect our rights, safety, or property, or that of our users</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account information for as long as your account is active. If
              you delete your account, we will delete your personal account information and
              your private memorials within a reasonable time, except where we are required
              by law to retain certain records (for example, payment transaction records for
              tax purposes).
            </p>
            <p className="mt-3">
              Public memorials you have created may remain visible after account deletion
              unless you explicitly request their removal.
            </p>
          </Section>

          <Section title="7. Your Rights and Choices">
            <p>You may at any time:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong className="text-[#EDE8DC]">Access</strong> the personal information
                we hold about you by signing in to your account at anubiskemet2.com and
                visiting your profile page
              </li>
              <li>
                <strong className="text-[#EDE8DC]">Update or correct</strong> your account
                information through your profile page
              </li>
              <li>
                <strong className="text-[#EDE8DC]">Delete</strong> specific memorials,
                photos, or your entire account from the dashboard
              </li>
              <li>
                <strong className="text-[#EDE8DC]">Withdraw location permission</strong> at
                any time in your device&apos;s settings (note: turn-by-turn navigation will
                no longer work without location permission)
              </li>
              <li>
                <strong className="text-[#EDE8DC]">Opt out of personalized ads</strong> via
                your device&apos;s advertising settings
              </li>
              <li>
                <strong className="text-[#EDE8DC]">Contact us</strong> at{" "}
                <a href="mailto:anubiskemet2@gmail.com" className="text-[#C9A84C] hover:underline">
                  anubiskemet2@gmail.com
                </a>{" "}
                with any data privacy request
              </li>
            </ul>
            <p className="mt-3">
              If you are located in the European Economic Area, the United Kingdom, or
              California, you may have additional rights (such as the right to data
              portability or the right to file a complaint with a supervisory authority).
              Please contact us if you would like to exercise these rights.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              The ANUBIS Service is not intended for children under the age of 13. We do not
              knowingly collect personal information from children under 13. If you believe
              we have collected information from a child under 13, please contact us at{" "}
              <a href="mailto:anubiskemet2@gmail.com" className="text-[#C9A84C] hover:underline">
                anubiskemet2@gmail.com
              </a>{" "}
              and we will delete it.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              We use industry-standard security measures (HTTPS, encrypted password storage,
              role-based database access controls) to protect your information. However, no
              system is 100% secure, and we cannot guarantee absolute security. If a security
              breach affects your personal data, we will notify you as required by applicable
              law.
            </p>
          </Section>

          <Section title="10. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update
              the &ldquo;Last Updated&rdquo; date at the top and, for material changes,
              provide notice through the app or by email. Continued use of the Service after
              the change constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have questions or concerns about this Privacy Policy or our data
              practices, you can contact us at:
            </p>
            <div className="mt-3 text-[#EDE8DC]">
              <p className="font-semibold">RR&amp;W</p>
              <p>
                Email:{" "}
                <a href="mailto:anubiskemet2@gmail.com" className="text-[#C9A84C] hover:underline">
                  anubiskemet2@gmail.com
                </a>
              </p>
              <p>
                Website:{" "}
                <a href="https://www.anubiskemet2.com" className="text-[#C9A84C] hover:underline">
                  https://www.anubiskemet2.com
                </a>
              </p>
            </div>
          </Section>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-[#1E2A3D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Image src="/AunbisTheme.png" alt="ANUBIS" width={120} height={40} className="object-contain" />
            <p className="text-xs text-[#6B82A0] tracking-wider mt-1">A RR&amp;W Platform</p>
          </div>
          <div className="flex gap-8 flex-wrap justify-center">
            <Link href="/about" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">About</Link>
            <Link href="/faq" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">FAQ</Link>
            <Link href="/contact" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Contact</Link>
            <Link href="/privacy" className="text-xs tracking-widest text-[#C9A84C] uppercase transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="text-xs tracking-widest text-[#6B82A0] hover:text-[#C9A84C] uppercase transition-colors">Disclaimer</Link>
          </div>
          <p className="text-xs text-[#6B82A0]">© {new Date().getFullYear()} RR&amp;W. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="luxury-card p-8">
      <h2 className="font-display text-xl text-[#EDE8DC] mb-4">{title}</h2>
      <div className="gold-divider mb-4" />
      <div className="text-sm text-[#A09880] leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <h3 className="font-display text-base text-[#C9A84C] mb-2">{title}</h3>
      <div className="text-sm text-[#A09880] leading-relaxed">{children}</div>
    </div>
  );
}
