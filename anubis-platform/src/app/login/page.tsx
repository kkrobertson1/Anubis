"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1707051772724-d976e49c785b?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1920&h=1080&fit=crop";

function LoginContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("next", next);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0F1A] flex">
      {/* Left Panel — Image */}
      <div className="hidden lg:block relative w-1/2">
        <Image
          src={BG_IMAGE}
          alt="Foggy cemetery"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D0D]" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <Link href="/" className="mb-4 flex items-center gap-2">
            <Image src="/logo.png" alt="ANUBIS" width={48} height={16} className="object-contain" />
            <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
          <p className="text-[#A09880] text-sm leading-relaxed max-w-xs">
            Preserving the memory of those we love. One gravesite at a time.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20">
        <div className="lg:hidden mb-12">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ANUBIS" width={46} height={15} className="object-contain" />
            <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-3">
            Welcome Back
          </p>
          <h1 className="font-display text-4xl font-light text-[#EDE8DC] mb-2">
            Sign In
          </h1>
          <p className="text-[#6B82A0] text-sm mb-10">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#C9A84C] hover:text-[#D4AF37] transition-colors"
            >
              Create one
            </Link>
          </p>

          <div className="gold-divider mb-10" />

          {error && (
            <div className="mb-6 p-4 border border-red-900/50 bg-red-950/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs tracking-widest text-[#A09880] uppercase">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-[#111827] border border-[#1E2A3D] text-[#EDE8DC] px-4 py-3 text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-[#0D0D0D] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-xs text-[#6B82A0] tracking-widest">OR</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 border border-[#1E2A3D] text-[#A09880] text-sm tracking-widest uppercase hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-xs text-[#6B82A0] text-center mt-16 max-w-sm mx-auto">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-[#6B82A0] hover:text-[#C9A84C] transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#6B82A0] hover:text-[#C9A84C] transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
