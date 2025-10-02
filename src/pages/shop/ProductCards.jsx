// ========================= src/components/shop/ProductCards.jsx =========================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RatingStars from '../../components/RatingStars';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';

const ProductCards = ({ products }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addedItems, setAddedItems] = useState({});
  const { country } = useSelector((state) => state.cart);

  const isAEDCountry = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAEDCountry ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAEDCountry ? 9.5 : 1;

  const PERFUME_CATEGORIES = new Set([
    'عطر', 'عطور', 'عطورات',
    'معطر الجسم', 'معطرات الجسم',
    'بودي ميست', 'بودي مسك', 'بخاخ الجسم',
    'معطر الجو'
  ]);

  const isPerfume = (product) => {
    const cat = (product?.category || '').trim();
    return PERFUME_CATEGORIES.has(cat);
  };

  const getBasePriceForCompare = (product) => {
    if (!product) return 0;
    if (typeof product.price === 'object' && product.price !== null) {
      return product.price['500 جرام'] || product.price['1 كيلو'] || 0;
    }
    return product.regularPrice || product.price || 0;
  };

  const getProductPrice = (product) => {
    const base = getBasePriceForCompare(product);
    return base * exchangeRate;
  };

  const handleAddToCart = (productId, product) => {
    if (!isPerfume(product)) {
      navigate(`/shop/${productId}`);
      return;
    }

    const originalPrice = product.regularPrice || product.price || 0;
    dispatch(addToCart({ ...product, price: originalPrice }));
    setAddedItems((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [productId]: false }));
    }, 1000);
  };

  const renderPrice = (product) => {
    const price = getProductPrice(product);
    const oldPrice = product.oldPrice ? product.oldPrice * exchangeRate : null;
    const hasRealDiscount = product.oldPrice && product.oldPrice > getBasePriceForCompare(product);

    return (
      <div className="space-y-1 text-center">
        <div className="font-medium text-lg">
          {price.toFixed(2)} {currency}
        </div>
        {hasRealDiscount && oldPrice && (
          <s className="text-[#9B2D1F] text-sm">{oldPrice.toFixed(2)} {currency}</s>
        )}
      </div>
    );
  };

  return (
    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {products.map((product) => {
        const basePrice = getBasePriceForCompare(product);
        const hasRealDiscount = product.oldPrice && product.oldPrice > basePrice;
        const discountPercentage = hasRealDiscount
          ? Math.round(((product.oldPrice - basePrice) / product.oldPrice) * 100)
          : 0;

        const qtyCandidate = [product?.stock, product?.quantity, product?.availableQty, product?.available]
          .find((v) => Number.isFinite(Number(v)));
        const availableQty = qtyCandidate !== undefined ? Number(qtyCandidate) : undefined;
        const isOutOfStock = product?.inStock === false ||
          (typeof availableQty === 'number' && availableQty <= 0);

        return (
          <div
            key={product._id}
            className='product__card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full'
          >
            {hasRealDiscount && (
              <div className="absolute top-3 left-3 bg-[#d3beaa] text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                خصم {discountPercentage}%
              </div>
            )}

            <div className='relative flex-grow'>
              {!isOutOfStock ? (
                <Link to={`/shop/${product._id}`} className="block h-full">
                  <div className="h-64 w-full overflow-hidden">
                    <img
                      src={product.image?.[0] || "https://via.placeholder.com/300"}
                      alt={product.name || "صورة المنتج"}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                        e.target.alt = "صورة المنتج غير متوفرة";
                      }}
                    />
                  </div>
                </Link>
              ) : (
                <div className="block h-full cursor-not-allowed select-none relative" aria-disabled="true">
                  <div className="h-64 w-full overflow-hidden">
                    <img
                      src={product.image?.[0] || "https://via.placeholder.com/300"}
                      alt={product.name || "صورة المنتج"}
                      className="w-full h-full object-cover opacity-70"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                        e.target.alt = "صورة المنتج غير متوفرة";
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded-md">انتهى المنتج</span>
                  </div>
                </div>
              )}

              <div className='absolute top-3 right-3 ' >
                {!isOutOfStock ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product._id, product);
                    }}
                    className={`p-2 text-white rounded-full shadow-md transition-all duration-300 ${
                      addedItems[product._id] ? 'bg-green-500' : 'bg-[#d3beaa]'
                    }`}
                    aria-label="إضافة إلى السلة"
                  >
                    {addedItems[product._id] ? (
                      <i className="ri-check-line"></i>
                    ) : (
                      <i className="ri-shopping-cart-2-line"></i>
                    )}
                  </button>
                ) : (
                  <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded-md select-none">
                    انتهى المنتج
                  </span>
                )}
              </div>
            </div>

            <div className='p-4 text-center'>
              <h4 className="text-lg font-semibold mb-1">{product.name || "اسم المنتج"}</h4>
              <p className="text-gray-500 text-sm mb-3">{product.category || "فئة غير محددة"}</p>
              {renderPrice(product)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductCards;
