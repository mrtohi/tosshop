import { useEffect, useState } from "react";
import Stars from "./Stars";
import { getReviews, submitReview } from "../lib/api";

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ authorName: "", rating: 5, comment: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    getReviews(productId).then(setReviews);
  }, [productId]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitReview(productId, form);
      setStatus("sent");
      setForm({ authorName: "", rating: 5, comment: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-5 pb-16">
      <h2 className="font-extrabold text-lg mb-4">نظرات کاربران ({reviews.length.toLocaleString("fa-IR")})</h2>

      <div className="flex flex-col gap-4 mb-8">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-[#DDE3E0]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">{r.author_name}</span>
              <Stars rating={r.rating} count={0} />
            </div>
            {r.comment && <p className="text-sm text-[#4A5854] leading-6">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-sm text-[#7C8B88]">هنوز نظری برای این محصول ثبت نشده — اولین نفر باشید.</div>
        )}
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl p-5 border border-[#DDE3E0] max-w-md">
        <h3 className="font-bold text-sm mb-3">ثبت نظر شما</h3>

        {status === "sent" && (
          <div className="text-sm rounded-lg p-3 mb-3 bg-[#DCE6E2] text-primary">
            نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.
          </div>
        )}
        {status === "error" && (
          <div className="text-sm rounded-lg p-3 mb-3 bg-[#FBE9E7] text-[#C1443C]">خطایی رخ داد، دوباره تلاش کنید.</div>
        )}

        <input
          placeholder="نام شما"
          value={form.authorName}
          onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
          required
          className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2 text-sm mb-3"
        />
        <select
          value={form.rating}
          onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
          className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2 text-sm mb-3"
        >
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ستاره</option>)}
        </select>
        <textarea
          placeholder="نظر شما (اختیاری)"
          value={form.comment}
          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
          rows={3}
          className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2 text-sm mb-3 resize-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-5 py-2 rounded-lg font-bold text-white bg-primary text-sm disabled:opacity-60"
        >
          {status === "sending" ? "در حال ارسال..." : "ثبت نظر"}
        </button>
      </form>
    </section>
  );
}
