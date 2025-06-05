import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  /* Image optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable React strict mode for better debugging and performance optimizations
  reactStrictMode: true,
  // Optimize package size by specifying which packages should be transpiled
  transpilePackages: ['recharts', 'framer-motion'],
  // Add a cache header to static assets
  headers: async () => [
    {
      source: '/(.*?).(jpg|jpeg|png|svg|webp|avif|ico|css|js)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
};

// Conditionally apply bundle analyzer to the config
let configToExport: NextConfig = nextConfig;

if (process.env.ANALYZE === 'true') {
  const analyzerWithEnabled = withBundleAnalyzer({
    enabled: true, // Explicitly enabled as we are inside the ANALYZE === 'true' block
  });
  configToExport = analyzerWithEnabled(nextConfig);
}

// Apply bundle analyzer to the config
export default configToExport;
