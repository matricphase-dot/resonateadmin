/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    proxyMiddleware: true, // Next.js 15 proxy support
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure we don't spam logs with fetch warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_b3B0aW11bS1jb25kb3ItOTcuY2xlcmsuYWNjb3VudHMuZGV2JA",
    CLERK_SECRET_KEY: "sk_test_NsmJ5XsUnWkWZAUwT6CFbRYkWwXdDfurReDdtnIIYg",
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
};

module.exports = nextConfig;
