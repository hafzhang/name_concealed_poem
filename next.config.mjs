/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude async_hooks module from being bundled
    // It's a Node.js built-in that doesn't work in Cloudflare Workers Edge Runtime
    config.resolve.alias = {
      ...config.resolve.alias,
      'async_hooks': false,
    };

    // Also exclude it explicitly in externals for server-side builds
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('async_hooks');
    }

    return config;
  },
};

export default nextConfig;
