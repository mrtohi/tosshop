import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { CategoryIcon } from "./icons";
import { getProduct, createOrder, requestPayment } from "../lib/api";

const toman = (n) => n.toLocaleString("fa-IR") + " تومان";

export default function CartDrawer({ open, onClose, autoCheckout }) {
  const { cart, addToCart, removeOne } = useCart();
  const [items, setItems] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [step, setStep] = useState("form"); // form | submitting | error
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", city: "", postalCode: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && autoCheckout) { setCheckoutOpen(true); setStep("form"); }
  }, [open, autoCheckout]);

  // واکشی جزئیات محصولات سبد هر بار که سبد یا وضعیت باز بودن تغییر می‌کند
  useEffect(() => {
    if (!open) return;
    const ids = Object.keys(cart);
    Promise.all(ids.map((id) => getProduct(id))).then((results) => {
      setItems(
        results
          .filter(Boolean)
          .map((p) => ({ ...p, qty: cart[p.id] }))
      );
    });
  }, [cart, open]);

  const subtotal = items.reduce((s, i) => s + i.qty * (i.compare_at_price || i.price), 0);
  const discount = items.reduce((s, i) => s + i.qty * ((i.compare_at_price || i.price) - i.price), 0);
  const shipping = subtotal > 0 && subtotal < 2000000 ? 250000 : 0; // ارسال رایگان بالای ۲ میلیون تومان
  const total = subtotal - discount + shipping;

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = "نام و نام خانوادگی را وارد کنید";
    if (!/^09\d{9}$/.test(form.phone)) errs.phone = "شماره موبایل معتبر نیست (مثال: 09121234567)";
    if (!form.address.trim() || form.address.trim().length < 10) errs.address = "آدرس کامل را وارد کنید";
    if (!form.city.trim()) errs.city = "شهر را وارد کنید";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setStep("submitting");
    try {
      const { orderId, orderToken } = await createOrder({
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
        items: items.map((i) => ({ productId: i.id, qty: i.qty })),
      });
      const { paymentUrl } = await requestPayment(orderId, orderToken);
      window.location.href = paymentUrl;
    } catch (err) {
      setStep("error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E4E8E6]">
          <h2 className="font-extrabold text-lg">سبد خرید</h2>
          <button onClick={onClose} className="text-2xl leading-none text-[#7C8B88]">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {items.length === 0 && (
            <div className="text-center text-[#7C8B88] mt-10 text-sm">سبد خرید شما خالی است</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b border-surface pb-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 bg-surface">
                <CategoryIcon category={item.category} className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{item.name}</div>
                <div className="text-xs text-[#7C8B88]">{toman(item.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => removeOne(item.id)} className="w-7 h-7 rounded-full border border-[#DDE3E0] font-bold">−</button>
                <span className="w-5 text-center text-sm font-bold">{item.qty}</span>
                <button onClick={() => addToCart(item.id)} className="w-7 h-7 rounded-full border border-[#DDE3E0] font-bold">+</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-5 border-t border-[#E4E8E6]">
            <div className="text-sm text-[#4A5854] flex flex-col gap-1 mb-3">
              <div className="flex justify-between"><span>جمع جزء</span><span>{toman(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-accent"><span>تخفیف</span><span>−{toman(discount)}</span></div>
              )}
              <div className="flex justify-between">
                <span>هزینهٔ ارسال</span>
                <span>{shipping > 0 ? toman(shipping) : "رایگان"}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold mb-4 pt-2 border-t border-surface">
              <span>مبلغ نهایی</span>
              <span>{toman(total)}</span>
            </div>
            <button
              onClick={() => { setCheckoutOpen(true); setStep("form"); }}
              className="w-full py-3 rounded-lg font-bold text-white bg-primary"
            >
              ادامه فرآیند خرید
            </button>
          </div>
        )}
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCheckoutOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-lg">تکمیل سفارش</h2>
              <button onClick={() => setCheckoutOpen(false)} className="text-2xl leading-none text-[#7C8B88]">×</button>
            </div>

            {step === "error" && (
              <div className="text-sm rounded-lg p-3 mb-4 bg-[#FBE9E7] text-[#C1443C]">
                اتصال به سرور برقرار نشد. لطفاً دوباره تلاش کنید.
              </div>
            )}

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <input
                  placeholder="نام و نام خانوادگی"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm"
                />
                {errors.customerName && <p className="text-xs text-[#C1443C] mt-1">{errors.customerName}</p>}
              </div>
              <div>
                <input
                  placeholder="شماره موبایل (مثال: 09121234567)"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm"
                  dir="ltr"
                />
                {errors.phone && <p className="text-xs text-[#C1443C] mt-1">{errors.phone}</p>}
              </div>
              <div>
                <textarea
                  placeholder="آدرس کامل"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm resize-none"
                />
                {errors.address && <p className="text-xs text-[#C1443C] mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    placeholder="شهر"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm"
                  />
                  {errors.city && <p className="text-xs text-[#C1443C] mt-1">{errors.city}</p>}
                </div>
                <input
                  placeholder="کد پستی (اختیاری)"
                  value={form.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                  className="border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="text-sm text-[#4A5854] flex flex-col gap-1 mb-3">
              <div className="flex justify-between"><span>جمع جزء</span><span>{toman(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-accent"><span>تخفیف</span><span>−{toman(discount)}</span></div>
              )}
              <div className="flex justify-between">
                <span>هزینهٔ ارسال</span>
                <span>{shipping > 0 ? toman(shipping) : "رایگان"}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold mb-4 text-sm pt-2 border-t border-surface">
              <span>مبلغ قابل پرداخت</span>
              <span>{toman(total)}</span>
            </div>

            <button
              onClick={submitOrder}
              disabled={step === "submitting"}
              className="w-full py-3 rounded-lg font-bold text-white disabled:opacity-60 bg-accent"
            >
              {step === "submitting" ? "در حال اتصال به درگاه..." : "پرداخت"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
