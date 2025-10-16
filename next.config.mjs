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
    domains: ['storage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shop.testograph.eu',
        pathname: '/cdn/shop/files/**',
      },
    ],
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
