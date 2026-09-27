/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
      },
      {
        source: '/admin/:path*',
        destination: '/:path*',
      },
    ]
  },
}

export default nextConfig

