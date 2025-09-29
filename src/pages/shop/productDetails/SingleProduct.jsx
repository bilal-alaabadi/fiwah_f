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

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...data,
        price: data.price,
        quantity: cartQty,
        currency,
        exchangeRate,
      })
    );
  };

  const nextImage = () =>
    setCurrentImageIndex((prev) =>
      prev === data.image.length - 1 ? 0 : prev + 1
    );

  const prevImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? data.image.length - 1 : prev - 1
    );

  return (
    <section
      className="section__container bg-gradient-to-r  mt-8"
      dir="rtl"
    >
      <div className="flex flex-col items-center md:flex-row gap-8">
        {/* الصور */}
        <div className="md:w-1/2 w-full relative">
          {data.image && data.image.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-md">
                <img
                  src={data.image[currentImageIndex]}
                  alt={data.name}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500';
                  }}
                />
              </div>

              {data.image.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#d3beaa] text-white p-2 rounded-full"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#d3beaa] text-white p-2 rounded-full"
                  >
                    ›
                  </button>
                </>
              )}
            </>
          ) : (
            <p>لا توجد صور متاحة.</p>
          )}
        </div>

        {/* التفاصيل */}
        <div className="md:w-1/2 w-full">
          <h3 className="text-2xl font-semibold mb-4">{data.name}</h3>
          <p className="text-gray-600 mb-2">الفئة: {data.category}</p>
          <p className="text-gray-600 mb-4">{data.description}</p>

          <div className="text-xl text-[#d3beaa] mb-6">
            السعر: {unitPrice.toFixed(2)} {currency}
          </div>

          {/* عداد الكمية */}
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCartQty((q) => (q > 1 ? q - 1 : 1))}
              className="w-10 h-10 flex items-center justify-center bg-[#d3beaa] text-white rounded-md"
            >
              -
            </button>
            <div className="min-w-[3rem] text-center font-bold text-lg">
              {cartQty}
            </div>
            <button
              type="button"
              onClick={() => setCartQty((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center bg-[#d3beaa] text-white rounded-md"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="px-6 py-3 bg-[#d3beaa] text-white rounded-md hover:opacity-90"
          >
            إضافة إلى السلة
          </button>
        </div>
      </div>
    </section>
  );
};

export default SingleProduct;
