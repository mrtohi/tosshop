import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import { CategoryIcon, CATS } from "../components/icons";
import { getProducts } from "../lib/api";

export async function getServerSideProps() {
  try {
    const [popular, newest] = await Promise.all([
      getProducts({ sort: "popular", limit: 4 }),
      getProducts({ sort: "newest", limit: 8 }),
    ]);
    return { props: { popular: popular.products, newest: newest.products } };
  } catch (e) {
    return { props: { popular: [], newest: [] } };
  }
}

export default function Home({ popular, newest }) {
  const [cartOpen, setCartOpen] = useState(false);

  const title = "خانه‌کالا | فروشگاه لوازم خانگی با گارانتی اصالت";
  const description = "خرید یخچال، ماشین لباسشویی، جاروبرقی، تلویزیون، مایکروویو و کولر گازی با رده‌بندی انرژی واقعی، تخفیف‌های ویژه و گارانتی اصالت.";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "خانه‌کالا",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.tosshop.ir",
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </Head>

      <Header onCartClick={() => setCartOpen(true)} />

      <section className="max-w-6xl mx-auto px-5 pt-12 pb-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-block text-[11px] font-bold tracking-wide px-3 py-1 rounded-full mb-4 bg-[#DCE6E2] text-primary">
            کم‌مصرف‌ترین‌های بازار، دسته‌بندی‌شده با رده انرژی
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.25] mb-4 text-[#173430]">
            لوازم خانگی که
            <br />
            <span className="text-accent">مصرف برق</span> را هم نشانتان می‌دهد
          </h1>
          <p className="text-[#4A5854] leading-8 mb-6 max-w-md">
            هر محصول با برچسب رده‌بندی انرژی واقعی نمایش داده می‌شود — تا آگاهانه انتخاب کنید.
          </p>
          <Link href="/shop" className="px-6 py-3 rounded-lg font-bold text-white bg-primary inline-block">
            مشاهده فروشگاه
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CATS.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.id}`}
              className="card-lift bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border border-[#DDE3E0]"
            >
              <CategoryIcon category={c.id} className="w-8 h-8 text-primary" />
              <span className="text-xs font-semibold text-center leading-4">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {popular.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold">پرفروش‌ترین‌ها</h2>
            <Link href="/shop?sort=popular" className="text-sm text-primary font-semibold">مشاهده همه ←</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popular.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold">جدیدترین محصولات</h2>
            <Link href="/shop?sort=newest" className="text-sm text-primary font-semibold">مشاهده همه ←</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <footer className="border-t border-[#D7DCD9] mt-10">
        <div className="max-w-6xl mx-auto px-5 py-8 text-sm text-[#4A5854] flex flex-col md:flex-row justify-between gap-4">
          <div>© خانه‌کالا — تمامی لوازم خانگی دارای گارانتی اصالت و خدمات پس از فروش</div>
          <div>پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
