// ========================= src/components/Checkout/Checkout.jsx =========================
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getBaseUrl } from "../../utils/baseURL";
import { setCountry } from "../../redux/features/cart/cartSlice";
import Thw from "../../assets/images__4_-removebg-preview.png";

const Checkout = () => {
  const dispatch = useDispatch();

  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wilayat, setWilayat] = useState("");
  const [description, setDescription] = useState("");
  const [payDeposit, setPayDeposit] = useState(false);
  const [gulfCountry, setGulfCountry] = useState("");

  const { products, totalPrice, country, giftCard } = useSelector((state) => state.cart);

  const currency = country === "دول الخليج" ? "د.إ" : "ر.ع.";
  const exchangeRate = country === "دول الخليج" ? 9.5 : 1;

  const mustPickGulf = country === "دول الخليج";
  const isRegionReady = !mustPickGulf || !!gulfCountry;

  const totalItems = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.quantity || 0), 0),
    [products]
  );

  const shippingOMR = useMemo(() => {
    if (country === "دول الخليج") {
      const base = gulfCountry === "الإمارات" ? 4 : 5;
      const n = Math.max(0, totalItems);

      if (n <= 3) return base;

      const extra = n - 3;
      const blocks = Math.ceil(extra / 3);

      return base + blocks * 4;
    }

    return 2;
  }, [country, gulfCountry, totalItems]);

  const shippingFee = shippingOMR * exchangeRate;

  const hasTailoredAbaya = useMemo(() => {
    const tailoredCategories = new Set(["تفصيل العبايات", "تفصيل عباية", "عباية", "عبايات"]);

    return products.some((p) => {
      const cat = (p.category || "").trim();
      const isAbayaCategory = tailoredCategories.has(cat);
      const hasMeasures = p.measurements && Object.keys(p.measurements).length > 0;

      return isAbayaCategory && hasMeasures;
    });
  }, [products]);

  useEffect(() => {
    if (products.length === 0) {
      setError("لا توجد منتجات في السلة. الرجاء إضافة منتجات قبل المتابعة إلى الدفع.");
    } else {
      setError("");
    }
  }, [products]);

  useEffect(() => {
    if (country === "دول الخليج" && payDeposit) {
      setPayDeposit(false);
    }
  }, [country, payDeposit]);

  const payDepositEffective = country === "دول الخليج" ? false : payDeposit;

  const makePayment = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    if (products.length === 0) {
      setError("لا توجد منتجات في السلة. الرجاء إضافة منتجات قبل المتابعة إلى الدفع.");
      return;
    }

    if (mustPickGulf && !gulfCountry) {
      setError("الرجاء اختيار دولة من دول الخليج لإتمام الطلب.");
      return;
    }

    if (!customerName || !customerPhone || !country || !wilayat || !email) {
      setError("الرجاء إدخال جميع المعلومات المطلوبة (الاسم، رقم الهاتف، البريد الإلكتروني، البلد، العنوان)");
      return;
    }

    const body = {
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        measurements: product.measurements || {},
        category: product.category || "",
        size: product.size || product.weight || "",
        giftCard:
          product.giftCard &&
          (String(product.giftCard.from || "").trim() ||
            String(product.giftCard.to || "").trim() ||
            String(product.giftCard.phone || "").trim() ||
            String(product.giftCard.note || "").trim())
            ? {
                from: product.giftCard.from || "",
                to: product.giftCard.to || "",
                phone: product.giftCard.phone || "",
                note: product.giftCard.note || "",
              }
            : undefined,
      })),
      customerName,
      customerPhone,
      country,
      gulfCountry,
      wilayat,
      description,
      email,
      depositMode: !!payDepositEffective,
      giftCard:
        giftCard &&
        (giftCard.from || giftCard.to || giftCard.phone || giftCard.note)
          ? giftCard
          : null,
    };

    try {
      const response = await fetch(`${getBaseUrl()}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData?.details?.description ||
            errorData.error ||
            "Failed to create checkout session"
        );
      }

      const session = await response.json();

      if (session.paymentLink) {
        window.location.href = session.paymentLink;
      } else {
        setError("حدث خطأ أثناء إنشاء رابط الدفع. الرجاء المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setError(error.message || "حدث خطأ أثناء عملية الدفع. الرجاء المحاولة مرة أخرى.");
    }
  };

  const displayTotal = useMemo(() => {
    if (payDepositEffective) return (10 * exchangeRate).toFixed(2);

    return ((totalPrice + shippingOMR) * exchangeRate).toFixed(2);
  }, [payDepositEffective, exchangeRate, totalPrice, shippingOMR]);

  const renderMeasurementsDetails = (m) => {
    if (!m) return null;

    return (
      <div className="text-xs text-gray-600 mt-1 space-y-0.5">
        {m.length && <p>الطول: {m.length}</p>}
        {m.sleeveLength && <p>طول الكم: {m.sleeveLength}</p>}
        {m.width && <p>العرض: {m.width}</p>}
        {m.color && <p>اللون: {m.color}</p>}
        {m.design && <p>القصة: {m.design}</p>}
        {m.buttons && <p>الأزرار: {m.buttons}</p>}
        {m.quantity && <p>كمية الشيلات (اختيار): {m.quantity}</p>}
        {m.colorOption && <p>خيار اللون: {m.colorOption}</p>}
        {m.notes && <p>ملاحظات: {m.notes}</p>}
      </div>
    );
  };

  return (
    <div className="pt-20 p-4 md:pt-24 md:p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="order-1 md:order-1 md:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
              تفاصيل الفاتورة
            </h1>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form className="space-y-4 md:space-y-6" dir="rtl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">البلد</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={country}
                    onChange={(e) => {
                      const val = e.target.value;
                      dispatch(setCountry(val));

                      if (val !== "دول الخليج") {
                        setGulfCountry("");
                      }
                    }}
                  >
                    <option value="عُمان">عُمان</option>
                    <option value="دول الخليج">دول الخليج</option>
                  </select>
                </div>
              </div>

              {country === "دول الخليج" && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    اختر الدولة (دول الخليج)
                  </label>

                  <select
                    className={`w-full p-2 border rounded-md ${
                      !gulfCountry ? "border-red-300" : ""
                    }`}
                    value={gulfCountry}
                    onChange={(e) => setGulfCountry(e.target.value)}
                  >
                    <option value="">اختر الدولة</option>
                    <option value="الإمارات">الإمارات</option>
                    <option value="السعودية">السعودية</option>
                    <option value="الكويت">الكويت</option>
                    <option value="قطر">قطر</option>
                    <option value="البحرين">البحرين</option>
                    <option value="أخرى">أخرى</option>
                  </select>

                  {!gulfCountry && (
                    <p className="text-xs text-red-600 mt-2">
                      يجب اختيار الدولة لإكمال الطلب عند اختيار "دول الخليج".
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2">العنوان</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={wilayat}
                  onChange={(e) => setWilayat(e.target.value)}
                  required
                  placeholder="الرجاء إدخال العنوان كاملاً"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  وصف إضافي (اختياري)
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أي ملاحظات أو تفاصيل إضافية عن الطلب"
                  rows="3"
                />
              </div>

              {hasTailoredAbaya && country !== "دول الخليج" && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setPayDeposit((v) => !v)}
                    className={`px-3 py-1 text-sm rounded-md border transition ${
                      payDeposit
                        ? "bg-[#799b52] text-white border-[#799b52]"
                        : "bg-white text-[#799b52] border-[#799b52]"
                    }`}
                  >
                    {payDeposit ? "إلغاء دفع المقدم" : "دفع مقدم 10 ر.ع"}
                  </button>

                  <p className="text-xs text-gray-600 mt-2">
                    عند تفعيل "دفع مقدم"، سيتم دفع 10 ر.ع الآن فقط، ويتم احتساب المبلغ المتبقي لاحقاً.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="order-2 md:order-2 md:col-span-1">
          <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-lg border border-gray-200 md:sticky md:top-4">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">
              طلبك
            </h2>

            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={`${product._id}-${JSON.stringify(product.measurements || {})}`}
                  className="py-2 border-b border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-gray-700">
                        {product.name} × {product.quantity}
                      </span>

                      <p className="text-xs text-gray-500 mt-1">
                        الحجم: {product.size || product.weight || "غير محدد"}
                      </p>
                    </div>

                    <span className="text-gray-900 font-medium whitespace-nowrap">
                      {Math.max(
                        0,
                        (product.price || 0) * exchangeRate * product.quantity -
                          (["الشيلات فرنسية", "الشيلات سادة"].includes(product.category)
                            ? Math.floor(product.quantity / 2) * (1 * exchangeRate)
                            : 0)
                      ).toFixed(2)}{" "}
                      {currency}
                    </span>
                  </div>

                  {renderMeasurementsDetails(product.measurements)}

                  {product.giftCard &&
                    ((product.giftCard.from && String(product.giftCard.from).trim()) ||
                      (product.giftCard.to && String(product.giftCard.to).trim()) ||
                      (product.giftCard.phone && String(product.giftCard.phone).trim()) ||
                      (product.giftCard.note && String(product.giftCard.note).trim())) && (
                      <div className="mt-2 p-2 rounded-md bg-pink-50/60 border border-pink-200 text-[12px] text-pink-900 space-y-0.5">
                        <div className="font-semibold text-pink-700">
                          بطاقة هدية
                        </div>

                        {product.giftCard.from && String(product.giftCard.from).trim() && (
                          <div>من: {product.giftCard.from}</div>
                        )}

                        {product.giftCard.to && String(product.giftCard.to).trim() && (
                          <div>إلى: {product.giftCard.to}</div>
                        )}

                        {product.giftCard.phone && String(product.giftCard.phone).trim() && (
                          <div>رقم المستلم: {product.giftCard.phone}</div>
                        )}

                        {product.giftCard.note && String(product.giftCard.note).trim() && (
                          <div>ملاحظات: {product.giftCard.note}</div>
                        )}
                      </div>
                    )}
                </div>
              ))}

              {!payDepositEffective && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-800">رسوم الشحن</span>
                  <p className="text-gray-900">
                    {currency}
                    {shippingFee.toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-gray-800 font-semibold">
                  {payDepositEffective ? "الإجمالي (دفعة مقدم)" : "الإجمالي"}
                </span>

                <p className="text-gray-900 font-bold">
                  {currency}
                  {displayTotal}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                بوابة ثواني للدفع الإلكتروني
              </h3>

              <div
                onClick={(e) => {
                  if (products.length === 0 || !isRegionReady) return;
                  makePayment(e);
                }}
                onKeyDown={(e) => {
                  if (products.length === 0 || !isRegionReady) return;

                  if (e.key === "Enter" || e.key === " ") {
                    makePayment(e);
                  }
                }}
                role="button"
                aria-disabled={products.length === 0 || !isRegionReady}
                tabIndex={products.length === 0 || !isRegionReady ? -1 : 0}
                className={[
                  "w-full rounded-xl border border-gray-200 bg-white",
                  "px-4 py-3 shadow-sm flex items-center justify-center gap-3",
                  "transition",
                  products.length === 0 || !isRegionReady
                    ? "opacity-50 pointer-events-none select-none"
                    : "hover:shadow-md hover:border-[#799b52] cursor-pointer",
                ].join(" ")}
              >
                <img
                  src={Thw}
                  alt="ثواني"
                  className="h-10 w-10"
                  loading="lazy"
                  decoding="async"
                />

                <span className="text-gray-900 font-medium">
                  {payDepositEffective ? "دفع الدفعة (10 ر.ع)" : "الدفع باستخدام ثواني"}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                سيتم استخدام بياناتك الشخصية لمعالجة طلبك، ودعم تجربتك عبر هذا
                الموقع، ولأغراض أخرى موضحة في{" "}
                <a className="text-blue-600 hover:underline">سياسة الخصوصية</a>.
              </p>

              <button
                onClick={makePayment}
                className="mt-4 w-full bg-[#d3beaa] text-white px-6 py-3 rounded-md transition-colors"
                disabled={products.length === 0 || !isRegionReady}
                title={!isRegionReady ? "الرجاء اختيار دولة من دول الخليج" : undefined}
              >
                إتمام الطلب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;