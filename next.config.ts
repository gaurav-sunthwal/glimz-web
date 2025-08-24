import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true, // This allows all images without optimization
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },

      
    },
  },
};

export default nextConfig;
