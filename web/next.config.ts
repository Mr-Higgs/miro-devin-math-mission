import type { NextConfig } from "next";

const basePath = "/app";

const nextConfig: NextConfig = {
  /* config options here */
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
