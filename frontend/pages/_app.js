import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <Component {...pageProps} />
      </WishlistProvider>
    </CartProvider>
  );
}
