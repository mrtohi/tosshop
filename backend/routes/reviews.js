const express = require("express");
const db = require("../db");
const { writeLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// GET /api/products/:id/reviews — فقط نظرات تأییدشده نمایش داده می‌شوند
router.get("/:id/reviews", (req, res) => {
  const rows = db.prepare(
    "SELECT id, author_name, rating, comment, created_at FROM reviews WHERE product_id = ? AND approved = 1 ORDER BY created_at DESC"
  ).all(req.params.id);
  res.json(rows);
});

// POST /api/products/:id/reviews — ثبت نظر جدید (ابتدا در انتظار تأیید ادمین)
router.post("/:id/reviews", writeLimiter, (req, res) => {
  const { authorName, rating, comment } = req.body;
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "محصول پیدا نشد" });

  const ratingNum = Number(rating);
  if (!authorName || !ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "نام و امتیاز (بین ۱ تا ۵) الزامی است" });
  }

  db.prepare(
    "INSERT INTO reviews (product_id, author_name, rating, comment) VALUES (?, ?, ?, ?)"
  ).run(product.id, authorName, ratingNum, comment || "");

  res.status(201).json({ ok: true, message: "نظر شما ثبت شد و بعد از تأیید ادمین نمایش داده می‌شود" });
});

module.exports = router;
