/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Pre-existing lint issues in the original component code are left as-is
    // (not modified) and surfaced instead via `npm run lint`; they should not
    // block `next build`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
