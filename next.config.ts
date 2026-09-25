import type { NextConfig } from "next";

// No GitHub Pages o site vive em /portfolio-leonardo-martins.
// Em desenvolvimento (npm run dev) corre na raiz.
const basePath = process.env.NODE_ENV === "production" ? "/portfolio-leonardo-martins" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
