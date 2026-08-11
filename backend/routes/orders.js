const express = require("express");
const db = require("../db");

const router = express.Router();

// POST /api/orders
// body: { customerName, phone, address, city, postalCode, items: [{ productId, qty }] }
router.post("/", (req, res) => {
  const { customerName, phone, address, city, postalCode, items } = req.body;

  if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "اطلاعات سفارش ناقص است" });
  }
  if (!/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ error: "شماره موبایل معتبر نیست" });
  }

  const getProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, phone, address, city, postal_code, total, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, qty, price)
    VALUES (?, ?, ?, ?)
  `);

  try {
    const tx = db.transaction(() => {
      let total = 0;
      const resolvedItems = items.map(({ productId, qty }) => {
        const product = getProduct.get(productId);
        if (!product) throw new Error(`محصول با شناسه ${productId} پیدا نشد`);
        if (product.stock < qty) throw new Error(`موجودی «${product.name}» کافی نیست`);
        total += product.price * qty;
        return { product, qty };
      });

      const { lastInsertRowid: orderId } = insertOrder.run(
        customerName, phone, address, city || "", postalCode || "", total
      );
      resolvedItems.forEach(({ product, qty }) => {
        insertItem.run(orderId, product.id, qty, product.price);
      });

      return { orderId, total };
    });

    const { orderId, total } = tx();
    res.status(201).json({ orderId, total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders/:id
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

module.exports = router;
