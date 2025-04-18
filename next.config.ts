import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ceaseless-chihuahua-524.convex.cloud',
      },
    ],
  },
  
};

export default nextConfig;
