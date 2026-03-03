import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Imágenes de Unsplash (seed data y demos)
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Imágenes de Supabase Storage (producción)
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
