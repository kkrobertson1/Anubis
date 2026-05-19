import Link from "next/link";
import Image from "next/image";

export default function ConfirmPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1A] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 justify-center">
          <Image src="/logo.png" alt="ANUBIS" width={46} height={15} className="object-contain" />
          <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
        </Link>

        <div className="luxury-card p-10">
          <div className="w-16 h-16 border border-[#C9A84C]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[#C9A84C] text-2xl">✦</span>
          </div>

          <h1 className="font-display text-3xl font-light text-[#EDE8DC] mb-4">
            Check Your Email
          </h1>

          <div className="gold-divider my-6" />

          <p className="text-[#A09880] text-sm leading-relaxed mb-4">
            We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account.
          </p>
          <p className="text-[#6B82A0] text-xs leading-relaxed mb-8">
            After confirming your email, you will be directed to complete your account setup and payment.
          </p>

          <p className="text-xs text-[#2E3F56]">
            Already confirmed?{" "}
            <Link href="/login" className="text-[#C9A84C] hover:text-[#D4AF37] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
