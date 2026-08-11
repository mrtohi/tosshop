# فرانت‌اند خانه‌کالا (Next.js)

نسخهٔ سئو-محور فروشگاه — صفحات محصولات سمت سرور رندر می‌شوند تا گوگل محتوای واقعی را ببیند.

## تفاوت با نسخهٔ قبلی (فایل appliance-store.jsx)

آن فایل یک آرتیفکت تک‌فایلی React بود که کاملاً سمت مرورگر اجرا می‌شد — گوگل موقع ایندکس‌کردن
صفحهٔ خالی می‌دید. این پروژه با **Next.js** ساخته شده: هر صفحه (خصوصاً صفحهٔ هر محصول) قبل از
رسیدن به مرورگر، روی سرور با محتوای واقعی HTML می‌شود.

## نصب و اجرا (محیط توسعه)

```bash
npm install
cp .env.example .env.local
```

مقدار `NEXT_PUBLIC_API_BASE` را به آدرس بک‌اند واقعی‌تان تغییر دهید (یا برای تست محلی همان
`http://localhost:4000` را نگه دارید، به شرط اینکه بک‌اند هم همان‌جا اجرا باشد).

```bash
npm run dev
```

سایت روی `http://localhost:3000` بالا می‌آید.

## دیپلوی روی سرور (کنار همان بک‌اندی که ساختیم)

```bash
npm install
npm run build
```

اجرای دائمی با PM2 (مثل بک‌اند):

```bash
pm2 start npm --name khanekala-frontend -- start
pm2 save
```

### تنظیم Nginx

چون هم بک‌اند (پورت ۴۰۰۰) و هم فرانت‌اند (پورت ۳۰۰۰) روی یک سرور اجرا می‌شوند، دو بلوک جدا در Nginx لازم است:

```nginx
# فرانت‌اند — دامنهٔ اصلی
server {
    listen 80;
    server_name www.tosshop.ir tosshop.ir;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# بک‌اند — ساب‌دامین api
server {
    listen 80;
    server_name api.tosshop.ir;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

فراموش نکنید یک رکورد DNS از نوع A برای `api.tosshop.ir` هم به همین IP سرور اضافه کنید، سپس:

```bash
sudo certbot --nginx -d www.tosshop.ir -d tosshop.ir -d api.tosshop.ir
```

### هماهنگی با بک‌اند

در فایل `.env` بک‌اند، این مقدار را به‌روزرسانی کنید تا CORS و لینک‌های فید درست کار کنند:

```
FRONTEND_URL=https://www.tosshop.ir
ZARINPAL_CALLBACK_URL=https://api.tosshop.ir/api/payment/verify
```

## نکات سئو که همین حالا فعال هستند

- هر صفحهٔ محصول (`/product/[id]`) عنوان، توضیحات، لینک canonical، و داده‌ساختاریافتهٔ
  Schema.org از نوع `Product` مخصوص خودش را دارد — این باعث می‌شود گوگل بتواند قیمت و موجودی
  را مستقیم در نتایج جستجو نشان دهد.
- `/sitemap.xml` روی دامنهٔ اصلی به‌صورت خودکار از بک‌اند (`/feed/sitemap.xml`) proxy می‌شود.
- `robots.txt` در `public/robots.txt` قرار دارد.

## قدم‌های بعدی برای سئوی قوی‌تر (پیشنهادی، هنوز ساخته نشده)

- ثبت سایت در Google Search Console و ارسال sitemap
- اضافه‌کردن تصاویر واقعی محصولات (الان placeholder آیکون است — گوگل و ترب هر دو عکس واقعی می‌خواهند)
- صفحهٔ توضیحات طولانی‌تر برای هر محصول (محتوای بیشتر = رتبهٔ بهتر)
- بخش نظرات و امتیاز مشتریان (schema.org Review/AggregateRating)
- صفحات دسته‌بندی مجزا با URL خودشان (`/category/fridge`) به‌جای فیلتر کلاینتی
