const rateLimit = require("express-rate-limit");

// محدودیت عمومی برای همهٔ API — از حملات ساده جلوگیری می‌کند
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ۱۵ دقیقه
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "درخواست‌های شما بیش از حد مجاز است، کمی صبر کنید" },
});

// محدودیت سخت‌گیرانه برای ورود ادمین — جلوگیری از حدس رمز عبور (brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تعداد تلاش برای ورود بیش از حد مجاز است، ۱۵ دقیقه دیگر امتحان کنید" },
});

// محدودیت ثبت سفارش و نظر — جلوگیری از اسپم
const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "درخواست‌های شما بیش از حد مجاز است، کمی صبر کنید" },
});

module.exports = { generalLimiter, loginLimiter, writeLimiter };
