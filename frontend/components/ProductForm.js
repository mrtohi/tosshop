import { useState } from "react";
import { CATS } from "./icons";
import { API_BASE } from "../lib/api";
import { generateDescription } from "../lib/adminApi";

const ENERGY_OPTIONS = ["A+++", "A++", "A+", "A", "B", "C", "D"];

export default function ProductForm({ initial, onSubmit, submitLabel, onImageSelect }) {
  const specsToText = (specs) => (specs || []).map(([k, v]) => `${k}: ${v}`).join("\n");
  const textToSpecs = (text) =>
    text.split("\n").map((line) => line.split(":")).filter((parts) => parts.length >= 2 && parts[0].trim())
      .map(([k, ...rest]) => [k.trim(), rest.join(":").trim()]);

  const [form, setForm] = useState({
    name: initial?.name || "",
    brand: initial?.brand || "",
    category: initial?.category || CATS[0].id,
    price: initial?.price || "",
    compare_at_price: initial?.compare_at_price || "",
    sku: initial?.sku || "",
    energy_class: initial?.energy_class || "A",
    stock: initial?.stock ?? 10,
    description: initial?.description || "",
    active: initial?.active ?? 1,
    specsText: specsToText(initial?.specs),
  });
  const [saving, setSaving] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleGenerateDescription = async () => {
    if (!form.name || !form.brand) {
      setAiError("اول نام و برند محصول را وارد کنید");
      return;
    }
    setGenerating(true);
    setAiError("");
    try {
      const catLabel = CATS.find((c) => c.id === form.category)?.label || form.category;
      const { description } = await generateDescription({
        name: form.name,
        brand: form.brand,
        category: catLabel,
        energyClass: form.energy_class,
        specs: textToSpecs(form.specsText),
      });
      setForm((f) => ({ ...f, description }));
    } catch (err) {
      setAiError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(
        {
          ...form,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : 0,
          stock: Number(form.stock),
          active: form.active ? 1 : 0,
          specs: textToSpecs(form.specsText),
        },
        mainImage,
        galleryFiles
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl p-6 border border-[#DDE3E0] max-w-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold block mb-1">نام محصول</label>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={!!form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          نمایش در فروشگاه (فعال)
        </label>
      </div>
      <input value={form.name} onChange={set("name")} required className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">برند</label>
          <input value={form.brand} onChange={set("brand")} required className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">دسته‌بندی</label>
          <select value={form.category} onChange={set("category")} className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm">
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">قیمت فروش (تومان)</label>
          <input type="number" value={form.price} onChange={set("price")} required className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">قیمت قبل از تخفیف (اختیاری)</label>
          <input type="number" value={form.compare_at_price} onChange={set("compare_at_price")} placeholder="خالی = بدون تخفیف" className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">کد کالا (SKU)</label>
          <input value={form.sku} onChange={set("sku")} className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">رده انرژی</label>
          <select value={form.energy_class} onChange={set("energy_class")} className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm">
            {ENERGY_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">موجودی</label>
          <input type="number" value={form.stock} onChange={set("stock")} required className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold block">توضیحات (برای صفحه محصول و سئو)</label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={generating}
            className="text-xs font-bold text-accent disabled:opacity-60"
          >
            {generating ? "در حال نوشتن..." : "✨ تولید با هوش مصنوعی"}
          </button>
        </div>
        {aiError && <p className="text-xs text-[#C1443C] mb-1">{aiError}</p>}
        <textarea value={form.description} onChange={set("description")} rows={4} className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm resize-none" />
        <p className="text-[11px] text-[#7C8B88] mt-1">توضیح تولیدشده اورجینال است — پیشنهاد می‌شود قبل از ذخیره، آن را بازبینی و در صورت نیاز اصلاح کنید.</p>
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1">مشخصات فنی (هر خط: عنوان: مقدار)</label>
        <textarea
          value={form.specsText}
          onChange={(e) => setForm((f) => ({ ...f, specsText: e.target.value }))}
          rows={4}
          placeholder={"وزن: ۱۲ کیلوگرم\nرنگ: سفید\nابعاد: ۶۰×۶۰×۸۵ سانتی‌متر"}
          className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm resize-none"
        />
      </div>

      {onImageSelect && (
        <>
          <div>
            <label className="text-sm font-semibold block mb-1">عکس اصلی</label>
            <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} className="text-sm" />
            {initial?.image_url && (
              <img src={`${API_BASE}${initial.image_url}`} alt="" className="w-20 h-20 object-cover rounded-lg mt-2 border border-[#DDE3E0]" />
            )}
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">گالری تصاویر بیشتر (اختیاری، حداکثر ۶ عکس)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files))} className="text-sm" />
            {initial?.images?.length > 0 && (
              <div className="flex gap-2 mt-2">
                {initial.images.map((img) => (
                  <img key={img} src={`${API_BASE}${img}`} alt="" className="w-16 h-16 object-cover rounded-lg border border-[#DDE3E0]" />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <button type="submit" disabled={saving} className="w-fit px-6 py-2.5 rounded-lg font-bold text-white bg-primary disabled:opacity-60">
        {saving ? "در حال ذخیره..." : submitLabel}
      </button>
    </form>
  );
}
