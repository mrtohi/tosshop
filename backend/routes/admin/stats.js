const express = require("express");
const db = require("../../db");
const { requireAdmin } = require("../../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/stats — خلاصهٔ وضعیت فروشگاه برای داشبورد
router.get("/", (req, res) => {
  const totalSales = db.prepare("SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE status = 'paid'").get().s;
  const todaySales = db.prepare(
    "SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE status = 'paid' AND date(created_at) = date('now')"
  ).get().s;
  const monthSales = db.prepare(
    "SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE status = 'paid' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
  ).get().s;
  const orderCount = db.prepare("SELECT COUNT(*) AS c FROM orders").get().c;
  const paidCount = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'paid'").get().c;
  const pendingCount = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'").get().c;
  const productCount = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
  const lowStock = db.prepare("SELECT id, name, stock FROM products WHERE stock <= 3 ORDER BY stock ASC").all();

  const topProducts = db.prepare(`
    SELECT p.id, p.name, SUM(oi.qty) AS sold
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.status = 'paid'
    GROUP BY p.id
    ORDER BY sold DESC
    LIMIT 5
  `).all();

  res.json({ totalSales, todaySales, monthSales, orderCount, paidCount, pendingCount, productCount, lowStock, topProducts });
});

module.exports = router;
