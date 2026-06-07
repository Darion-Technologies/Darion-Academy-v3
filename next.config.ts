import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
    serverActions: {
      // Private uploads are validated at 10 MB in lib/storage.ts.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
