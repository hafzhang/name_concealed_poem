/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude async_hooks module from being bundled
    // It's a Node.js built-in that doesn't work in Cloudflare Workers Edge Runtime

    // 1. Set alias to false to prevent resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'async_hooks': false,
    };

    // 2. For server-side builds, add to externals
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('async_hooks');
      }
    }

    // 3. Ignore async_hooks in module resolution
    config.module = config.module || {};
    config.module.unknownContextCritical = false;
    config.module.unknownContextRegExp = /async_hooks/;

    return config;
  },

  // 4. Experimental: mark async_hooks as external package
  experimental: {
    serverComponentsExternalPackages: ['async_hooks'],
  },
};

export default nextConfig;
