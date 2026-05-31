import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
      {
        protocol: "https",
        hostname: "img.mundopgn.me",
      },
    ],
  },
  transpilePackages: ["@meuqr/ui", "@meuqr/shared", "@meuqr/supabase"],
};

export default nextConfig;
