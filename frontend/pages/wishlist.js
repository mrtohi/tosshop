import { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { getProduct } from "../lib/api";

export default function Wishlist() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (!ids || ids.length === 0) { setProducts([]); return; }
    Promise.all(ids.map((id) => getProduct(id))).then((results) => setProducts(results.filter(Boolean)));
  }, [ids]);

  return (
    <div className="min-h-screen">
      <Head><title>علاقه‌مندی‌های من | خانه‌کالا</title></Head>
      <Header onCartClick={() => setCartOpen(true)} />
      <div className="max-w-6xl mx-auto px-5 py-8">
        <h1 className="text-xl font-extrabold mb-6">علاقه‌مندی‌های من</h1>
        {products.length === 0 ? (
          <div className="text-[#7C8B88] text-sm">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
