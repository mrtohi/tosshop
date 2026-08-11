const express = require("express");
const db = require("../db");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.tosshop.ir";
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || "https://api.tosshop.ir";

// کاراکترهای خاص XML را امن می‌کند
const escapeXml = (str) =>
  String(str).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  }[c]));

/* ---------------------------------------------------------------
   GET /feed/torob.xml
   فید محصولات با فرمت استاندارد گوگل (که ترب هم می‌پذیرد)
   این آدرس را در پنل فروشندگان ترب → مدیریت کالاها → افزودن فید ثبت کنید
--------------------------------------------------------------- */
router.get("/torob.xml", (req, res) => {
  // فقط محصولاتی که واقعاً فعال‌اند و عکس واقعی دارند در فید قرار می‌گیرند
  // (ترب فید را رد می‌کند اگر لینک عکس واقعی نباشد)
  const products = db.prepare("SELECT * FROM products WHERE active = 1 AND image_url != ''").all();

  const items = products.map((p) => {
    const hasDiscount = p.compare_at_price && p.compare_at_price > p.price;
    return `
    <item>
      <g:id>${p.id}</g:id>
      <title>${escapeXml(p.name)}</title>
      <description>${escapeXml(p.description || `${p.brand} - ${p.name}`)}</description>
      <link>${FRONTEND_URL}/product/${p.id}${p.slug ? "-" + p.slug : ""}</link>
      <g:image_link>${API_PUBLIC_URL}${p.image_url}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      ${hasDiscount
        ? `<g:price>${p.compare_at_price} IRT</g:price><g:sale_price>${p.price} IRT</g:sale_price>`
        : `<g:price>${p.price} IRT</g:price>`}
      <g:brand>${escapeXml(p.brand)}</g:brand>
      <g:product_type>${escapeXml(p.category)}</g:product_type>
      ${p.sku ? `<g:mpn>${escapeXml(p.sku)}</g:mpn>` : ""}
      <g:identifier_exists>false</g:identifier_exists>
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>خانه‌کالا</title>
    <link>${FRONTEND_URL}</link>
    <description>فید محصولات لوازم خانگی خانه‌کالا</description>
    ${items}
  </channel>
</rss>`;

  res.type("application/xml").send(xml);
});

/* ---------------------------------------------------------------
   GET /feed/sitemap.xml
   نقشهٔ سایت — آدرس صفحات محصولات را به گوگل معرفی می‌کند
--------------------------------------------------------------- */
router.get("/sitemap.xml", (req, res) => {
  const products = db.prepare("SELECT id, slug, created_at FROM products WHERE active = 1").all();

  const staticUrls = ["", "/products", "/about", "/contact"];
  const staticEntries = staticUrls.map((path) => `
  <url>
    <loc>${FRONTEND_URL}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.7"}</priority>
  </url>`).join("");

  const productEntries = products.map((p) => `
  <url>
    <loc>${FRONTEND_URL}/product/${p.id}${p.slug ? "-" + p.slug : ""}</loc>
    <lastmod>${(p.created_at || "").slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticEntries}
  ${productEntries}
</urlset>`;

  res.type("application/xml").send(xml);
});

/* ---------------------------------------------------------------
   GET /feed/robots.txt
--------------------------------------------------------------- */
router.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nSitemap: ${FRONTEND_URL}/sitemap.xml\n`
  );
});

module.exports = router;
