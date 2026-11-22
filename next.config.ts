import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  outputFileTracingIncludes: {
    "/api/analyze": ["./vendor/pdf.worker.mjs"],
  },
};

export default nextConfig;

