import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getStats } from "../../lib/adminApi";

const toman = (n) => (n || 0).toLocaleString("fa-IR") + " تومان";

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DDE3E0]">
      <div className="text-xs text-[#7C8B88] font-semibold mb-2">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-xl font-extrabold mb-6">داشبورد</h1>
      {!stats ? (
        <div className="text-[#7C8B88]">در حال بارگذاری...</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="فروش امروز" value={toman(stats.todaySales)} />
            <StatCard label="فروش این ماه" value={toman(stats.monthSales)} />
            <StatCard label="فروش کل (پرداخت‌شده)" value={toman(stats.totalSales)} />
            <StatCard label="سفارش‌های در انتظار پرداخت" value={stats.pendingCount} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-[#DDE3E0]">
              <h2 className="font-bold mb-4">پرفروش‌ترین‌ها</h2>
              {stats.topProducts.length === 0 && <div className="text-sm text-[#7C8B88]">هنوز فروشی ثبت نشده</div>}
              {stats.topProducts.map((p) => (
                <div key={p.id} className="flex justify-between text-sm py-2 border-b border-surface last:border-0">
                  <span>{p.name}</span>
                  <span className="font-bold">{p.sold} عدد</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#DDE3E0]">
              <h2 className="font-bold mb-4">موجودی کم (۳ یا کمتر)</h2>
              {stats.lowStock.length === 0 && <div className="text-sm text-[#7C8B88]">همه محصولات موجودی کافی دارند</div>}
              {stats.lowStock.map((p) => (
                <div key={p.id} className="flex justify-between text-sm py-2 border-b border-surface last:border-0">
                  <span>{p.name}</span>
                  <span className="font-bold text-[#C1443C]">{p.stock} عدد</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
