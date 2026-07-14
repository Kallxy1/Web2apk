import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "55mb" } },
  poweredByHeader: false,
};
export default nextConfig;
