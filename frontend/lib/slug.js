// لینک محصول را با شناسه + اسلاگ خوانا می‌سازد، مثلاً /product/12-یخچال-کاسپین
// اگر اسلاگ نداشت (نسخه‌های قدیمی)، فقط شناسه استفاده می‌شود و همچنان کار می‌کند
export function productUrl(product) {
  return `/product/${product.id}${product.slug ? `-${product.slug}` : ""}`;
}

// از پارامتر URL (مثلاً "12-یخچال-کاسپین") فقط شناسهٔ عددی ابتدایی را استخراج می‌کند
export function extractProductId(slugParam) {
  return String(slugParam).split("-")[0];
}
