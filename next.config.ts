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
        source: "/start",
        destination: "https://cesar-agency.vercel.app/start",
        permanent: false,
      },
      {
        source: "/book",
        destination:
          "https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
