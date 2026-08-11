/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // نقشهٔ سایت روی بک‌اند تولید می‌شود؛ اینجا آدرس دامنهٔ اصلی را به همان مسیر هدایت می‌کنیم
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/feed/sitemap.xml`,
      },
    ];
  },
};

module.exports = nextConfig;
