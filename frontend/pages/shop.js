import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import Pagination from "../components/Pagination";
import { getProducts, searchProducts } from "../lib/api";

export async function getServerSideProps({ query }) {
  try {
    if (query.q) {
      const products = await searchProducts(query.q);
      return { props: { data: { products, total: products.length, page: 1, totalPages: 1 }, query } };
    }
    const data = await getProducts({
      category: query.category,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: query.inStock,
      sort: query.sort,
      page: query.page || 1,
      limit: 12,
    });
    return { props: { data, query } };
  } catch (e) {
    return { props: { data: { products: [], total: 0, page: 1, totalPages: 1 }, query } };
  }
}

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
];

export default function Shop({ data, query }) {
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  const setSort = (sort) => router.push({ pathname: "/shop", query: { ...query, sort, page: 1 } });

  return (
    <div className="min-h-screen">
      <Head>
        <title>فروشگاه | خانه‌کالا</title>
        <meta name="description" content="خرید انواع لوازم خانگی با گارانتی اصالت — یخچال، ماشین لباسشویی، جاروبرقی و بیشتر." />
      </Head>

      <Header onCartClick={() => setCartOpen(true)} />

      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col lg:flex-row gap-8">
        <FilterSidebar query={query} />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="text-sm text-[#4A5854]">
              {query.q ? `نتایج جست‌وجو برای «${query.q}» — ` : ""}
              {data.total.toLocaleString("fa-IR")} محصول
            </div>
            <div className="flex gap-1 bg-white rounded-full p-1 border border-[#DDE3E0]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    (query.sort || "newest") === opt.value ? "bg-primary text-white" : "text-[#4A5854]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {data.products.length === 0 && (
            <div className="text-center text-[#7C8B88] py-16">محصولی با این مشخصات پیدا نشد</div>
          )}

          <Pagination page={data.page} totalPages={data.totalPages} query={query} />
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
