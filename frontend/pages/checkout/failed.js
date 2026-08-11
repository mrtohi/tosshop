import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";

export default function CheckoutFailed() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>پرداخت ناموفق | خانه‌کالا</title>
      </Head>
      <Header onCartClick={() => {}} />
      <main className="max-w-xl mx-auto px-5 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FBE9E7] text-[#C1443C] flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold">
          ×
        </div>
        <h1 className="text-2xl font-extrabold mb-3">پرداخت انجام نشد</h1>
        <p className="text-[#4A5854] mb-6">مبلغی از حساب شما کسر نشده است. می‌توانید دوباره تلاش کنید.</p>
        <Link href="/" className="inline-block px-6 py-3 rounded-lg font-bold text-white bg-primary">
          بازگشت به فروشگاه
        </Link>
      </main>
    </div>
  );
}
