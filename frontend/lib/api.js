export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

// params: { category, minPrice, maxPrice, inStock, sort, page, limit }
// خروجی: { products, total, page, limit, totalPages }
export async function getProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const url = `${API_BASE}/api/products${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("خطا در دریافت محصولات");
  return res.json();
}

export async function searchProducts(q) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("خطا در جست‌وجو");
  return res.json();
}

export async function getRelatedProducts(id) {
  const res = await fetch(`${API_BASE}/api/products/${id}/related`);
  if (!res.ok) return [];
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getReviews(productId) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`);
  if (!res.ok) return [];
  return res.json();
}

export async function submitReview(productId, { authorName, rating, comment }) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorName, rating, comment }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "ثبت نظر ناموفق بود");
  }
  return res.json();
}

export async function getOrder(id) {
  const res = await fetch(`${API_BASE}/api/orders/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("ثبت سفارش ناموفق بود");
  return res.json();
}

export async function requestPayment(orderId) {
  const res = await fetch(`${API_BASE}/api/payment/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) throw new Error("اتصال به درگاه پرداخت ناموفق بود");
  return res.json();
}
