/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
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
