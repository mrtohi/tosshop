require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./index");

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "مدیر فروشگاه";

if (!email || !password) {
  console.error("لطفاً ADMIN_EMAIL و ADMIN_PASSWORD را در فایل .env تنظیم کنید و دوباره اجرا کنید.");
  process.exit(1);
}

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
if (existing) {
  console.log("ادمینی با این ایمیل از قبل وجود دارد.");
  process.exit(0);
}

const hash = bcrypt.hashSync(password, 10);
db.prepare("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)").run(email, hash, name);
console.log(`ادمین با ایمیل ${email} ساخته شد. حالا می‌توانید با همین ایمیل و رمز وارد پنل /admin بشوید.`);
