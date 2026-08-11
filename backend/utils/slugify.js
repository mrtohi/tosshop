// نام محصول را به یک اسلاگ خوانا برای URL تبدیل می‌کند
// حروف فارسی حفظ می‌شوند (در URL کاملاً معتبرند)، فاصله‌ها به خط تیره تبدیل می‌شوند
function slugify(text) {
  return String(text)
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

module.exports = { slugify };
