import Head from "next/head";
import Header from "../../components/Header";
import { getOrder } from "../../lib/api";

export async function getServerSideProps({ query }) {
  const order = query.orderId && query.orderToken
    ? await getOrder(query.orderId, query.orderToken)
    : null;
  return { props: { order } };
}

export default function CheckoutSuccess({ order }) {
  return (
    <div className="min-h-screen">
      <Head>
        <title>پرداخت موفق | خانه‌کالا</title>
      </Head>
      <Header onCartClick={() => {}} />
      <main className="max-w-xl mx-auto px-5 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#DCE6E2] text-primary flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold mb-3">پرداخت با موفقیت انجام شد</h1>
        {order ? (
          <p className="text-[#4A5854]">
            شمارهٔ سفارش شما: <span className="font-bold">{order.id}</span> — کد رهگیری: {order.ref_id}
          </p>
        ) : (
          <p className="text-[#4A5854]">سفارش شما ثبت شد.</p>
        )}
      </main>
    </div>
  );
}
