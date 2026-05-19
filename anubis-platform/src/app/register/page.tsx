"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { register } from "@/app/actions/auth";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1506280225777-ced660ce8f16?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200&h=1600&fit=crop";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0F1A] flex">
      {/* Left Panel — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16">
        <div className="mb-12 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ANUBIS" width={46} height={15} className="object-contain" />
            <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-3">
            Begin Your Journey
          </p>
          <h1 className="font-display text-4xl font-light text-[#EDE8DC] mb-2">
            Create Account
          </h1>
          <p className="text-[#6B82A0] text-sm mb-10">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#C9A84C] hover:text-[#D4AF37] transition-colors"
            >
              Sign in
            </Link>
          </p>

          <div className="gold-divider mb-10" />

          {error && (
            <div className="mb-6 p-4 border border-red-900/50 bg-red-950/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest text-[#A09880] uppercase mb-2">
                  First Name
                </label>
                <input
                  name="first_name"
                  type="text"
                  placeholder="James"
                  required
                  className="w-full bg-[#111827] border border-[#1E2A3D] text-[#EDE8DC] px-4 py-3 text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest text-[#A09880] uppercase mb-2">
                  Last Name
                </label>
                <input
                  name="last_name"
                  type="text"
                  placeholder="Smith"
                  required
                  className="w-full bg-[#111827] border border-[#1E2A3D] text-[#EDE8DC] px-4 py-3 text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs tracking-widest text-[#A09880] uppercase mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="w-full bg-[#111827] border border-[#1E2A3D] text-[#EDE8DC] px-4 py-3 text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs tracking-widest text-[#A09880] uppercase mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-[#111827] border border-[#1E2A3D] text-[#EDE8DC] px-4 py-3 text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
              />
              <p className="text-xs text-[#6B82A0] mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs tracking-widest text-[#A09880] uppercase mb-2">
                Confirm Password
              </label>
              <input
                name="confirm_password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-[#111827] border border-[#1E2A3D] text-[#EDE8DC] px-4 py-3 text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
              />
            </div>

            {/* Pricing notice */}
            <div className="border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-4">
              <div className="flex items-start gap-3">
                <span className="text-[#C9A84C] text-xs mt-0.5">✦</span>
                <p className="text-xs text-[#A09880] leading-relaxed">
                  Account creation requires a one-time fee of{" "}
                  <span className="text-[#C9A84C] font-medium">$35</span>.
                  You will be directed to payment after registration. This
                  unlocks{" "}
                  <span className="text-[#EDE8DC]">28 memorial slots</span>{" "}
                  with lifetime access.
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 accent-[#C9A84C]"
              />
              <label
                htmlFor="terms"
                className="text-xs text-[#6B82A0] leading-relaxed"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[#A09880] hover:text-[#C9A84C] transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#A09880] hover:text-[#C9A84C] transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-[#0D0D0D] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Continue to Payment"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel — Image */}
      <div className="hidden lg:block relative w-1/2">
        <Image
          src={BG_IMAGE}
          alt="Flowers on a grave"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0D0D0D]" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <Image src="/logo.png" alt="ANUBIS" width={46} height={15} className="object-contain" />
            <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
          <p className="font-display text-5xl font-light text-[#EDE8DC] leading-tight mb-6">
            Their memory
            <span className="block italic text-gold-gradient">lives here</span>
          </p>
          <div className="gold-divider w-24 mx-auto my-6" />
          <p className="text-[#A09880] text-sm leading-relaxed max-w-xs">
            Join hundreds of families who have found peace knowing they will
            always find their way back.
          </p>
          <div className="mt-16 space-y-4 w-full max-w-xs">
            {[
              "28 dedicated memorial slots",
              "Lifetime access, one-time fee",
              "Connect with others who share your loved ones",
              "134,000+ cemetery locations",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-left">
                <span className="text-[#C9A84C] text-xs flex-shrink-0">✦</span>
                <span className="text-xs text-[#A09880] tracking-wide">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
