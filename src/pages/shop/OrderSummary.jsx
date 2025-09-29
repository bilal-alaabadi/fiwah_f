import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const OrderSummary = ({ onClose }) => {
  const dispatch = useDispatch();
  const { products = [], totalPrice = 0, shippingFee = 0, country } = useSelector((s) => s.cart);

  const isAED = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAED ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAED ? 9.5 : 1;

  const baseShippingFee = country === 'دول الخليج' ? 5 : Number(shippingFee || 0);
  const grandTotal = (Number(totalPrice) + Number(baseShippingFee)) * exchangeRate;

  return (
    <div className="text-sm text-gray-800" dir="rtl">
      {/* المجاميع */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الإجمالي الفرعي</span>
          <span className="font-medium">
            {(Number(totalPrice) * exchangeRate).toFixed(2)} {currency}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الشحن</span>
          <span className="font-medium">
            {(Number(baseShippingFee) * exchangeRate).toFixed(2)} {currency}
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
            className="w-full rounded-md bg-[#d3beaa] text-white py-2.5 text-sm font-medium  transition-colors"
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