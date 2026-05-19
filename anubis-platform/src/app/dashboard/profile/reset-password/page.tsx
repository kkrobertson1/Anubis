"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm_password") as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/profile?reset=success");
  }

  return (
    <div className="pt-16 lg:pt-0 max-w-md">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-full border border-[#1E2A3D] flex items-center justify-center mb-6">
          <KeyRound size={16} className="text-[#C9A84C]" />
        </div>
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">Security</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC]">Set New Password</h1>
        <div className="gold-divider max-w-[160px] mt-4" />
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="luxury-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <input
              name="confirm_password"
              type="password"
              required
              placeholder="Repeat your password"
              className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C9A84C] text-[#0A0F1A] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50 gold-glow"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
