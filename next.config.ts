import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: process.env.BASE_PATH,
  assetPrefix: process.env.BASE_PATH,
};

export default nextConfig;
