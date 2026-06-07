import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    serverActions: {
      // Private uploads are validated at 10 MB in lib/storage.ts.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
