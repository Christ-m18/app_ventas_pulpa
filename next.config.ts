import type { NextConfig } from "next";

import path from "node:path";

// ─── Content Security Policy ───────────────────────────────────
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com;
  connect-src 'self' wss://*.supabase.co https://*.supabase.co https://generativelanguage.googleapis.com ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*;
  font-src 'self' https://fonts.gstatic.com;
  media-src 'self' https://*.supabase.co;
  object-src 'none';
  manifest-src 'self';
  worker-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow tunneled dev hosts (tunnelmole / ngrok / lan IPs) to load /_next/* assets.
  // Without this, Next 16 blocks cross-origin requests to dev resources.
  allowedDevOrigins: [
    "*.tunnelmole.net",
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.loca.lt",
    "*.trycloudflare.com",
    "192.168.0.0/16",
    "10.0.0.0/8",
  ],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
