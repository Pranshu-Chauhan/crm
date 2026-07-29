import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" is intentionally removed — Vercel manages its own
  // build output and standalone mode conflicts with Vercel's deployment system.
  experimental: {},
};

export default nextConfig;
