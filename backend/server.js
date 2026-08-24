require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const { generalLimiter, loginLimiter, writeLimiter } = require("./middleware/rateLimit");

const productsRouter = require("./routes/products");
const reviewsRouter = require("./routes/reviews");
const ordersRouter = require("./routes/orders");
const paymentRouter = require("./routes/payment");
const feedRouter = require("./routes/feed");
const authRouter = require("./routes/auth");
const searchRouter = require("./routes/search");
const adminProductsRouter = require("./routes/admin/products");
const adminOrdersRouter = require("./routes/admin/orders");
const adminStatsRouter = require("./routes/admin/stats");
const adminReviewsRouter = require("./routes/admin/reviews");
const adminImportRouter = require("./routes/admin/import");
const adminAiRouter = require("./routes/admin/ai");

const app = express();

// هدرهای امنیتی HTTP (جلوگیری از XSS، Clickjacking و غیره)
// crossOriginResourcePolicy خاموش می‌شود چون عکس‌های /uploads باید از دامنهٔ فرانت‌اند قابل‌نمایش باشند
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include server-to-server calls and the
    // payment gateway callback. Browser requests must be explicitly allowed.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(express.json());
app.use(generalLimiter);

// عکس‌های آپلودشدهٔ محصولات، به‌صورت عمومی در دسترس‌اند
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", productsRouter);
app.use("/api/products", reviewsRouter); // مسیرهای /:id/reviews را اضافه می‌کند
app.use("/api/orders", writeLimiter, ordersRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/search", searchRouter);
app.use("/api/auth", loginLimiter, authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/admin/reviews", adminReviewsRouter);
app.use("/api/admin/import", adminImportRouter);
app.use("/api/admin/ai", adminAiRouter);
app.use("/feed", feedRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: "مسیر پیدا نشد" }));

// هندلر کلی خطا — مثلاً خطاهای multer (حجم زیاد فایل، فرمت غلط) را به‌صورت JSON برمی‌گرداند
// به‌جای صفحهٔ خطای HTML پیش‌فرض Express
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "خطای داخلی سرور" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`سرور خانه‌کالا روی پورت ${PORT} اجرا شد`);
});
