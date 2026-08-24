const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const db = require("../db");

const router = express.Router();
const SANDBOX = process.env.ZARINPAL_SANDBOX === "true";
const BASE = SANDBOX ? "https://sandbox.zarinpal.com/pg/v4/payment" : "https://payment.zarinpal.com/pg/v4/payment";
const STARTPAY = SANDBOX ? "https://sandbox.zarinpal.com/pg/StartPay" : "https://www.zarinpal.com/pg/StartPay";

function hasValidOrderToken(token, order) {
  return typeof token === "string" && /^[a-f0-9]{64}$/i.test(token) && order.public_token
    && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(order.public_token));
}

function checkoutUrl(path, order) {
  const url = new URL(path, process.env.FRONTEND_URL);
  url.searchParams.set("orderId", order.id);
  url.searchParams.set("orderToken", order.public_token);
  return url.toString();
}

router.post("/request", async (req, res) => {
  const { orderId, orderToken } = req.body;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return res.status(404).json({ error: "سفارش پیدا نشد" });
  if (!hasValidOrderToken(orderToken, order)) return res.status(401).json({ error: "دسترسی به سفارش مجاز نیست" });
  if (order.status === "paid") return res.status(400).json({ error: "این سفارش قبلاً پرداخت شده است" });

  try {
    const { data } = await axios.post(`${BASE}/request.json`, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: order.total * 10,
      callback_url: process.env.ZARINPAL_CALLBACK_URL,
      description: `پرداخت سفارش شماره ${order.id}`,
      metadata: { mobile: order.phone },
    });
    if (data.data?.code !== 100) return res.status(400).json({ error: "خطا در ایجاد تراکنش", details: data.errors });
    const authority = data.data.authority;
    db.prepare("UPDATE orders SET authority = ? WHERE id = ?").run(authority, order.id);
    res.json({ paymentUrl: `${STARTPAY}/${authority}` });
  } catch (err) {
    res.status(500).json({ error: "اتصال به درگاه پرداخت با خطا مواجه شد" });
  }
});

router.get("/verify", async (req, res) => {
  const { Authority, Status } = req.query;
  const order = db.prepare("SELECT * FROM orders WHERE authority = ?").get(Authority);
  if (!order) return res.status(404).send("سفارش پیدا نشد");
  if (order.status === "paid") return res.redirect(checkoutUrl("/checkout/success", order));
  if (Status !== "OK") {
    db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(order.id);
    return res.redirect(checkoutUrl("/checkout/failed", order));
  }
  try {
    const { data } = await axios.post(`${BASE}/verify.json`, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: order.total * 10,
      authority: Authority,
    });
    if (data.data?.code === 100 || data.data?.code === 101) {
      const items = db.prepare("SELECT product_id, qty FROM order_items WHERE order_id = ?").all(order.id);
      const decrementStock = db.prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?");
      const markPaid = db.prepare("UPDATE orders SET status = 'paid', ref_id = ? WHERE id = ?");
      db.transaction(() => {
        markPaid.run(String(data.data.ref_id), order.id);
        items.forEach((item) => decrementStock.run(item.qty, item.product_id));
      })();
      return res.redirect(checkoutUrl("/checkout/success", order));
    }
    db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(order.id);
    res.redirect(checkoutUrl("/checkout/failed", order));
  } catch (err) {
    db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(order.id);
    res.redirect(checkoutUrl("/checkout/failed", order));
  }
});

module.exports = router;
