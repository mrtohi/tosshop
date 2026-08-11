import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getAdminOrders, updateOrderStatus } from "../../lib/adminApi";

const toman = (n) => n.toLocaleString("fa-IR") + " تومان";

const STATUS_LABEL = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  shipped: "ارسال‌شده",
  cancelled: "لغوشده",
};
const STATUS_COLOR = {
  pending: "#D98A3A", paid: "#4C9A63", failed: "#C1443C", shipped: "#24504C", cancelled: "#7C8B88",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getAdminOrders().then(setOrders).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-extrabold mb-6">سفارش‌ها</h1>
      {loading ? (
        <div className="text-[#7C8B88]">در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#DDE3E0] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-[#4A5854]">
              <tr>
                <th className="text-right p-3">شماره</th>
                <th className="text-right p-3">مشتری</th>
                <th className="text-right p-3">مبلغ</th>
                <th className="text-right p-3">وضعیت</th>
                <th className="text-right p-3">تغییر وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-surface">
                  <td className="p-3 font-semibold">#{o.id}</td>
                  <td className="p-3">{o.customer_name} — {o.phone}</td>
                  <td className="p-3">{toman(o.total)}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold text-white" style={{ background: STATUS_COLOR[o.status] }}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className="border border-[#DDE3E0] rounded-lg px-2 py-1 text-xs"
                    >
                      {Object.keys(STATUS_LABEL).map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-[#7C8B88]">هنوز سفارشی ثبت نشده</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
