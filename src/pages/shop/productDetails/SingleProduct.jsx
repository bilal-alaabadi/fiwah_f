// ========================= src/pages/shop/SingleProduct.jsx =========================
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data, error, isLoading } = useFetchProductByIdQuery(id);
  const { country } = useSelector((state) => state.cart);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartQty, setCartQty] = useState(1);

  const isAEDCountry = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAEDCountry ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAEDCountry ? 9.5 : 1;

  if (isLoading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;
  if (!data) return null;

  const unitPrice = (data.regularPrice || data.price || 0) * exchangeRate;

  // ✅ إظهار كمية المخزون
  const stock = typeof data.stock === 'number' ? data.stock : 0;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // تأكيد عدم تجاوز المطلوب للمخزون
    const qtyToAdd = Math.max(1, Math.min(cartQty, stock || cartQty));

    dispatch(
      addToCart({
        ...data,
        price: data.price,
        quantity: qtyToAdd,
        currency,
        exchangeRate,
      })
    );

    // ✅ تصفير (إرجاع) الكمية إلى 1 بعد الإضافة
    setCartQty(1);
  };

  const nextImage = () =>
    setCurrentImageIndex((prev) =>
      prev === (data.image?.length || 0) - 1 ? 0 : prev + 1
    );

  const prevImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? (data.image?.length || 0) - 1 : prev - 1
    );

  return (
    <section className="section__container bg-gradient-to-r mt-8" dir="rtl">
      <div className="flex flex-col items-center md:flex-row gap-8">
        {/* الصور */}
        <div className="md:w-1/2 w-full relative flex flex-col items-center">
          {data.image && data.image.length > 0 ? (
            <>
              {/* الصورة الرئيسية */}
              <div className="overflow-hidden rounded-md relative w-full">
                <img
                  src={data.image[currentImageIndex]?.replace(
                    '/upload/',
                    '/upload/f_auto,q_auto/'
                  )}
                  alt={data.name}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/500';
                  }}
                />

                {/* أزرار التالي/السابق */}
                {data.image.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#d3beaa] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:opacity-90"
                      aria-label="الصورة السابقة"
                      type="button"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#d3beaa] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:opacity-90"
                      aria-label="الصورة التالية"
                      type="button"
                    >
                      ‹
                    </button>
                  </>
                )}
              </div>

              {/* جميع الصور بالأسفل */}
              {data.image.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="flex gap-3 flex-wrap justify-center md:justify-center overflow-x-auto py-1">
                    {data.image.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`rounded-md border-2 p-0 overflow-hidden transition 
                          ${index === currentImageIndex ? 'border-[#d3beaa]' : 'border-transparent hover:border-[#d3beaa]/60'}`}
                        type="button"
                        aria-label={`عرض الصورة رقم ${index + 1}`}
                        title={`عرض الصورة رقم ${index + 1}`}
                      >
                        <img
                          src={img?.replace(
                            '/upload/',
                            '/upload/f_auto,q_auto/'
                          )}
                          alt={`صورة ${index + 1}`}
                          className="w-20 h-20 object-cover block"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/100';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p>لا توجد صور متاحة.</p>
          )}
        </div>

        {/* التفاصيل */}
        <div className="md:w-1/2 w-full text-center">
          <h3 className="text-2xl font-semibold mb-2">{data.name}</h3>
          <p className="text-gray-600 mb-2">{data.category}</p>

          {/* ✅ عرض كمية المخزون */}
          <div className="mb-3 flex justify-center">
            {isOutOfStock ? (
              <span className="inline-block px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm font-medium">
                غير متوفر حالياً
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-sm font-medium">
                المتوفر بالمخزون: {stock}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-4">{data.description}</p>

          <div className="text-xl text-[#d3beaa] mb-6">
            السعر: {unitPrice.toFixed(2)} {currency}
          </div>

          {/* عداد الكمية */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setCartQty((q) => (q > 1 ? q - 1 : 1))}
              className={`w-10 h-10 flex items-center justify-center rounded-md text-white ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#d3beaa]'}`}
              disabled={isOutOfStock}
            >
              -
            </button>
            <div className="min-w-[3rem] text-center font-bold text-lg">
              {cartQty}
            </div>
            <button
              type="button"
              onClick={() =>
                setCartQty((q) => {
                  if (isOutOfStock) return q;
                  // لا تتجاوز المخزون
                  const next = q + 1;
                  return stock ? Math.min(next, stock) : next;
                })
              }
              className={`w-10 h-10 flex items-center justify-center rounded-md text-white ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#d3beaa]'}`}
              disabled={isOutOfStock}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-6 py-3 rounded-md text-white transition ${
              isOutOfStock
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#d3beaa] hover:opacity-90'
            }`}
          >
            {isOutOfStock ? 'غير متوفر' : 'إضافة إلى السلة'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SingleProduct;
