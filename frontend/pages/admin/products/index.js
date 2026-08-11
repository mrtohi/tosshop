import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../components/AdminLayout";
import { getAdminProducts, deleteProduct } from "../../lib/adminApi";
import { CATS } from "../../components/icons";

const toman = (n) => n.toLocaleString("fa-IR") + " تومان";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getAdminProducts().then(setProducts).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("این محصول حذف شود؟")) return;
    await deleteProduct(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold">محصولات</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/import" className="px-4 py-2 rounded-lg font-bold text-primary border border-primary text-sm">
            ورود گروهی از CSV
          </Link>
          <Link href="/admin/products/new" className="px-4 py-2 rounded-lg font-bold text-white bg-accent text-sm">
            + محصول جدید
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-[#7C8B88]">در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#DDE3E0] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-[#4A5854]">
              <tr>
                <th className="text-right p-3">نام</th>
                <th className="text-right p-3">دسته</th>
                <th className="text-right p-3">قیمت</th>
                <th className="text-right p-3">موجودی</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-surface">
                  <td className="p-3 font-semibold">{p.name}</td>
                  <td className="p-3 text-[#7C8B88]">
                    {CATS.find((c) => c.id === p.category)?.label || p.category}
                  </td>
                  <td className="p-3">{toman(p.price)}</td>
                  <td className="p-3">{p.stock <= 3 ? <span className="text-[#C1443C] font-bold">{p.stock}</span> : p.stock}</td>
                  <td className="p-3 text-left whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-primary font-semibold ml-3">ویرایش</Link>
                    <button onClick={() => remove(p.id)} className="text-[#C1443C] font-semibold">حذف</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-[#7C8B88]">هنوز محصولی ثبت نشده</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
