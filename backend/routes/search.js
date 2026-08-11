const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/search?q=یخچال
// جست‌وجوی ساده ولی هوشمند: هم در نام، هم برند، هم دسته‌بندی می‌گردد
// و نتایجی که دقیق‌تر با عبارت جست‌وجو مطابقت دارند بالاتر می‌آیند
router.get("/", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const like = `%${q}%`;
  const rows = db.prepare(`
    SELECT *,
      (CASE WHEN name LIKE ? THEN 3 ELSE 0 END) +
      (CASE WHEN brand LIKE ? THEN 2 ELSE 0 END) +
      (CASE WHEN category LIKE ? THEN 1 ELSE 0 END) AS relevance
    FROM products
    WHERE name LIKE ? OR brand LIKE ? OR category LIKE ?
    ORDER BY relevance DESC, stock DESC
    LIMIT 20
  `).all(like, like, like, like, like, like);

  res.json(rows);
});

module.exports = router;
