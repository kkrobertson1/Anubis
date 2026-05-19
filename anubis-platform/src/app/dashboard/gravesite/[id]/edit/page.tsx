"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { updateGravesite } from "@/app/actions/gravesite";
import { ArrowLeft } from "lucide-react";
import { US_STATES, SLOT_CATEGORIES } from "@/lib/constants";

type Gravesite = {
  id: string;
  deceased_name: string;
  slot_category: string;
  cemetery_name: string | null;
  cemetery_state: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  bio: string | null;
  latitude: number | null;
  longitude: number | null;
  is_public: boolean;
};

export default function EditGravesitePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [gravesite, setGravesite] = useState<Gravesite | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/gravesite/${id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.gravesite) {
          setGravesite(data.gravesite);
          setIsPublic(data.gravesite.is_public);
        } else {
          router.push("/dashboard");
        }
        setFetching(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setFetching(false);
      });
    return () => controller.abort();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("is_public", String(isPublic));

    const result = await updateGravesite(id, formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="pt-16 lg:pt-0 flex items-center justify-center min-h-[300px]">
        <p className="text-xs text-[#6B82A0]">Loading...</p>
      </div>
    );
  }

  if (!gravesite) return null;

  return (
    <div className="pt-16 lg:pt-0 max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/dashboard/gravesite/${id}`}
          className="inline-flex items-center gap-2 text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors mb-6"
        >
          <ArrowLeft size={13} />
          Back to Memorial
        </Link>
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">Edit Memorial</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC]">{gravesite.deceased_name}</h1>
        <div className="gold-divider max-w-[180px] mt-4" />
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="luxury-card p-6 space-y-5">
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Basic Information</p>

          <div>
            <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
              Full Name <span className="text-[#C9A84C]">*</span>
            </label>
            <input
              name="deceased_name"
              required
              defaultValue={gravesite.deceased_name}
              className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">Relationship</label>
            <select
              name="slot_category"
              defaultValue={gravesite.slot_category}
              className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            >
              {SLOT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">Date of Birth</label>
              <input
                name="date_of_birth"
                type="date"
                defaultValue={gravesite.date_of_birth ?? ""}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">Date of Passing</label>
              <input
                name="date_of_death"
                type="date"
                defaultValue={gravesite.date_of_death ?? ""}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="luxury-card p-6 space-y-5">
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Burial Location</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">Cemetery Name</label>
              <input
                name="cemetery_name"
                defaultValue={gravesite.cemetery_name ?? ""}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">State</label>
              <select
                name="cemetery_state"
                defaultValue={gravesite.cemetery_state ?? ""}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">Latitude</label>
              <input
                name="latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                defaultValue={gravesite.latitude ?? ""}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">Longitude</label>
              <input
                name="longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                defaultValue={gravesite.longitude ?? ""}
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="luxury-card p-6 space-y-5">
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Biography</p>
          <textarea
            name="bio"
            rows={5}
            defaultValue={gravesite.bio ?? ""}
            className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors resize-none"
          />
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#EDE8DC] mb-0.5">Public Profile</p>
              <p className="text-xs text-[#6B82A0]">Allow others to view and sign the guest book</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              style={{ backgroundColor: isPublic ? "#C9A84C" : "#1E2A3D" }}
              className="w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 overflow-hidden"
            >
              <span
                style={{ transform: isPublic ? "translateX(28px)" : "translateX(4px)" }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
              />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href={`/dashboard/gravesite/${id}`}
            className="flex-1 py-3 border border-[#1E2A3D] text-sm text-[#6B82A0] hover:text-[#EDE8DC] hover:border-[#2A3A4E] transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-[#C9A84C] text-[#0A0F1A] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50 gold-glow"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
