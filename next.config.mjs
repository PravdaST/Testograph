/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com'],
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
