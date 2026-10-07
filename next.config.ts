import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@registry": path.resolve(process.cwd(), "registry"),
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@registry": path.resolve(process.cwd(), "registry"),
    };
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Cache all image frames and static media for 1 year with immutable tag
        source: "/(frame|laser|hide_robot)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
