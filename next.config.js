/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'example.com',
      'images.unsplash.com',
      // Add your image domains here
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/server/api/:path*',
      }
    ];
  },
}

module.exports = nextConfig;