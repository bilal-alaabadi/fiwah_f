import React from 'react';
import { RiCloseLine } from "react-icons/ri";
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/features/cart/cartSlice';
import OrderSummary from './OrderSummary';

const CartModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { country, products: cartProducts = [] } = useSelector((state) => state.cart);

  const isAEDCountry = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAEDCountry ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAEDCountry ? 9.5 : 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" dir="rtl">
      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* درج السلة */}
      <aside
        className="absolute right-0 top-0 h-full w-[90vw] max-w-sm bg-white shadow-2xl rounded-l-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* العنوان */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 id="cart-title" className="text-lg font-bold text-gray-900">
            سلة التسوق
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded p-1 transition"
            aria-label="إغلاق"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {cartProducts.length === 0 ? (
            <p className="text-center text-gray-600 py-10">
              سلة التسوق فارغة
            </p>
          ) : (
            cartProducts.map((product, i) => (
              <div key={i} className="pb-5 border-b">
                <div className="flex gap-3 flex-row-reverse">
                  <img
                    src={Array.isArray(product.image) ? product.image[0] : product.image}
                    alt={product.name}
                    className="w-16 h-24 object-cover flex-shrink-0"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900 leading-5 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {(Number(product.price || 0) * exchangeRate).toFixed(2)} {currency}
                      </p>
                    </div>

                    {/* التحكم بالكمية + إزالة */}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => dispatch(removeFromCart(product._id))}
                        className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
                      >
                        إزالة
                      </button>

                      <div className="inline-flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => dispatch(updateQuantity({ id: product._id, type: 'decrement' }))}
                          className="px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 text-gray-900">{product.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: product._id, type: 'increment' }))}
                          className="px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* الملخص */}
        <div className="border-t px-5 py-4 bg-white">
          <OrderSummary onClose={onClose} />
        </div>
      </aside>
    </div>
  );
};

export default CartModal;