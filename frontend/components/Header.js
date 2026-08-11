import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { CATS } from "./icons";
import { searchProducts } from "../lib/api";
import { productUrl } from "../lib/slug";

export default function Header({ onCartClick }) {
  const { cartCount } = useCart();
  const router = useRouter();
  const [q, setQ] = useState(router.query.q || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const submitSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  // پیشنهاد جست‌وجو با تأخیر کوتاه (debounce) هنگام تایپ — از ارسال درخواست به‌ازای هر حرف جلوگیری می‌کند
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      searchProducts(q).then((results) => setSuggestions(results.slice(0, 5)));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [q]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[#EEF1EFcc] border-b border-[#D7DCD9]">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold bg-primary">
            خ
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-lg leading-none">خانه‌کالا</div>
            <div className="text-[11px] text-[#7C8B88] leading-none mt-1">لوازم خانگی اصل، با گارانتی</div>
          </div>
        </Link>

        <form onSubmit={submitSearch} className="flex-1 max-w-md relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="جست‌وجوی محصول، برند یا دسته..."
            className="w-full border border-[#DDE3E0] rounded-full px-4 py-2 text-sm bg-white"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-xl border border-[#DDE3E0] shadow-lg overflow-hidden z-40">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  href={productUrl(p)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-surface border-b border-surface last:border-0"
                >
                  <span className="font-semibold truncate">{p.name}</span>
                  <span className="text-[#7C8B88] text-xs shrink-0 mr-2">{p.brand}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

        <Link href="/wishlist" className="hidden sm:block text-lg shrink-0" aria-label="علاقه‌مندی‌ها">♡</Link>

        <button
          onClick={onCartClick}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-white bg-accent shrink-0"
        >
          سبد خرید
          {cartCount > 0 && (
            <span className="bg-white text-accent rounded-full w-5 h-5 text-[11px] font-extrabold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
      <div className="hidden md:flex max-w-6xl mx-auto px-5 pb-2.5 gap-4 overflow-x-auto">
        {CATS.map((c) => (
          <Link key={c.id} href={`/shop?category=${c.id}`} className="text-xs text-[#4A5854] font-semibold shrink-0 hover:text-primary">
            {c.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
