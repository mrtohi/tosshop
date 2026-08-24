const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const db = new Database(path.join(__dirname, "store.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,      -- به تومان (قیمت نهایی/فروش)
    energy_class TEXT NOT NULL,  -- A+++ تا D
    stock INTEGER NOT NULL DEFAULT 10,
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',   -- تصویر اصلی (سازگاری با نسخهٔ قبلی)
    sku TEXT DEFAULT '',
    compare_at_price INTEGER DEFAULT 0, -- قیمت قبل از تخفیف؛ ۰ یعنی بدون تخفیف
    specs TEXT DEFAULT '',              -- مشخصات فنی JSON: [["وزن","۱۲ کیلوگرم"]]
    slug TEXT DEFAULT '',                -- برای URL خوانا مثل /product/12-یخچال-کاسپین
    active INTEGER NOT NULL DEFAULT 1,  -- ۱=فعال و قابل نمایش، ۰=غیرفعال
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT DEFAULT '',
    approved INTEGER NOT NULL DEFAULT 0, -- نظرات ابتدا تأییدنشده‌اند، ادمین تأیید می‌کند
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT '',
    postal_code TEXT DEFAULT '',
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed | shipped
    authority TEXT,        -- کد پیگیری زرین‌پال
    ref_id TEXT,           -- کد رهگیری پرداخت موفق
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    qty INTEGER NOT NULL,
    price INTEGER NOT NULL -- قیمت واحد در لحظه سفارش
  );
`);

// مهاجرت ساده برای پایگاه‌داده‌های قدیمی‌تر که ستون‌های جدید را ندارند
// (این روش امن است: فقط ستون اضافه می‌کند، هیچ داده‌ای پاک نمی‌شود)
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("products", "description", "TEXT DEFAULT ''");
ensureColumn("products", "image_url", "TEXT DEFAULT ''");
ensureColumn("products", "sku", "TEXT DEFAULT ''");
ensureColumn("products", "compare_at_price", "INTEGER DEFAULT 0");
ensureColumn("products", "active", "INTEGER NOT NULL DEFAULT 1");
// مشخصات فنی به‌صورت JSON ذخیره می‌شود: [["وزن","۱۲ کیلوگرم"], ["رنگ","سفید"]]
ensureColumn("products", "specs", "TEXT DEFAULT ''");
ensureColumn("products", "slug", "TEXT DEFAULT ''");
ensureColumn("orders", "city", "TEXT DEFAULT ''");
ensureColumn("orders", "postal_code", "TEXT DEFAULT ''");
ensureColumn("orders", "public_token", "TEXT DEFAULT ''");
const ordersMissingToken = db.prepare("SELECT id FROM orders WHERE public_token = '' OR public_token IS NULL").all();
if (ordersMissingToken.length > 0) {
  const updateOrderToken = db.prepare("UPDATE orders SET public_token = ? WHERE id = ?");
  ordersMissingToken.forEach((order) => updateOrderToken.run(crypto.randomBytes(32).toString("hex"), order.id));
}

// برای محصولات قدیمی‌تر که هنوز اسلاگ ندارند، از روی نامشان یک اسلاگ می‌سازیم
const { slugify } = require("../utils/slugify");
const missingSlug = db.prepare("SELECT id, name FROM products WHERE slug = '' OR slug IS NULL").all();
if (missingSlug.length > 0) {
  const updateSlug = db.prepare("UPDATE products SET slug = ? WHERE id = ?");
  missingSlug.forEach((p) => updateSlug.run(slugify(p.name), p.id));
}

module.exports = db;
