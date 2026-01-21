import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

/** @type {import('next').NextConfig} */

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock async_hooks module for Cloudflare Workers Edge Runtime
const asyncHooksMockPath = path.resolve(__dirname, 'mocks', 'async_hooks.js');

const require = createRequire(import.meta.url);

const nextConfig = {
  // Increase static generation timeout to 10 minutes
  staticPageGenerationTimeout: 600,
  // Experimental: disable SWC and use Babel instead
  experimental: {
    esmExternals: false,
  },
  swcMinify: false,
  webpack: (config, { isServer }) => {
    // Replace async_hooks module with a mock implementation
    // async_hooks is a Node.js built-in that doesn't work in Cloudflare Workers Edge Runtime

    // Use NormalModuleReplacementPlugin to replace all async_hooks imports with our mock
    const { NormalModuleReplacementPlugin } = require('webpack');
    config.plugins.push(
      new NormalModuleReplacementPlugin(
        /^async_hooks$/,
        asyncHooksMockPath
      )
    );

    // Also add alias as fallback
    config.resolve.alias = {
      ...config.resolve.alias,
      'async_hooks': asyncHooksMockPath,
    };

    return config;
  },
};

export default nextConfig;
