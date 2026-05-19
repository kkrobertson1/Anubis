"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, FileText, Trash2 } from "lucide-react";

type MediaItem = {
  id: string;
  url: string;
  media_type: "photo" | "obituary" | "document";
  caption: string | null;
  created_at: string;
  public_id: string | null;
};

type Props = {
  gravesiteId: string;
  initialMedia: MediaItem[];
};

export default function MediaUpload({ gravesiteId, initialMedia }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "obituary" | "document">("photo");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      // 1. Get signed params from our server
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gravesiteId }),
      });
      const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", String(timestamp));
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const resourceType = mediaType === "photo" ? "image" : "raw";
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: formData }
      );
      const uploaded = await uploadRes.json();

      if (!uploaded.secure_url) {
        throw new Error(uploaded.error?.message ?? "Upload failed");
      }

      // 3. Save to DB
      const saveRes = await fetch(`/api/gravesite/${gravesiteId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
          mediaType,
        }),
      });
      const saved = await saveRes.json();
      if (!saved.success) throw new Error(saved.error ?? "Failed to save");

      // 4. Optimistically update UI
      setMedia((prev) => [
        ...prev,
        {
          id: uploaded.public_id,
          url: uploaded.secure_url,
          media_type: mediaType,
          caption: null,
          created_at: new Date().toISOString(),
          public_id: uploaded.public_id,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(item: MediaItem) {
    // Use public_id from DB when available; for optimistic items id === public_id
    const publicId = item.public_id ?? item.id;
    await fetch(`/api/gravesite/${gravesiteId}/media`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: item.id, publicId }),
    });
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
  }

  const photos = media.filter((m) => m.media_type === "photo");
  const docs = media.filter((m) => m.media_type !== "photo");

  return (
    <div className="space-y-6">
      {/* Upload controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value as typeof mediaType)}
          className="bg-[#0A0F1A] border border-[#1E2A3D] px-3 py-2 text-xs text-[#EDE8DC] focus:outline-none focus:border-[#C9A84C]/50"
        >
          <option value="photo">Photo</option>
          <option value="obituary">Obituary</option>
          <option value="document">Document</option>
        </select>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border border-[#1E2A3D] text-xs text-[#6B82A0] hover:text-[#EDE8DC] hover:border-[#C9A84C]/40 transition-colors disabled:opacity-40"
        >
          <Upload size={13} />
          {uploading ? "Uploading..." : "Choose File"}
        </button>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={mediaType === "photo" ? "image/*" : ".pdf,image/*"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 px-3 py-2 bg-red-900/20 border border-red-800/30">
          {error}
        </p>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div>
          <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-3">Photos</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((item) => (
              <div key={item.id} className="relative group aspect-square">
                <Image
                  src={item.url}
                  alt={item.caption ?? "Memorial photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <button
                  onClick={() => handleDelete(item)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={11} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents / Obituaries */}
      {docs.length > 0 && (
        <div>
          <p className="text-[10px] text-[#6B82A0] uppercase tracking-wider mb-3">
            Documents & Obituaries
          </p>
          <div className="space-y-2">
            {docs.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 border border-[#1E2A3D]"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[#A09880] hover:text-[#C9A84C] transition-colors"
                >
                  <FileText size={14} className="text-[#C9A84C] flex-shrink-0" />
                  <span className="capitalize">{item.media_type}</span>
                </a>
                <button onClick={() => handleDelete(item)}>
                  <X size={13} className="text-[#3A4A5E] hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 0 && !uploading && (
        <p className="text-xs text-[#3A4A5E] text-center py-4">
          No media uploaded yet
        </p>
      )}
    </div>
  );
}
