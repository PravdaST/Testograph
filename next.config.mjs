/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Disable TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'shop.testograph.eu',
        pathname: '/cdn/shop/files/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'mrpsaqtmucxpawajfxfn.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    qualities: [75, 90, 100],
  },
  // Server Actions are now stable in Next.js 16
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  // Redirect old routes if needed
  async redirects() {
    return [];
  },
}

export default nextConfig;
