import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Vercel Blob (current image host for new uploads)
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        // Cloudinary (legacy host — kept so previously uploaded images
        // still render after the migration)
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
