import { useState } from "react";
import { useRouter } from "next/router";
import { CATS } from "./icons";

export default function FilterSidebar({ query }) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(query.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(query.maxPrice || "");

  const applyFilters = (overrides = {}) => {
    const next = {
      ...query,
      minPrice, maxPrice,
      ...overrides,
      page: 1, // با تغییر فیلتر، به صفحهٔ اول برمی‌گردیم
    };
    Object.keys(next).forEach((k) => (next[k] === "" || next[k] == null) && delete next[k]);
    router.push({ pathname: "/shop", query: next });
  };

  return (
    <aside className="w-full lg:w-60 shrink-0 flex flex-col gap-6">
      <div>
        <h3 className="font-bold text-sm mb-3">دسته‌بندی</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => applyFilters({ category: undefined })}
            className={`text-right text-sm px-2 py-1.5 rounded-lg ${!query.category ? "bg-[#DCE6E2] text-primary font-bold" : "text-[#4A5854]"}`}
          >
            همه دسته‌ها
          </button>
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => applyFilters({ category: c.id })}
              className={`text-right text-sm px-2 py-1.5 rounded-lg ${query.category === c.id ? "bg-[#DCE6E2] text-primary font-bold" : "text-[#4A5854]"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-3">محدودهٔ قیمت (تومان)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="از"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-[#DDE3E0] rounded-lg px-2 py-1.5 text-xs"
          />
          <input
            type="number"
            placeholder="تا"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-[#DDE3E0] rounded-lg px-2 py-1.5 text-xs"
          />
        </div>
        <button
          onClick={() => applyFilters()}
          className="mt-2 w-full py-1.5 rounded-lg text-xs font-bold border border-[#DDE3E0]"
        >
          اعمال فیلتر قیمت
        </button>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={query.inStock === "true"}
            onChange={(e) => applyFilters({ inStock: e.target.checked ? "true" : undefined })}
          />
          فقط کالاهای موجود
        </label>
      </div>
    </aside>
  );
}
