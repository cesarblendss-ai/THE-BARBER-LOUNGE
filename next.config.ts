import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.thebarberlounge.com" }],
        destination: "https://thebarberlounge.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.thebarberloungeca.com" }],
        destination: "https://thebarberloungeca.com/:path*",
        permanent: true,
      },
      {
        source: "/start",
        destination: "https://cesar-agency.vercel.app/start",
        permanent: false,
      },
      // Cesar: Tim /book funnel IS the website — hard redirect root → book.
      {
        source: "/",
        destination: "/book",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unavatar.io",
      },
    ],
  },
};

export default nextConfig;
