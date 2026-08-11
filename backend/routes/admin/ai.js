const express = require("express");
const axios = require("axios");
const { requireAdmin } = require("../../middleware/auth");
const { writeLimiter } = require("../../middleware/rateLimit");

const router = express.Router();
router.use(requireAdmin);

// POST /api/admin/ai/description
// body: { name, brand, category, energyClass, specs: [["وزن","۱۲ کیلوگرم"], ...] }
// یک توضیح محصول اورجینال (نه کپی از جای دیگر) بر اساس مشخصات خام تولید می‌کند —
// این برای سئو بسیار بهتر از کپی توضیحات دیجی‌کالا است چون گوگل محتوای تکراری را جریمه می‌کند
router.post("/description", writeLimiter, async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(400).json({ error: "ANTHROPIC_API_KEY در فایل .env تنظیم نشده است" });
  }

  const { name, brand, category, energyClass, specs = [] } = req.body;
  if (!name || !brand) return res.status(400).json({ error: "نام و برند محصول الزامی است" });

  const specsText = specs.map(([k, v]) => `${k}: ${v}`).join("\n") || "مشخصات اضافی ثبت نشده";

  const prompt = `تو کپی‌رایتر فارسی‌نویس فروشگاه لوازم خانگی «خانه‌کالا» هستی.
یک توضیح محصول ۹۰ تا ۱۳۰ کلمه‌ای، کاملاً اورجینال (نه کپی از هیچ سایتی)، روان و متقاعدکننده برای محصول زیر بنویس.
لحن: حرفه‌ای و قابل‌اعتماد، نه تبلیغاتی اغراق‌آمیز. فقط از اطلاعاتی که داده شده استفاده کن، ادعای دروغ اضافه نکن.
فقط متن توضیح را برگردان، بدون مقدمه یا عنوان.

نام محصول: ${name}
برند: ${brand}
دسته‌بندی: ${category || "لوازم خانگی"}
رده انرژی: ${energyClass || "نامشخص"}
مشخصات فنی:
${specsText}`;

  try {
    const { data } = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-5",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    const description = data.content?.find((b) => b.type === "text")?.text?.trim();
    if (!description) return res.status(502).json({ error: "پاسخ نامعتبر از سرویس هوش مصنوعی" });

    res.json({ description });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(502).json({ error: "اتصال به سرویس هوش مصنوعی ناموفق بود" });
  }
});

module.exports = router;
