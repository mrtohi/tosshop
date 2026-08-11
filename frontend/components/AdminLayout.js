import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getToken, clearToken } from "../lib/adminApi";

const NAV = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/orders", label: "سفارش‌ها" },
  { href: "/admin/reviews", label: "نظرات" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen flex" dir="rtl">
      <aside className="w-56 shrink-0 bg-primary text-white p-5 flex flex-col">
        <div className="font-extrabold text-lg mb-8">پنل مدیریت خانه‌کالا</div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                router.pathname === item.href ? "bg-white/15" : "hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => { clearToken(); router.push("/admin/login"); }}
          className="mt-auto text-sm text-white/70 hover:text-white text-right"
        >
          خروج از حساب
        </button>
      </aside>
      <main className="flex-1 bg-surface p-8">{children}</main>
    </div>
  );
}
