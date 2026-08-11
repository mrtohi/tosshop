import { API_BASE } from "./api";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("khanekala-admin-token");
}

export function setToken(token) {
  localStorage.setItem("khanekala-admin-token", token);
}

export function clearToken() {
  localStorage.removeItem("khanekala-admin-token");
}

async function authedFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("نشست منقضی شده");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "خطای ناشناخته");
  }
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "ورود ناموفق بود");
  }
  return res.json();
}

export const getAdminProducts = () => authedFetch("/api/admin/products");
export const createProduct = (data) =>
  authedFetch("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) =>
  authedFetch(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) =>
  authedFetch(`/api/admin/products/${id}`, { method: "DELETE" });
export const uploadProductImage = (id, file) => {
  const form = new FormData();
  form.append("image", file);
  return authedFetch(`/api/admin/products/${id}/image`, { method: "POST", body: form });
};
export const uploadProductImages = (id, files) => {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  return authedFetch(`/api/admin/products/${id}/images`, { method: "POST", body: form });
};
export const deleteProductImage = (id, imageId) =>
  authedFetch(`/api/admin/products/${id}/images/${imageId}`, { method: "DELETE" });

export const getAdminOrders = () => authedFetch("/api/admin/orders");
export const updateOrderStatus = (id, status) =>
  authedFetch(`/api/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

export const getStats = () => authedFetch("/api/admin/stats");

export const getAdminReviews = (approved = 0) => authedFetch(`/api/admin/reviews?approved=${approved}`);
export const approveReview = (id) => authedFetch(`/api/admin/reviews/${id}/approve`, { method: "PUT" });
export const deleteReview = (id) => authedFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });

export const importProductsCsv = (file) => {
  const form = new FormData();
  form.append("file", file);
  return authedFetch("/api/admin/import/products", { method: "POST", body: form });
};

export const generateDescription = (data) =>
  authedFetch("/api/admin/ai/description", { method: "POST", body: JSON.stringify(data) });
