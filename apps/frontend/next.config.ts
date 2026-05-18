import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['msw', '@mswjs/interceptors'],
};

export default nextConfig;
