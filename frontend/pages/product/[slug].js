import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import CartDrawer from "../../components/CartDrawer";
import EnergyBadge from "../../components/EnergyBadge";
import Stars from "../../components/Stars";
import Reviews from "../../components/Reviews";
import ProductCard from "../../components/ProductCard";
import { CategoryIcon, CATS } from "../../components/icons";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProduct, getRelatedProducts, API_BASE } from "../../lib/api";
import { productUrl, extractProductId } from "../../lib/slug";

const toman = (n) => n.toLocaleString("fa-IR") + " تومان";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tosshop.ir";

export async function getServerSideProps({ params }) {
  const id = extractProductId(params.slug);
  const product = await getProduct(id);
  if (!product) return { notFound: true };
  const related = await getRelatedProducts(id);
  return { props: { product, related } };
}

export default function ProductPage({ product, related }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [buyNow, setBuyNow] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { toggle, isWished } = useWishlist();
  const wished = isWished(product.id);

  const images = product.images?.length ? product.images : (product.image_url ? [product.image_url] : []);
  const imgSrc = (url) => (url.startsWith("http") ? url : `${API_BASE}${url}`);
  const categoryLabel = CATS.find((c) => c.id === product.category)?.label || product.category;

  const title = `${product.name} | خانه‌کالا`;
  const description = product.description
    ? product.description.slice(0, 155)
    : `${product.brand} - ${product.name} با رده انرژی ${product.energy_class} - قیمت ${toman(product.price)}`;
  const canonicalUrl = `${SITE_URL}${productUrl(product)}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || description,
    sku: product.sku || undefined,
    brand: { "@type": "Brand", name: product.brand },
    category: categoryLabel,
    image: images.map(imgSrc),
    ...(product.rating_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating_avg,
        reviewCount: product.rating_count,
      },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price * 10,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه‌کالا", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: categoryLabel, item: `${SITE_URL}/shop?category=${product.category}` },
      { "@type": "ListItem", position: 3, name: product.name, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        {images[0] && <meta property="og:image" content={imgSrc(images[0])} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {images[0] && <meta name="twitter:image" content={imgSrc(images[0])} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </Head>

      <Header onCartClick={() => setCartOpen(true)} />

      <div className="max-w-4xl mx-auto px-5 pt-4 text-xs text-[#7C8B88] flex gap-1.5">
        <Link href="/">خانه‌کالا</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`}>{categoryLabel}</Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </div>

      <main className="max-w-4xl mx-auto px-5 py-6 grid md:grid-cols-2 gap-10">
        <div>
          <div className="w-full aspect-square rounded-2xl flex items-center justify-center bg-white border border-[#DDE3E0] overflow-hidden mb-3">
            {images.length > 0 ? (
              <img src={imgSrc(images[activeImage])} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <CategoryIcon category={product.category} className="w-28 h-28 text-primary" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImage ? "border-primary" : "border-[#DDE3E0]"}`}
                >
                  <img src={imgSrc(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-[#7C8B88] font-semibold mb-1">{product.brand}</div>
              <h1 className="text-2xl font-extrabold mb-2">{product.name}</h1>
            </div>
            <button
              onClick={() => toggle(product.id)}
              className="w-10 h-10 shrink-0 rounded-full border border-[#DDE3E0] flex items-center justify-center"
            >
              <span style={{ color: wished ? "#B8703F" : "#B9C2BF" }}>{wished ? "♥" : "♡"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Stars rating={product.rating_avg} count={product.rating_count} size="lg" />
            {product.sku && <span className="text-xs text-[#7C8B88]">کد کالا: {product.sku}</span>}
          </div>

          <EnergyBadge rating={product.energy_class} size="lg" />

          <div className="my-5">
            {product.discount_percent > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-[#9AA6A2] line-through">{toman(product.compare_at_price)}</span>
                <span className="text-xs font-extrabold text-white px-2 py-0.5 rounded bg-accent">
                  {product.discount_percent.toLocaleString("fa-IR")}٪ تخفیف
                </span>
              </div>
            )}
            <span className="text-3xl font-extrabold text-ink">{toman(product.price)}</span>
          </div>

          <div className="text-sm text-[#4A5854] mb-4">
            {product.stock > 0 ? `موجود در انبار (${product.stock.toLocaleString("fa-IR")} عدد)` : "ناموجود"}
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold">تعداد:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full border border-[#DDE3E0] font-bold"
                >−</button>
                <span className="w-6 text-center font-bold">{qty.toLocaleString("fa-IR")}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-full border border-[#DDE3E0] font-bold"
                >+</button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => addToCart(product.id, qty)}
              disabled={product.stock <= 0}
              className="flex-1 py-3.5 rounded-lg font-bold text-white bg-accent disabled:opacity-50"
            >
              افزودن به سبد خرید
            </button>
            <button
              onClick={() => { addToCart(product.id, qty); setBuyNow(true); setCartOpen(true); }}
              disabled={product.stock <= 0}
              className="flex-1 py-3.5 rounded-lg font-bold text-primary border-2 border-primary disabled:opacity-50"
            >
              خرید فوری
            </button>
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="font-bold text-sm mb-2">توضیحات محصول</h2>
              <p className="text-sm text-[#4A5854] leading-7">{product.description}</p>
            </div>
          )}

          {product.specs?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-sm mb-2">مشخصات فنی</h2>
              <table className="w-full text-sm border border-[#DDE3E0] rounded-lg overflow-hidden">
                <tbody>
                  {product.specs.map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-surface"}>
                      <td className="p-2.5 text-[#7C8B88] w-1/3">{key}</td>
                      <td className="p-2.5 font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Reviews productId={product.id} />

      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-5 pb-16">
          <h2 className="font-extrabold text-lg mb-4">محصولات مشابه</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <CartDrawer open={cartOpen} onClose={() => { setCartOpen(false); setBuyNow(false); }} autoCheckout={buyNow} />
    </div>
  );
}
