// ========================= src/components/Cart/OrderSummary.jsx =========================
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const computeGulfShippingOMR = (country, totalItems) => {
  const n = Math.max(0, Number(totalItems) || 0);

  if (country === 'عُمان' || country === 'عمان') return 2;
  if (country === 'الإمارات') return 4;

  if (country === 'دول الخليج') {
    const base = 5;
    if (n <= 3) return base;

    const extraItems = n - 3;
    const blocks = Math.ceil(extraItems / 3);

    return base + blocks * 4;
  }

  return 2;
};

const OrderSummary = ({ onClose }) => {
  const dispatch = useDispatch();
  const { products = [], totalPrice = 0, country } = useSelector((s) => s.cart);

  const isAED = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAED ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAED ? 9.5 : 1;

  const totalItems = products.reduce(
    (acc, p) => acc + Number(p.quantity || 0),
    0
  );

  const shippingOMR = computeGulfShippingOMR(country, totalItems);

  const grandTotal = (Number(totalPrice) + Number(shippingOMR)) * exchangeRate;

  return (
    <div className="text-sm text-gray-800" dir="rtl">
      {/* المنتجات داخل السلة */}
      {products.length > 0 && (
        <div className="mb-4 space-y-2">
          {products.map((p) => (
            <div
              key={p._id || p.id}
              className="flex items-start justify-between border-b pb-2"
            >
              <div className="pr-1">
                <p className="font-medium text-gray-800">
                  {p.name}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  الحجم: {p.size || p.weight || 'غير محدد'}
                </p>

                <p className="text-xs text-gray-500">
                  الكمية: {p.quantity || 1}
                </p>
              </div>

              <span className="font-medium whitespace-nowrap">
                {(
                  Number(p.price || 0) *
                  Number(p.quantity || 1) *
                  exchangeRate
                ).toFixed(2)}{' '}
                {currency}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* المجاميع */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الإجمالي الفرعي</span>
          <span className="font-medium">
            {(Number(totalPrice) * exchangeRate).toFixed(2)} {currency}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            الشحن {country === 'دول الخليج' ? `(عدد العناصر: ${totalItems})` : ''}
          </span>
          <span className="font-medium">
            {(Number(shippingOMR) * exchangeRate).toFixed(2)} {currency}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="font-bold text-base">المجموع</span>
          <span className="font-extrabold text-base">
            {grandTotal.toFixed(2)} {currency}
          </span>
        </div>
      </div>

      {/* الأزرار */}
      <div className="mt-3 space-y-2">
        <Link to="/checkout" className="block">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-[#d3beaa] text-white py-2.5 text-sm font-medium transition-colors"
          >
            المتابعة للدفع
          </button>
        </Link>

        <button
          onClick={() => dispatch(clearCart())}
          className="w-full rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          مسح السلة
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;