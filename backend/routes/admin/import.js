const express = require("express");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const db = require("../../db");
const { requireAdmin } = require("../../middleware/auth");
const { slugify } = require("../../utils/slugify");

const router = express.Router();
router.use(requireAdmin);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const VALID_ENERGY = ["A+++", "A++", "A+", "A", "B", "C", "D"];

// POST /api/admin/import/products — آپلود فایل CSV و افزودن گروهی محصولات
// ستون‌های موردانتظار: name,brand,category,price,compare_at_price,sku,energy_class,stock,description,specs
// specs به‌شکل "وزن:۱۲ کیلوگرم;رنگ:سفید" نوشته می‌شود (هر مشخصه با ; از بعدی جدا می‌شود)
router.post("/products", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "فایلی دریافت نشد" });

  let rows;
  try {
    rows = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true, bom: true });
  } catch (err) {
    return res.status(400).json({ error: "فایل CSV قابل خواندن نیست: " + err.message });
  }

  const insert = db.prepare(`
    INSERT INTO products (name, brand, category, price, compare_at_price, sku, energy_class, stock, description, specs, slug, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const results = { inserted: 0, errors: [] };

  rows.forEach((row, i) => {
    const line = i + 2; // شمارهٔ خط واقعی در فایل (خط ۱ هدر است)
    const name = row.name?.trim();
    const brand = row.brand?.trim();
    const category = row.category?.trim();
    const price = Number(row.price);

    if (!name || !brand || !category || !price) {
      results.errors.push(`خط ${line}: نام، برند، دسته‌بندی و قیمت الزامی است`);
      return;
    }
    const energyClass = VALID_ENERGY.includes(row.energy_class) ? row.energy_class : "A";
    const specs = (row.specs || "")
      .split(";")
      .map((pair) => pair.split(":").map((s) => s.trim()))
      .filter((p) => p.length === 2 && p[0]);

    try {
      insert.run(
        name, brand, category, price,
        Number(row.compare_at_price) || 0,
        row.sku?.trim() || "",
        energyClass,
        Number(row.stock) || 10,
        row.description?.trim() || "",
        specs.length ? JSON.stringify(specs) : "",
        slugify(name)
      );
      results.inserted++;
    } catch (err) {
      results.errors.push(`خط ${line}: ${err.message}`);
    }
  });

  res.json(results);
});

module.exports = router;
