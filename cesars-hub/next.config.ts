import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const hubRoot = __dirname;
const repoRoot = path.join(hubRoot, "..");
loadEnvConfig(repoRoot);
process.env.HUB_REPO_ROOT = repoRoot;

const parentSrc = path.join(repoRoot, "src");
const hubSrc = path.join(hubRoot, "src");
const prismaClient = fs.existsSync(path.join(hubRoot, "node_modules/@prisma/client"))
  ? path.join(hubRoot, "node_modules/@prisma/client")
  : path.join(repoRoot, "node_modules/@prisma/client");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    externalDir: true,
  },
  async redirects() {
    return [
      { source: "/hub", destination: "/", permanent: false },
      { source: "/hub/:path*", destination: "/:path*", permanent: false },
      { source: "/admin/calendar", destination: "/calendar", permanent: false },
      { source: "/admin/estimates", destination: "/estimates", permanent: false },
      { source: "/admin/appointments", destination: "/appointments", permanent: false },
      { source: "/admin/products", destination: "/products", permanent: false },
      { source: "/admin/analytics", destination: "/analytics", permanent: false },
      { source: "/admin/notifications", destination: "/notifications", permanent: false },
      { source: "/admin/sms-setup", destination: "/sms-setup", permanent: false },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": parentSrc,
      "@hub": hubSrc,
      "@prisma/client": prismaClient,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@": parentSrc,
      "@hub": hubSrc,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
};

export default nextConfig;
