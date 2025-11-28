import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // …
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};
module.exports = {
  swcMinify: false,
}
export default nextConfig;
