const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  transpilePackages: ["next-mdx-remote"],
  async rewrites() {
    return [
      {
        source: "/api/cors/online-status",
        destination: "https://uniapi.vatprc.net/api/compat/online-status",
      },
      {
        source: "/api/cors/vatsim-events-prc",
        destination: "https://my.vatsim.net/api/v2/events/latest",
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
