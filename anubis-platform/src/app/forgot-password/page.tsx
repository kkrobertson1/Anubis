"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await forgotPassword(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0A0F1A] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-8">
            <Image src="/logo.png" alt="ANUBIS" width={38} height={12} className="object-contain" />
            <span className="font-display text-xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-3">Account Recovery</p>
          <h1 className="font-display text-3xl font-light text-[#EDE8DC] mb-2">Reset Password</h1>
          <div className="gold-divider max-w-[140px] mx-auto mt-4" />
        </div>

        {sent ? (
          <div className="luxury-card p-8 text-center">
            <p className="text-[#C9A84C] text-sm mb-2">Email sent</p>
            <p className="text-[#A09880] text-sm leading-relaxed">
              Check your inbox for a password reset link. It may take a few minutes to arrive.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-6 text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors"
            >
              <ArrowLeft size={12} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div className="luxury-card p-8">
            <p className="text-sm text-[#A09880] mb-6 leading-relaxed">
              Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <p className="mb-4 text-xs text-red-400 px-3 py-2 bg-red-900/20 border border-red-800/30">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#C9A84C] text-[#0A0F1A] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50 gold-glow"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-6 text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors"
            >
              <ArrowLeft size={12} />
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
