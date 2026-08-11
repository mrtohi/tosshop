const express = require("express");
const db = require("../../db");
const { requireAdmin } = require("../../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/orders — لیست همه سفارش‌ها
router.get("/", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  res.json(orders);
});

// GET /api/admin/orders/:id — جزئیات یک سفارش با آیتم‌ها
router.get("/:id", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "سفارش پیدا نشد" });
  const items = db.prepare(`
    SELECT oi.qty, oi.price, p.name, p.brand
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(order.id);
  res.json({ ...order, items });
});

// PUT /api/admin/orders/:id/status — تغییر وضعیت سفارش (مثلاً به "shipped")
router.put("/:id/status", (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "paid", "failed", "shipped", "cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "وضعیت نامعتبر" });

  const existing = db.prepare("SELECT id FROM orders WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "سفارش پیدا نشد" });

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
