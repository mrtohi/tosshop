import Link from "next/link";
import EnergyBadge from "./EnergyBadge";
import Stars from "./Stars";
import { CategoryIcon } from "./icons";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { API_BASE } from "../lib/api";
import { productUrl } from "../lib/slug";

const toman = (n) => n.toLocaleString("fa-IR") + " تومان";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, isWished } = useWishlist();
  const wished = isWished(product.id);
  const image = product.images?.[0] || product.image_url;
  const outOfStock = product.stock <= 0;

  return (
    <div className="card-lift relative bg-white rounded-2xl p-4 border border-[#DDE3E0] flex flex-col">
      {/* بج‌ها */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-1">
        {product.discount_percent > 0 && (
          <span className="text-[11px] font-extrabold text-white px-2 py-1 rounded-lg bg-accent">
            {product.discount_percent.toLocaleString("fa-IR")}٪ تخفیف
          </span>
        )}
        {outOfStock && (
          <span className="text-[11px] font-bold text-white px-2 py-1 rounded-lg bg-[#7C8B88]">
            ناموجود
          </span>
        )}
      </div>

      <button
        onClick={() => toggle(product.id)}
        aria-label="افزودن به علاقه‌مندی‌ها"
        className="absolute top-6 left-6 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center border border-[#DDE3E0]"
      >
        <span style={{ color: wished ? "#B8703F" : "#B9C2BF" }}>{wished ? "♥" : "♡"}</span>
      </button>

      <Link href={productUrl(product)}>
        <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-4 bg-surface overflow-hidden">
          {image ? (
            <img
              src={image.startsWith("http") ? image : `${API_BASE}${image}`}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <CategoryIcon category={product.category} className="w-14 h-14 text-primary" />
          )}
        </div>
        <div className="text-[11px] text-[#7C8B88] font-semibold mb-1">{product.brand}</div>
        <h3 className="font-bold text-sm leading-6 mb-2 min-h-[3rem]">{product.name}</h3>
      </Link>

      <div className="flex items-center justify-between mb-2">
        <EnergyBadge rating={product.energy_class} />
        <Stars rating={product.rating_avg || 0} count={product.rating_count || 0} />
      </div>

      <div className="mt-1 mb-3">
        {product.discount_percent > 0 && (
          <div className="text-xs text-[#9AA6A2] line-through">{toman(product.compare_at_price)}</div>
        )}
        <span className="font-extrabold text-ink text-lg">{toman(product.price)}</span>
      </div>

      <button
        onClick={() => addToCart(product.id)}
        disabled={outOfStock}
        className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {outOfStock ? "ناموجود" : "افزودن به سبد خرید"}
      </button>
    </div>
  );
}
