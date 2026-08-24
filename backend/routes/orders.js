const express = require("express");
const crypto = require("crypto");
const db = require("../db");

const router = express.Router();

function hasValidOrderToken(token, order) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token) || !order.public_token) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(order.public_token));
}

router.post("/", (req, res) => {
  const { customerName, phone, address, city, postalCode, items } = req.body;
  if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "اطلاعات سفارش ناقص است" });
  }
  if (!/^09\d{9}$/.test(phone)) return res.status(400).json({ error: "شماره موبایل معتبر نیست" });

  const getProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, phone, address, city, postal_code, total, status, public_token)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `);
  const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)");

  try {
    const tx = db.transaction(() => {
      let total = 0;
      const publicToken = crypto.randomBytes(32).toString("hex");
      const resolvedItems = items.map(({ productId, qty }) => {
        if (!Number.isSafeInteger(qty) || qty < 1) throw new Error("تعداد محصول نامعتبر است");
        const product = getProduct.get(productId);
        if (!product) throw new Error("محصول پیدا نشد");
        if (product.stock < qty) throw new Error("موجودی محصول کافی نیست");
        total += product.price * qty;
        return { product, qty };
      });
      const { lastInsertRowid: orderId } = insertOrder.run(
        customerName, phone, address, city || "", postalCode || "", total, publicToken
      );
      resolvedItems.forEach(({ product, qty }) => insertItem.run(orderId, product.id, qty, product.price));
      return { orderId, total, publicToken };
    });
    const { orderId, total, publicToken } = tx();
    res.status(201).json({ orderId, total, orderToken: publicToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "سفارش پیدا نشد" });
  const token = req.get("X-Order-Token") || req.query.token;
  if (!hasValidOrderToken(token, order)) return res.status(401).json({ error: "دسترسی به سفارش مجاز نیست" });

  const items = db.prepare(`
    SELECT oi.qty, oi.price, p.name, p.brand
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(order.id);
  const { public_token, ...safeOrder } = order;
  res.json({ ...safeOrder, items });
});

module.exports = router;
