"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1A]/90 backdrop-blur-sm border-b border-[#1E2A3D]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="ANUBIS" width={48} height={16} className="object-contain" />
            <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
          <span className="hidden sm:block text-[#2A2A2A] text-xl">|</span>
          <span className="hidden sm:block text-xs tracking-[0.3em] text-[#A09880] uppercase">Memorial Platform</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase">
            How It Works
          </Link>
          <Link href="#pricing" className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase">
            Pricing
          </Link>
          <Link href="/about" className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase">
            About
          </Link>
          <Link href="/faq" className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase">
            FAQ
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/community" className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase">
                Community
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-2 border border-[#C9A84C] text-[#C9A84C] text-sm tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase">
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 border border-[#C9A84C] text-[#C9A84C] text-sm tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-[#C9A84C] transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-px bg-[#C9A84C] transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-[#C9A84C] transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-96 border-t border-[#1E2A3D]" : "max-h-0"}`}>
        <div className="flex flex-col px-6 py-4 gap-6 bg-[#0A0F1A]">
          <Link
            href="#how-it-works"
            onClick={() => setOpen(false)}
            className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            onClick={() => setOpen(false)}
            className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase"
          >
            About
          </Link>
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase"
          >
            FAQ
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/community"
                onClick={() => setOpen(false)}
                className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase"
              >
                Community
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="py-3 border border-[#C9A84C] text-[#C9A84C] text-sm tracking-widest uppercase text-center hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm tracking-widest text-[#A09880] hover:text-[#C9A84C] transition-colors uppercase"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="py-3 border border-[#C9A84C] text-[#C9A84C] text-sm tracking-widest uppercase text-center hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
