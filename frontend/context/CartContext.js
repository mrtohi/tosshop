import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}); // { [productId]: qty }
  const [hydrated, setHydrated] = useState(false);

  // بارگذاری سبد ذخیره‌شده از localStorage بعد از mount شدن (فقط سمت مرورگر)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("khanekala-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("khanekala-cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (id, qty = 1) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + qty }));
  const removeOne = (id) =>
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeOne, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
