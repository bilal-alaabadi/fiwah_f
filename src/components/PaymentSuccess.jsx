// ========================= PaymentSuccess.jsx (نهائي) =========================
import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/baseURL';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../redux/features/cart/cartSlice';

const PaymentSuccess = () => {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const { selectedItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const client_reference_id = query.get('client_reference_id');

    if (client_reference_id) {
      fetch(`${getBaseUrl()}/api/orders/confirm-payment`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_reference_id })
      })
        .then((res) =>
          res.ok ? res.json() : Promise.reject(new Error(`HTTP error! status: ${res.status}`))
        )
        .then(async (data) => {
          if (data.error) throw new Error(data.error);
          if (!data.order) throw new Error("No order data received.");

          if (data.order.status === 'completed' && selectedItems > 0) {
            dispatch(clearCart());
          }

          setOrder(data.order);

          const productsDetails = await Promise.all(
            (data.order.products || []).map(async (item) => {
              let fetched = {};

              try {
                const response = await fetch(`${getBaseUrl()}/api/products/${item.productId}`);
                if (response.ok) {
                  const productData = await response.json();
                  fetched = productData?.product || {};
                }
              } catch {}

              // ✅ بطاقة هدية لكل منتج: نأخذ من العنصر نفسه، وإن لم توجد نستخدم بطاقة الطلب العامة
              const gc = item.giftCard && (item.giftCard.from || item.giftCard.to || item.giftCard.phone || item.giftCard.note)
                ? item.giftCard
                : (data.order.giftCard && (data.order.giftCard.from || data.order.giftCard.to || data.order.giftCard.phone || data.order.giftCard.note)
                    ? data.order.giftCard
                    : null);

              return {
                productId: item.productId,
                name: item.name || fetched.name || 'منتج',
                quantity: item.quantity,
                measurements: item.measurements || {},

                // ✅ حفظ وإظهار الحجم القادم من الطلب
                size: item.size || item.selectedSize || fetched.size || '',
                selectedSize: item.size || item.selectedSize || fetched.size || '',

                category: item.category || fetched.category || '',
                image: item.image || fetched.image || '',
                description: fetched.description || '',
                price: item.price ?? fetched.regularPrice ?? fetched.price ?? 0,
                giftCard: gc, // <-- نرفقها مع كل عنصر
              };
            })
          );

          setProducts(productsDetails);
        })
        .catch((err) => {
          console.error("Error confirming payment", err);
          setError(err.message || String(err));
        });
    } else {
      setError("No session ID found in the URL");
    }
  }, [dispatch, selectedItems]);

  const currency = order?.country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = order?.country === 'الإمارات' ? 9.5 : 1;

  const formatPrice = (price) => (Number(price || 0) * exchangeRate).toFixed(2);

  const renderMeasurements = (m) => {
    if (!m || typeof m !== 'object') return null;

    const entries = Object.entries(m).filter(
      ([_, v]) => v !== '' && v !== null && v !== undefined
    );

    if (entries.length === 0) return null;

    return (
      <div className="mt-3 text-sm rounded p-3">
        <h5 className="font-semibold mb-2">القياسات / الخيارات:</h5>
        <ul className="list-disc pr-5 space-y-1">
          {entries.map(([key, val]) => (
            <li key={key}>
              <span className="font-medium">{key}:</span> <span>{String(val)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (error) return <div className="text-red-500">خطأ: {error}</div>;
  if (!order) return <div>جارِ التحميل...</div>;

  const isDeposit = !!order.depositMode;
  const remaining = Number(order.remainingAmount || 0);

  const hasGift = Boolean(
    order?.giftCard &&
    (order.giftCard.from || order.giftCard.to || order.giftCard.phone || order.giftCard.note)
  );

  return (
    <section className='section__container rounded p-6' dir="rtl">
      <h2 className="text-2xl font-bold mb-2">
        تم الدفع بنجاح
        {hasGift && (
          <span className="ml-2 inline-block text-sm font-semibold px-2 py-0.5 rounded bg-pink-100 text-pink-800 align-middle">
            هدية 🎁
          </span>
        )}
      </h2>

      <p className="text-gray-600">رقم الطلب: {order.orderId}</p>

      {order.paymentSessionId && (
        <p className="text-gray-600">معرّف جلسة الدفع: {order.paymentSessionId}</p>
      )}

      {/* عرض بطاقة الهدية إن وُجدت (على مستوى الطلب) */}
      {hasGift && (
        <div className="mt-4 p-3 rounded-md bg-pink-50 border border-pink-200 text-pink-900 text-sm">
          <h4 className="font-semibold mb-2">بيانات بطاقة الهدية</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {order.giftCard.from && (
              <div>
                <span className="font-medium">من: </span>
                {order.giftCard.from}
              </div>
            )}

            {order.giftCard.to && (
              <div>
                <span className="font-medium">إلى: </span>
                {order.giftCard.to}
              </div>
            )}

            {order.giftCard.phone && (
              <div>
                <span className="font-medium">رقم المستلم: </span>
                {order.giftCard.phone}
              </div>
            )}

            {order.giftCard.note && (
              <div className="md:col-span-2">
                <span className="font-medium">ملاحظات الهدية: </span>
                {order.giftCard.note}
              </div>
            )}
          </div>
        </div>
      )}

      {isDeposit && (
        <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          تمت عملية <span className="font-semibold">دفع مقدم</span> بقيمة {formatPrice(order.amount)} {currency}.
          المبلغ المتبقي لإكمال الطلب هو <span className="font-semibold">{formatPrice(remaining)} {currency}</span>.
        </div>
      )}

      {/* تفاصيل المنتجات */}
      <div className="mt-8 pt-6">
        <h3 className="text-xl font-bold mb-4">تفاصيل المنتجات</h3>

        <div className="space-y-6">
          {products.map((product, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
              <div className="md:w-1/4">
                <img
                  src={Array.isArray(product.image) ? product.image[0] : product.image}
                  alt={product.name}
                  className="w-full h-auto rounded-md"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                    e.target.alt = "صورة غير متوفرة";
                  }}
                />
              </div>

              <div className="md:w-3/4">
                <h4 className="text-lg font-semibold">{product.name}</h4>

                {product.description && (
                  <p className="text-gray-600 mt-2">{product.description}</p>
                )}

                <div className="mt-2">
                  <span className="font-medium">الفئة: </span>
                  <span>{product.category || '—'}</span>
                </div>

                <div className="mt-2">
                  <span className="font-medium">الكمية: </span>
                  <span>{product.quantity}</span>
                </div>

                {/* ✅ هنا يظهر الحجم مثل 100 مل أو 250 جرام */}
                {(product.size || product.selectedSize) && (
                  <div className="mt-2">
                    <span className="font-medium"> جرام / مل:</span>
                    <span>{product.size || product.selectedSize}</span>
                  </div>
                )}

                {renderMeasurements(product.measurements)}

                {/* ✅ بطاقة الهدية الخاصة بهذا المنتج (إن وُجدت أو سقطت من الطلب العام) */}
                {product.giftCard &&
                  ((product.giftCard.from && String(product.giftCard.from).trim()) ||
                    (product.giftCard.to && String(product.giftCard.to).trim()) ||
                    (product.giftCard.phone && String(product.giftCard.phone).trim()) ||
                    (product.giftCard.note && String(product.giftCard.note).trim())) && (
                    <div className="mt-3 p-3 rounded-md bg-pink-50 border border-pink-200 text-pink-900 text-sm">
                      <div className="font-semibold mb-1">بطاقة هدية</div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        {product.giftCard.from && String(product.giftCard.from).trim() && (
                          <div>
                            <span className="font-medium">من: </span>
                            {product.giftCard.from}
                          </div>
                        )}

                        {product.giftCard.to && String(product.giftCard.to).trim() && (
                          <div>
                            <span className="font-medium">إلى: </span>
                            {product.giftCard.to}
                          </div>
                        )}

                        {product.giftCard.phone && String(product.giftCard.phone).trim() && (
                          <div>
                            <span className="font-medium">رقم المستلم: </span>
                            {product.giftCard.phone}
                          </div>
                        )}

                        {product.giftCard.note && String(product.giftCard.note).trim() && (
                          <div className="md:col-span-2">
                            <span className="font-medium">ملاحظات الهدية: </span>
                            {product.giftCard.note}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ملخص الطلب */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">ملخص الطلب</h3>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          {!isDeposit ? (
            <>
              <div className="flex justify-between py-2">
                <span>السعر:</span>
                <span className="font-semibold">
                  {formatPrice(Number(order.amount) - Number(order.shippingFee))} {currency}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span>رسوم الشحن:</span>
                <span className="font-semibold">
                  {formatPrice(order.shippingFee)} {currency}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t pt-3">
                <span className="font-medium">الإجمالي النهائي:</span>
                <span className="font-bold text-lg">
                  {formatPrice(order.amount)} {currency}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2">
                <span>تم دفع مقدم:</span>
                <span className="font-semibold">
                  {formatPrice(order.amount)} {currency}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span>المبلغ المتبقي:</span>
                <span className="font-semibold">
                  {formatPrice(remaining)} {currency}
                </span>
              </div>

              <div className="text-xs text-gray-600">
                يشمل المبلغ المتبقي قيمة المنتجات بعد الخصومات ورسوم الشحن (إن وُجدت).
              </div>
            </>
          )}

          {/* إظهار بيانات الهدية داخل الملخص أيضًا */}
          {hasGift && (
            <div className="rounded-md border bg-pink-50 p-3 space-y-2">
              <div className="flex justify-between">
                <span>نوع الطلب:</span>
                <span className="font-semibold text-pink-700">هدية 🎁</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {order.giftCard.from && (
                  <div>
                    <span className="font-medium">من: </span>
                    {order.giftCard.from}
                  </div>
                )}

                {order.giftCard.to && (
                  <div>
                    <span className="font-medium">إلى: </span>
                    {order.giftCard.to}
                  </div>
                )}

                {order.giftCard.phone && (
                  <div>
                    <span className="font-medium">رقم المستلم: </span>
                    {order.giftCard.phone}
                  </div>
                )}

                {order.giftCard.note && (
                  <div className="md:col-span-2">
                    <span className="font-medium">ملاحظات الهدية: </span>
                    {order.giftCard.note}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between py-2 border-t pt-3">
            <span>حالة الطلب:</span>
            <span className="font-semibold">{order.status}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>اسم العميل:</span>
            <span className="font-semibold">{order.customerName}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>البريد الإلكتروني:</span>
            <span className="font-semibold">{order.email}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>رقم الهاتف:</span>
            <span className="font-semibold">{order.customerPhone}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>البلد:</span>
            <span className="font-semibold">{order.country}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>الولاية:</span>
            <span className="font-semibold">{order.wilayat}</span>
          </div>

          <div className="flex justify-between py-2 border-t pt-3">
            <span>تاريخ الطلب:</span>
            <span className="font-semibold">
              {new Date(order.createdAt).toLocaleDateString('ar-OM')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;