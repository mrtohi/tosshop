import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("khanekala-wishlist");
      if (saved) setIds(JSON.parse(saved));
    } catch (e) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("khanekala-wishlist", JSON.stringify(ids));
  }, [ids, hydrated]);

  const toggle = (id) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const isWished = (id) => ids.includes(id);

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWished }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
