// ShopPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from './ProductCards';
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import imge from "../../assets/بنر-فواح-الجبل.png01.png";

// الفئات الرئيسية
const MAIN_CATEGORIES = ['الكل', 'الزيوت العطرية', 'المياه العطرية', 'منتجات العناية الشخصية'];

// دالة تحديد الفئة الرئيسية من اسم فئة المنتج التفصيلية
const mapToMainCategory = (category = '') => {
  const c = String(category).trim();

  // المياه العطرية
  const waters = [
    'ماء الورد الأبيض الفوح',
    'ماء الورد الأحمر الفوح',
    'ماء اللبان الفوح',
  ];

  // الزيوت العطرية
  const oils = [
    'زيت الزيتون الفوح (أوليو)',
    'خليط إكليل الجبل الفوح (السر السحري)',
  ];

  if (waters.includes(c)) return 'المياه العطرية';
  if (oils.includes(c) || c.includes('زيت')) return 'الزيوت العطرية';

  // ما عدا ذلك يعد ضمن العناية الشخصية
  return 'منتجات العناية الشخصية';
};

const ShopPage = () => {
  const [searchParams] = useSearchParams();

  const [filtersState, setFiltersState] = useState({
    category: 'الكل', // فئة رئيسية
  });

  // التهيئة حسب باراميتر الرابط ?category=
  useEffect(() => {
    const categoryFromURL = searchParams.get('category');
    if (categoryFromURL && MAIN_CATEGORIES.includes(categoryFromURL)) {
      setFiltersState({ category: categoryFromURL });
    }
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [ProductsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  const { category } = filtersState;

  useEffect(() => {
    setCurrentPage(1);
  }, [filtersState]);

  // نجلب قائمة كبيرة ثم نفلتر محليًا على الفئات الرئيسية
  const {
    data: { products: serverProducts = [], totalPages: _serverTotalPages, totalProducts: _serverTotalProducts } = {},
    error,
    isLoading
  } = useFetchAllProductsQuery({
    // لا نرسل category للـ API لأننا نعمل فلترة رئيسية محليًا
    page: 1,
    limit: 1000, // حد كبير لضمان دقة الفلترة والصفحات محليًا
    sort: "createdAt:desc",
  });

  // فلترة حسب الفئة الرئيسية
  const filteredProducts = useMemo(() => {
    if (category === 'الكل') return serverProducts;
    return serverProducts.filter((p) => mapToMainCategory(p.category) === category);
  }, [serverProducts, category]);

  // الحسابات الخاصة بالصفحات محليًا
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / ProductsPerPage));
  const startIndex = (currentPage - 1) * ProductsPerPage;
  const endIndex = startIndex + ProductsPerPage;
  const pagedProducts = filteredProducts.slice(startIndex, endIndex);

  const clearFilters = () => {
    setFiltersState({ category: 'الكل' });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading) return <div className="text-center py-8 text-[#d3beaa]">جاري تحميل المنتجات...</div>;
  if (error) return <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المنتجات.</div>;

  const startProduct = totalProducts === 0 ? 0 : startIndex + 1;
  const endProduct = Math.min(startIndex + pagedProducts.length, totalProducts);

  return (
    <>
      {/* Hero Section with Image */}
      <section className='relative w-full overflow-hidden bg-[#e2e5e5]' style={{ aspectRatio: '16/9' }}>
        <img
          src={imge}
          alt="متجر حناء برغند"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4"></h1>
        </div>
      </section>

      {/* Products Section */}
      <section className='section__container py-8'>
        <div className='flex flex-col md:flex-row md:gap-8 gap-6'>
          {/* Filters Section */}
          <div className='md:w-1/4'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='md:hidden w-full bg-[#d3beaa] text-white py-2 px-4 rounded-md mb-4 flex items-center justify-between  transition-colors'
            >
              <span>{showFilters ? 'إخفاء الفلاتر' : 'تصفية المنتجات'}</span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`${showFilters ? 'block' : 'hidden'} md:block bg-white p-4 rounded-lg shadow-sm`}>
              <ShopFiltering
                filters={{ categories: MAIN_CATEGORIES }}
                filtersState={filtersState}
                setFiltersState={setFiltersState}
                clearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Products List */}
          <div className='md:w-3/4'>
            {/* <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-medium text-[#d3beaa]'>
                عرض {startProduct}-{endProduct} من {totalProducts} منتج
              </h3>
            </div> */}

            {pagedProducts.length > 0 ? (
              <>
                <ProductCards products={pagedProducts} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='mt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className="text-sm text-[#d3beaa]">
                      الصفحة {currentPage} من {totalPages}
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200'
                            : 'border-[#d3beaa] text-[#d3beaa] hover:bg-black hover:text-white'
                        }`}
                      >
                        السابق
                      </button>

                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const active = currentPage === index + 1;
                          return (
                            <button
                              key={index}
                              onClick={() => handlePageChange(index + 1)}
                              className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors ${
                                active
                                  ? 'bg-[#d3beaa] text-white border-[#d3beaa] '
                                  : 'border-[#d3beaa] text-[#d3beaa] bg-white  hover:text-white'
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200'
                            : 'border-[#d3beaa] text-[#d3beaa]  hover:text-white'
                        }`}
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-lg text-[#d3beaa]">لا توجد منتجات متاحة حسب الفلتر المحدد</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-[#d3beaa] text-white rounded-md  transition-colors"
                >
                  عرض جميع المنتجات
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopPage;
