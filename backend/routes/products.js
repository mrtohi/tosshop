const express = require("express");
const db = require("../db");

const router = express.Router();

// یک محصول را با فیلدهای محاسبه‌شده (تخفیف، امتیاز، لیست تصاویر) کامل می‌کند
function enrich(p) {
  const images = db.prepare("SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order")
    .all(p.id).map((r) => r.url);
  const rating = db.prepare(
    "SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE product_id = ? AND approved = 1"
  ).get(p.id);
  const discount_percent = p.compare_at_price && p.compare_at_price > p.price
    ? Math.round((1 - p.price / p.compare_at_price) * 100)
    : 0;

  return {
    ...p,
    images: images.length ? images : (p.image_url ? [p.image_url] : []),
    specs: p.specs ? JSON.parse(p.specs) : [],
    rating_avg: rating.avg ? Number(rating.avg.toFixed(1)) : 0,
    rating_count: rating.count,
    discount_percent,
  };
}

const SORTS = {
  newest: "created_at DESC",
  price_asc: "price ASC",
  price_desc: "price DESC",
  popular: `(SELECT COALESCE(SUM(oi.qty),0) FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE oi.product_id = products.id AND o.status = 'paid') DESC`,
};

// GET /api/products?category=&minPrice=&maxPrice=&inStock=true&sort=popular&page=1&limit=12
router.get("/", (req, res) => {
  const { category, minPrice, maxPrice, inStock, sort, page = 1, limit = 12 } = req.query;

  const where = ["active = 1"];
  const params = [];
  if (category) { where.push("category = ?"); params.push(category); }
  if (minPrice) { where.push("price >= ?"); params.push(Number(minPrice)); }
  if (maxPrice) { where.push("price <= ?"); params.push(Number(maxPrice)); }
  if (inStock === "true") { where.push("stock > 0"); }

  const whereSql = `WHERE ${where.join(" AND ")}`;
  const orderBy = SORTS[sort] || SORTS.newest;

  const total = db.prepare(`SELECT COUNT(*) AS c FROM products ${whereSql}`).get(...params).c;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(60, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const rows = db.prepare(`
    SELECT * FROM products ${whereSql}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, limitNum, offset);

  res.json({
    products: rows.map(enrich),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ? AND active = 1").get(req.params.id);
  if (!row) return res.status(404).json({ error: "محصول پیدا نشد" });
  res.json(enrich(row));
});

// GET /api/products/:id/related — محصولات مرتبط (همان دسته)
router.get("/:id/related", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "محصول پیدا نشد" });

  const related = db.prepare(`
    SELECT * FROM products
    WHERE category = ? AND id != ? AND stock > 0 AND active = 1
    ORDER BY RANDOM()
    LIMIT 4
  `).all(product.category, product.id);

  res.json(related.map(enrich));
});

module.exports = router;
module.exports.enrich = enrich;
