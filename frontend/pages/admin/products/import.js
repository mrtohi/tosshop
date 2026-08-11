import { useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { importProductsCsv } from "../../../lib/adminApi";

export default function ImportProducts() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await importProductsCsv(file);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-extrabold mb-6">ورود گروهی محصولات از CSV</h1>

      <div className="bg-white rounded-2xl p-6 border border-[#DDE3E0] max-w-2xl">
        <h2 className="font-bold text-sm mb-2">فرمت فایل CSV</h2>
        <p className="text-xs text-[#7C8B88] mb-3">
          ردیف اول باید همین نام ستون‌ها باشد. فقط <code>name</code>، <code>brand</code>، <code>category</code> و <code>price</code> الزامی‌اند؛ بقیه اختیاری‌اند.
        </p>
        <pre className="bg-surface rounded-lg p-3 text-[11px] overflow-x-auto mb-6" dir="ltr">
name,brand,category,price,compare_at_price,sku,energy_class,stock,description,specs{"\n"}
یخچال ۲۰ فوت,کاسپین,fridge,45000000,52000000,FR-2201,A+++,8,"توضیح کوتاه","وزن:۸۵ کیلوگرم;رنگ:نقره‌ای"
        </pre>
        <p className="text-xs text-[#7C8B88] mb-6">
          مقدار دسته‌بندی (<code>category</code>) باید یکی از این‌ها باشد: <code>fridge</code>, <code>washer</code>, <code>vacuum</code>, <code>tv</code>, <code>microwave</code>, <code>ac</code>
        </p>

        <form onSubmit={submit} className="flex items-center gap-3">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
          <button
            type="submit"
            disabled={!file || loading}
            className="px-5 py-2 rounded-lg font-bold text-white bg-primary text-sm disabled:opacity-60"
          >
            {loading ? "در حال پردازش..." : "ورود محصولات"}
          </button>
        </form>

        {error && <div className="text-sm rounded-lg p-3 mt-4 bg-[#FBE9E7] text-[#C1443C]">{error}</div>}

        {result && (
          <div className="mt-6">
            <div className="text-sm rounded-lg p-3 mb-3 bg-[#DCE6E2] text-primary">
              {result.inserted.toLocaleString("fa-IR")} محصول با موفقیت اضافه شد.
            </div>
            {result.errors.length > 0 && (
              <div className="text-sm rounded-lg p-3 bg-[#FBE9E7] text-[#C1443C]">
                <div className="font-bold mb-1">خطاها ({result.errors.length.toLocaleString("fa-IR")}):</div>
                <ul className="list-disc pr-5">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
