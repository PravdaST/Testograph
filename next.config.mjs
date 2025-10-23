/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
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
    ],
    qualities: [75, 90, 100],
  },
  // Enable React Server Components
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  // Redirect old routes if needed
  async redirects() {
    return [];
  },
}

export default nextConfig;
