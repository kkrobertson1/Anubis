"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createGravesite } from "@/app/actions/gravesite";
import { upload } from "@vercel/blob/client";
import { ArrowLeft, MapPin, Upload, X } from "lucide-react";
import { US_STATES, SLOT_CATEGORIES } from "@/lib/constants";

type PendingFile = { file: File; type: "photo" | "obituary" | "document" };

async function uploadFile(
  file: File,
  mediaType: string,
  gravesiteId: string
): Promise<void> {
  // Upload directly to Vercel Blob; /api/blob/upload authenticates and
  // returns a short-lived client token.
  const blob = await upload(
    `anubis/gravesites/${gravesiteId}/${file.name}`,
    file,
    {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      contentType: file.type,
    }
  );

  await fetch(`/api/gravesite/${gravesiteId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: blob.url,
      publicId: blob.url,
      mediaType,
    }),
  });
}

export default function NewGravesitePage() {
  return (
    <Suspense>
      <NewGravesiteForm />
    </Suspense>
  );
}

function NewGravesiteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appLat = searchParams.get("lat");
  const appLng = searchParams.get("lng");
  const appCategory = searchParams.get("category");
  const fromApp = !!(appLat && appLng);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pendingType, setPendingType] = useState<"photo" | "obituary" | "document">("photo");
  const fileRef = useRef<HTMLInputElement>(null);

  function addFile(file: File) {
    setPendingFiles((prev) => [...prev, { file, type: pendingType }]);
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("is_public", String(isPublic));

    // 1. Create the gravesite
    const result = await createGravesite(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const gravesiteId = result.id!;

    // 2. Upload any pending files
    if (pendingFiles.length > 0) {
      try {
        await Promise.all(
          pendingFiles.map((p) => uploadFile(p.file, p.type, gravesiteId))
        );
      } catch {
        // Files failed but gravesite was created — go to detail page so they can retry
        router.push(`/dashboard/gravesite/${gravesiteId}`);
        return;
      }
    }

    router.push("/dashboard");
  }

  return (
    <div className="pt-16 lg:pt-0 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors mb-6"
        >
          <ArrowLeft size={13} />
          Back to Dashboard
        </Link>
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">New Memorial</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC]">Add a Memorial Slot</h1>
        <div className="gold-divider max-w-[180px] mt-4" />
      </div>

      {fromApp && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 border border-[#C9A84C]/30 bg-[#C9A84C]/5">
          <MapPin size={13} className="text-[#C9A84C] flex-shrink-0" />
          <p className="text-xs text-[#C9A84C]">
            GPS coordinates imported from the ANUBIS app — pre-filled below.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="luxury-card p-6 space-y-5">
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Basic Information</p>

          <div>
            <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
              Full Name <span className="text-[#C9A84C]">*</span>
            </label>
            <input
              name="deceased_name"
              required
              placeholder="e.g. Margaret Rose Johnson"
              className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
              Relationship
            </label>
            <select
              name="slot_category"
              defaultValue={appCategory ?? "other"}
              className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            >
              {SLOT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                Date of Birth
              </label>
              <input
                name="date_of_birth"
                type="date"
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                Date of Passing
              </label>
              <input
                name="date_of_death"
                type="date"
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="luxury-card p-6 space-y-5">
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Burial Location</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                Cemetery Name
              </label>
              <input
                name="cemetery_name"
                placeholder="e.g. Riverside Memorial Gardens"
                className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                State
              </label>
              <select
                name="cemetery_state"
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
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                Latitude
              </label>
              <input
                name="latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                defaultValue={appLat ?? ""}
                placeholder="From ANUBIS app"
                className={`w-full bg-[#0A0F1A] border px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors ${
                  fromApp ? "border-[#C9A84C]/40" : "border-[#1E2A3D]"
                }`}
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B82A0] uppercase tracking-wider mb-2">
                Longitude
              </label>
              <input
                name="longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                defaultValue={appLng ?? ""}
                placeholder="From ANUBIS app"
                className={`w-full bg-[#0A0F1A] border px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors ${
                  fromApp ? "border-[#C9A84C]/40" : "border-[#1E2A3D]"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#3A4A5E]">
            <MapPin size={11} className="text-[#C9A84C]" />
            Coordinates are saved from the ANUBIS mobile app
          </div>
        </div>

        {/* Bio */}
        <div className="luxury-card p-6 space-y-5">
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Biography</p>
          <textarea
            name="bio"
            rows={5}
            placeholder="Share a few words about this person's life..."
            className="w-full bg-[#0A0F1A] border border-[#1E2A3D] px-4 py-3 text-sm text-[#EDE8DC] placeholder-[#3A4A5E] focus:outline-none focus:border-[#C9A84C]/50 transition-colors resize-none"
          />
        </div>

        {/* Media uploads */}
        <div className="luxury-card p-6 space-y-5">
          <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase">Photos & Documents</p>
          <p className="text-xs text-[#6B82A0]">Optional — you can also add these after saving.</p>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={pendingType}
              onChange={(e) => setPendingType(e.target.value as typeof pendingType)}
              className="bg-[#0A0F1A] border border-[#1E2A3D] px-3 py-2 text-xs text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50"
            >
              <option value="photo">Photo</option>
              <option value="obituary">Obituary</option>
              <option value="document">Document</option>
            </select>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-[#1E2A3D] text-xs text-[#6B82A0] hover:text-[#EDE8DC] hover:border-[#C9A84C]/40 transition-colors"
            >
              <Upload size={13} />
              Add File
            </button>

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={pendingType === "photo" ? "image/*" : ".pdf,image/*"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { addFile(file); e.target.value = ""; }
              }}
            />
          </div>

          {pendingFiles.length > 0 && (
            <ul className="space-y-2">
              {pendingFiles.map((p, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-2 border border-[#1E2A3D] text-xs">
                  <span className="text-[#A09880] truncate mr-3">{p.file.name}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[#6B82A0] capitalize">{p.type}</span>
                    <button type="button" onClick={() => removeFile(i)}>
                      <X size={13} className="text-[#3A4A5E] hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Visibility */}
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

        {/* Submit */}
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 py-3 border border-[#1E2A3D] text-sm text-[#6B82A0] hover:text-[#EDE8DC] hover:border-[#2A3A4E] transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-[#C9A84C] text-[#0A0F1A] text-sm tracking-widest uppercase font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50 gold-glow"
          >
            {loading
              ? pendingFiles.length > 0
                ? "Saving & Uploading..."
                : "Saving..."
              : "Save Memorial"}
          </button>
        </div>
      </form>
    </div>
  );
}

