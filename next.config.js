/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '', // optional
        pathname: '/**', // optional
      },
      // more patterns...
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:${process.env.port}/server/api/:path*`,
      }
    ];
  },
}

module.exports = nextConfig;