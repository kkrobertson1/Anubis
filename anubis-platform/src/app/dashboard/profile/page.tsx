"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { updateProfile } from "@/app/actions/auth";
import { User, CreditCard, Shield } from "lucide-react";

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  account_status: string;
  payment_status: string;
  slots_total: number;
  slots_used: number;
  created_at: string;
};

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordReset = searchParams.get("reset") === "success";

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  if (!profile) {
    return (
      <div className="pt-16 lg:pt-0 flex items-center justify-center min-h-[300px]">
        <p className="text-xs text-[#6B82A0]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-0 max-w-2xl">
      <div className="mb-8">
        {passwordReset && (
          <div className="mb-6 px-4 py-3 bg-[#C9A84C]/5 border border-[#C9A84C]/20 text-[#C9A84C] text-sm">
            Password updated successfully.
          </div>
        )}
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">Account</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC]">Your Profile</h1>
        <div className="gold-divider max-w-[150px] mt-4" />
      </div>

      {/* Account status */}
      <div className="luxury-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={14} className="text-[#C9A84C]" />
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Account Status</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Status", value: profile.account_status },
            { label: "Payment", value: profile.payment_status },
            { label: "Slots Used", value: `${profile.slots_used} / ${profile.slots_total}` },
            {
              label: "Member Since",
              value: new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm text-[#EDE8DC] capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit profile */}
      <div className="luxury-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <User size={14} className="text-[#C9A84C]" />
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Personal Information</p>
        </div>

        {error && (
          <p className="mb-4 text-xs text-red-400 px-3 py-2 bg-red-900/20 border border-red-800/30">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 text-xs text-[#C9A84C] px-3 py-2 bg-[#C9A84C]/5 border border-[#C9A84C]/20">
            Profile updated successfully.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                First Name
              </label>
              <input
                name="first_name"
                required
                defaultValue={profile.first_name}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                Last Name
              </label>
              <input
                name="last_name"
                required
                defaultValue={profile.last_name}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              value={profile.email}
              disabled
              className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#3A4A5E] cursor-not-allowed"
            />
            <p className="text-[10px] text-[#3A4A5E] mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50 gold-glow"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Payment info */}
      <div className="luxury-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={14} className="text-[#C9A84C]" />
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Payment</p>
        </div>
        <p className="text-sm text-[#A09880]">
          Your $35 lifetime membership is active. No recurring charges.
        </p>
      </div>
    </div>
  );
}
