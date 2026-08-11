const express = require("express");
const db = require("../../db");
const { requireAdmin } = require("../../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/reviews?approved=0 — پیش‌فرض: نظرات در انتظار تأیید
router.get("/", (req, res) => {
  const approved = req.query.approved === "1" ? 1 : 0;
  const rows = db.prepare(`
    SELECT r.*, p.name AS product_name
    FROM reviews r JOIN products p ON p.id = r.product_id
    WHERE r.approved = ?
    ORDER BY r.created_at DESC
  `).all(approved);
  res.json(rows);
});

// PUT /api/admin/reviews/:id/approve
router.put("/:id/approve", (req, res) => {
  db.prepare("UPDATE reviews SET approved = 1 WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// DELETE /api/admin/reviews/:id
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM reviews WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
