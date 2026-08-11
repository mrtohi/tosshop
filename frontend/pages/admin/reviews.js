import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Stars from "../../components/Stars";
import { getAdminReviews, approveReview, deleteReview } from "../../lib/adminApi";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getAdminReviews(0).then(setReviews).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const approve = async (id) => { await approveReview(id); load(); };
  const remove = async (id) => { await deleteReview(id); load(); };

  return (
    <AdminLayout>
      <h1 className="text-xl font-extrabold mb-6">نظرات در انتظار تأیید</h1>
      {loading ? (
        <div className="text-[#7C8B88]">در حال بارگذاری...</div>
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-4 border border-[#DDE3E0]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">{r.author_name} — <span className="text-[#7C8B88] font-normal">{r.product_name}</span></span>
                <Stars rating={r.rating} count={0} />
              </div>
              {r.comment && <p className="text-sm text-[#4A5854] mb-3">{r.comment}</p>}
              <div className="flex gap-3">
                <button onClick={() => approve(r.id)} className="text-primary text-sm font-bold">تأیید</button>
                <button onClick={() => remove(r.id)} className="text-[#C1443C] text-sm font-bold">حذف</button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <div className="text-sm text-[#7C8B88]">نظر جدیدی در انتظار تأیید نیست</div>}
        </div>
      )}
    </AdminLayout>
  );
}
