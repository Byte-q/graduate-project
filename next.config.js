/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        pg: false,
        'pg-connection-string': false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        buffer: false,
        events: false,
        domain: false,
        punycode: false,
        string_decoder: false,
        timers: false,
        tty: false,
        vm: false,
        worker_threads: false,
        child_process: false,
        cluster: false,
        module: false,
        process: false,
        inspector: false,
        async_hooks: false,
        perf_hooks: false,
        trace_events: false,
        v8: false,
        wasi: false,
      };
    }
    return config;
  },
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