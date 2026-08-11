const db = require("./index");

const products = [
  ["یخچال فریزر دوقلو نوترون", "کاسپین", "fridge", 48900000, "A+++"],
  ["یخچال ساید بای ساید مرجان", "آلتون", "fridge", 62500000, "A++"],
  ["ماشین لباسشویی ۸ کیلویی درب از جلو", "دیاکو", "washer", 21300000, "A+++"],
  ["ماشین لباسشویی ۹ کیلویی اینورتر", "سپهر", "washer", 26800000, "A++"],
  ["جاروبرقی بدون کیسه سایکلونی", "رعد", "vacuum", 6450000, "A"],
  ["جارو شارژی عمودی توان بالا", "الوان", "vacuum", 8900000, "A+"],
  ["تلویزیون ۵۵ اینچ ۴K هوشمند", "نگین", "tv", 34200000, "A"],
  ["تلویزیون ۴۳ اینچ فورکی", "پارسیان", "tv", 21900000, "A+"],
  ["مایکروویو گریل‌دار ۲۵ لیتری", "خزر", "microwave", 5200000, "A"],
  ["مایکروویو توکار دیجیتال", "دیاکو", "microwave", 9800000, "A+"],
  ["کولر گازی ۱۸۰۰۰ اینورتر", "سرد و گرم البرز", "ac", 27500000, "A+++"],
  ["کولر گازی ۹۰۰۰ دیواری", "تهویه شرق", "ac", 14300000, "A++"],
];

const insert = db.prepare(`
  INSERT INTO products (name, brand, category, price, energy_class)
  VALUES (?, ?, ?, ?, ?)
`);

const already = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
if (already === 0) {
  const tx = db.transaction((rows) => rows.forEach((r) => insert.run(...r)));
  tx(products);
  console.log(`${products.length} محصول به پایگاه‌داده اضافه شد.`);
} else {
  console.log("محصولات از قبل موجودند، seed رد شد.");
}
