import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Partial Prerendering is now enabled via cacheComponents (not experimental.ppr)
  cacheComponents: true,
  
  // Turbopack configuration to fix workspace root warning
  turbopack: {
    root: '.', // Explicitly set the root directory
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cinevserse-api.nhatquang.shop',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/api/movies/:path*',
        destination: 'https://cinevserse-api.nhatquang.shop/:path*',
      },
    ]
  },
}

export default nextConfig