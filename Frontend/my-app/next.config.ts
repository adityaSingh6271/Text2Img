import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "processed-model-result.s3.us-east-2.amazonaws.com",
      },
    ],
    domains: ["processed-model-result.s3.us-east-2.amazonaws.com"],
  },
};

export default nextConfig;
