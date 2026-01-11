/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js'],
  },
  // Cloudflare Pages requires output export or use their adapter
  // We'll use the @cloudflare/next-on-pages adapter
  output: 'standalone',
};

export default nextConfig;
