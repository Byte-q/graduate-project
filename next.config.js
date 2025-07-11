/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '', // optional
        pathname: '/path/**', // optional
      },
      // more patterns...
    ]
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