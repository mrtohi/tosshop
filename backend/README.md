# بک‌اند فروشگاه خانه‌کالا

بک‌اند Node.js + Express + SQLite برای فروشگاه لوازم خانگی، با اتصال به درگاه پرداخت زرین‌پال.

## نصب و راه‌اندازی

```bash
npm install
cp .env.example .env
```

سپس فایل `.env` را باز کنید و مقدار `ZARINPAL_MERCHANT_ID` را با مرچنت‌کد واقعی خودتان
(از پنل [zarinpal.com](https://www.zarinpal.com)) جایگزین کنید. برای تست بدون حساب واقعی،
`ZARINPAL_SANDBOX=true` بگذارید و از هر UUID نمونه به‌عنوان مرچنت‌کد استفاده کنید.

پایگاه‌داده و داده‌های نمونه را بسازید:

```bash
npm run seed
```

اجرای سرور:

```bash
npm start
```

سرور روی `http://localhost:4000` بالا می‌آید.

## ⚠️ تغییر مهم در فاز ۱ (شکست‌دهندهٔ سازگاری با فرانت‌اند فعلی)

`GET /api/products` دیگر آرایه برنمی‌گرداند؛ حالا این شکل را می‌دهد:

```json
{ "products": [...], "total": 42, "page": 1, "limit": 12, "totalPages": 4 }
```

این برای پشتیبانی از pagination، فیلتر قیمت/موجودی، و مرتب‌سازی (`?sort=popular|price_asc|price_desc|newest`) لازم بود.
فرانت‌اند فعلی (Next.js) هنوز به‌روزرسانی نشده — تا فاز بعدی، صفحهٔ اصلی و صفحهٔ محصول با این تغییر خراب می‌مانند
مگر اینکه `data.products` را به‌جای خود `data` بخوانید.

## مسیرهای API

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/api/products` | لیست محصولات با pagination/فیلتر/مرتب‌سازی (`category`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, `limit`) |
| GET | `/api/products/:id` | جزئیات یک محصول (شامل `images[]`, `rating_avg`, `discount_percent`) |
| GET | `/api/products/:id/related` | محصولات مرتبط (همان دسته) |
| GET | `/api/products/:id/reviews` | نظرات تأییدشدهٔ یک محصول |
| POST | `/api/products/:id/reviews` | ثبت نظر جدید (در انتظار تأیید ادمین) |
| GET | `/api/search?q=...` | جست‌وجوی هوشمند در نام/برند/دسته |
| POST | `/api/orders` | ثبت سفارش جدید |
| GET | `/api/orders/:id` | جزئیات یک سفارش |
| POST | `/api/payment/request` | شروع پرداخت (بازگشت لینک درگاه) |
| GET | `/api/payment/verify` | تأیید پرداخت (آدرس بازگشت زرین‌پال) |
| POST | `/api/auth/login` | ورود ادمین، بازگشت توکن JWT |

### مسیرهای پنل مدیریت (نیاز به هدر `Authorization: Bearer TOKEN`)

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/api/admin/products` | لیست کامل محصولات |
| POST | `/api/admin/products` | ساخت محصول جدید |
| PUT | `/api/admin/products/:id` | ویرایش محصول |
| DELETE | `/api/admin/products/:id` | حذف محصول |
| POST | `/api/admin/products/:id/image` | آپلود عکس اصلی (`multipart/form-data`, فیلد `image`) |
| POST | `/api/admin/products/:id/images` | آپلود گالری چند تصویری (فیلد `images`, حداکثر ۶ فایل) |
| DELETE | `/api/admin/products/:id/images/:imageId` | حذف یک تصویر از گالری |
| GET | `/api/admin/reviews?approved=0` | نظرات در انتظار تأیید |
| PUT | `/api/admin/reviews/:id/approve` | تأیید یک نظر |
| DELETE | `/api/admin/reviews/:id` | حذف یک نظر |
| GET | `/api/admin/orders` | لیست همه سفارش‌ها |
| PUT | `/api/admin/orders/:id/status` | تغییر وضعیت سفارش |
| GET | `/api/admin/stats` | آمار داشبورد (فروش، سفارش‌ها، کم‌موجودی‌ها) |

## راه‌اندازی پنل مدیریت

بعد از `npm run seed`، این دستور را هم بزنید تا اولین حساب ادمین ساخته شود
(حتماً `ADMIN_EMAIL` و `ADMIN_PASSWORD` را در `.env` عوض کنید):

```bash
npm run create-admin
```

بعد از آن می‌توانید با همین ایمیل/رمز از فرانت‌اند وارد `/admin` بشوید.

### نمونه ثبت سفارش

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "علی رضایی",
    "phone": "09120000000",
    "address": "تهران، خیابان آزادی",
    "items": [{ "productId": 1, "qty": 1 }]
  }'
```

### نمونه شروع پرداخت

```bash
curl -X POST http://localhost:4000/api/payment/request \
  -H "Content-Type: application/json" \
  -d '{ "orderId": 1 }'
```

پاسخ شامل `paymentUrl` است — کاربر را به این آدرس هدایت کنید تا در سایت زرین‌پال پرداخت را انجام دهد.
بعد از پرداخت، زرین‌پال کاربر را به `ZARINPAL_CALLBACK_URL` برمی‌گرداند و سرور خودکار وضعیت
سفارش را در پایگاه‌داده به‌روزرسانی می‌کند و کاربر را به فرانت‌اند ریدایرکت می‌کند.

## اتصال فرانت‌اند (فایل appliance-store.jsx)

آرتیفکت فرانت‌اندی که قبلاً ساختم مستقیماً به این بک‌اند وصل نیست (آرتیفکت‌ها به سرورهای
دلخواه دسترسی شبکه ندارند). برای اتصال واقعی باید:

1. این بک‌اند را روی یک سرور واقعی (مثلاً Railway، Render، یا VPS خودتان) دیپلوی کنید.
2. در فرانت‌اند به‌جای داده‌های ثابت (`PRODUCTS` array)، با `fetch` به `/api/products` وصل شوید.
3. فرم "تکمیل خرید" را به `/api/orders` و سپس `/api/payment/request` وصل کنید.

## فید ترب و سئو

سه مسیر جدید اضافه شد:

| مسیر | کاربرد |
|---|---|
| `/feed/torob.xml` | فید محصولات با فرمت گوگل — این آدرس کامل (مثلاً `https://api.tosshop.ir/feed/torob.xml`) را در پنل فروشندگان ترب، بخش «افزودن فید جدید» ثبت کنید |
| `/feed/sitemap.xml` | نقشهٔ سایت برای گوگل — به Google Search Console معرفی کنید |
| `/feed/robots.txt` | فایل robots — باید در آدرس اصلی دامنه (`/robots.txt`) در دسترس باشد؛ اگر بک‌اند روی ساب‌دامین جدا (`api.`) است، این فایل را در فرانت‌اند هم قرار دهید |

⚠️ **نکتهٔ مهم درباره تصاویر**: فید فعلاً برای هر محصول آدرس `{FRONTEND_URL}/images/products/{id}.jpg` می‌سازد.
اگر این تصاویر واقعاً روی سرور وجود نداشته باشند، ترب فید را رد می‌کند. باید یا تصاویر واقعی محصولات را
در همین مسیر آپلود کنید، یا فیلد `image_url` را به جدول `products` اضافه کرده و لینک واقعی هر عکس را ذخیره کنید.

## نکات امنیتی پیش از انتشار واقعی

- فایل `.env` را هرگز در گیت‌هاب یا جای عمومی قرار ندهید.
- قبل از پرداخت واقعی، مبلغ سفارش را همیشه سمت سرور (نه از ورودی کاربر) محاسبه کنید — این کد همین‌طور عمل می‌کند.
- برای تولید واقعی، از HTTPS و یک پایگاه‌داده مقیاس‌پذیرتر (PostgreSQL/MySQL) به‌جای SQLite استفاده کنید.
- محدودیت نرخ درخواست (rate limiting) و اعتبارسنجی ورودی بیشتری اضافه کنید.

## امنیت (فاز ۶)

- **Helmet**: هدرهای امنیتی HTTP به‌صورت خودکار فعال است.
- **Rate Limiting**: محدودیت عمومی ۳۰۰ درخواست/۱۵دقیقه روی کل API؛ محدودیت سخت‌گیرانه‌تر (۱۰ تلاش/۱۵دقیقه) روی ورود ادمین؛ محدودیت ۲۰ درخواست/۱۰دقیقه روی ثبت سفارش و نظر.
- **آپلود فایل**: فقط JPG/PNG/WEBP با حجم حداکثر ۵ مگابایت؛ نام فایل روی سرور تصادفی تولید می‌شود.
- همهٔ کوئری‌های دیتابیس Parameterized هستند.
- تمام مسیرهای `/api/admin/*` نیازمند توکن JWT معتبرند.

## SEO تکمیلی (فاز ۷)

- URL محصولات حالا اسلاگ خوانا دارد: `/product/12-یخچال-فریزر-کاسپین` (لینک‌های قدیمی `/product/12` هم کار می‌کنند).
- جست‌وجوی زنده (پیشنهاد هنگام تایپ) در هدر با debounce ۳۰۰ میلی‌ثانیه‌ای.
