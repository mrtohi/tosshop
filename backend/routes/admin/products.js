const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../../db");
const { requireAdmin } = require("../../middleware/auth");
const { slugify } = require("../../utils/slugify");

const router = express.Router();
router.use(requireAdmin);

// --- تنظیم آپلود عکس ---
const uploadDir = path.join(__dirname, "..", "..", "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${req.params.id}-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ۵ مگابایت
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.mimetype)) return cb(new Error("فقط فایل‌های JPG، PNG یا WEBP مجاز است"));
    cb(null, true);
  },
});

// GET /api/admin/products — لیست کامل (شامل غیرفعال‌ها و کم‌موجودی‌ها هم می‌شود)
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  const withImages = rows.map((p) => ({
    ...p,
    images: db.prepare("SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order").all(p.id).map((r) => r.url),
    specs: p.specs ? JSON.parse(p.specs) : [],
  }));
  res.json(withImages);
});

// POST /api/admin/products — ساخت محصول جدید
router.post("/", (req, res) => {
  const { name, brand, category, price, energy_class, stock, description, sku, compare_at_price, active, specs } = req.body;
  if (!name || !brand || !category || !price || !energy_class) {
    return res.status(400).json({ error: "فیلدهای الزامی را پر کنید" });
  }
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO products (name, brand, category, price, energy_class, stock, description, sku, compare_at_price, active, specs, slug)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, brand, category, price, energy_class, stock ?? 10, description ?? "",
    sku ?? "", compare_at_price ?? 0, active === false || active === 0 ? 0 : 1,
    specs ? JSON.stringify(specs) : "", slugify(name)
  );

  res.status(201).json(db.prepare("SELECT * FROM products WHERE id = ?").get(lastInsertRowid));
});

// PUT /api/admin/products/:id — ویرایش محصول
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "محصول پیدا نشد" });

  const fields = { ...existing, ...req.body };
  db.prepare(`
    UPDATE products SET
      name=?, brand=?, category=?, price=?, energy_class=?, stock=?, description=?,
      sku=?, compare_at_price=?, active=?, specs=?, slug=?
    WHERE id=?
  `).run(
    fields.name, fields.brand, fields.category, fields.price,
    fields.energy_class, fields.stock, fields.description,
    fields.sku ?? "", fields.compare_at_price ?? 0,
    fields.active === false || fields.active === 0 ? 0 : 1,
    Array.isArray(fields.specs) ? JSON.stringify(fields.specs) : (fields.specs ?? existing.specs ?? ""),
    fields.name !== existing.name ? slugify(fields.name) : existing.slug,
    req.params.id
  );

  res.json(db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id));
});

// DELETE /api/admin/products/:id
router.delete("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "محصول پیدا نشد" });
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// POST /api/admin/products/:id/image — آپلود یک عکس (سازگاری با نسخهٔ قبلی؛ عکس اصلی را جایگزین می‌کند)
router.post("/:id/image", upload.single("image"), (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "محصول پیدا نشد" });
  if (!req.file) return res.status(400).json({ error: "فایلی دریافت نشد" });

  const imageUrl = `/uploads/products/${req.file.filename}`;
  db.prepare("UPDATE products SET image_url = ? WHERE id = ?").run(imageUrl, req.params.id);
  res.json({ image_url: imageUrl });
});

// POST /api/admin/products/:id/images — آپلود گالری چند تصویری (حداکثر ۶ تصویر)
router.post("/:id/images", upload.array("images", 6), (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "محصول پیدا نشد" });
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: "فایلی دریافت نشد" });

  const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM product_images WHERE product_id = ?")
    .get(req.params.id).m;

  const insert = db.prepare("INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)");
  const urls = req.files.map((file, i) => {
    const url = `/uploads/products/${file.filename}`;
    insert.run(req.params.id, url, maxOrder + 1 + i);
    return url;
  });

  // اگر محصول تا الان عکس اصلی نداشت، اولین عکس گالری را به‌عنوان عکس اصلی هم ثبت می‌کنیم
  // (برای سازگاری با فید ترب و نسخه‌های قدیمی‌تر فرانت‌اند)
  if (!existing.image_url && urls.length > 0) {
    db.prepare("UPDATE products SET image_url = ? WHERE id = ?").run(urls[0], req.params.id);
  }

  res.status(201).json({ images: urls });
});

// DELETE /api/admin/products/:id/images/:imageId — حذف یک تصویر از گالری
router.delete("/:id/images/:imageId", (req, res) => {
  db.prepare("DELETE FROM product_images WHERE id = ? AND product_id = ?")
    .run(req.params.imageId, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
