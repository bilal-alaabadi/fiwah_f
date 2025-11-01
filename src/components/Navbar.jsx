// ========================= src/components/Navbar.jsx =========================
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CartModal from '../pages/shop/CartModal';
import avatarImg from "../assets/avatar.png";
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import log from "../assets/logo_d3beaa.png";
import { setCountry } from '../redux/features/cart/cartSlice';

const Navbar = () => {
  const products = useSelector((state) => state.cart.products);
  const { country } = useSelector((state) => state.cart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // ↓ جديد لتصغير الناف عند السكول
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUser] = useLogoutUserMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCartToggle = () => setIsCartOpen(!isCartOpen);
  const handleDropDownToggle = () => setIsDropDownOpen(!isDropDownOpen);
  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleCountryChange = (e) => {
    dispatch(setCountry(e.target.value));
  };

  const adminMenus = [
    { label: "لوحة التحكم", path: "/dashboard/admin" },
    { label: "إدارة العناصر", path: "/dashboard/manage-products" },
    { label: "جميع الطلبات", path: "/dashboard/manage-orders" },
    { label: "إضافة منتج", path: "/dashboard/add-product" },
  ];

  const userMenus = [{ label: "لوحة التحكم", path: "/dashboard" }];
  const dropdownMenus = user?.role === 'admin' ? adminMenus : userMenus;

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      {/* متغيرات الألوان داخل الصفحة */}
      <style>{`
        :root {
          --color-primary: #d3beaa;
          --color-secondary: #d3ae27;
          --color-text: #000000;
          --color-bg: #ffffff;
        }
      `}</style>

      {/* هيدر مثبت + يتصاغر عند السكرول */}
      <header
        className={`w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'pt-2' : 'pt-10'
        }`}
      >
        <div className="mx-auto px-4">
          {/* Mobile Navbar */}
          <div
            className={`md:hidden flex items-center justify-between ${
              scrolled ? 'h-12 pt-2 pb-6' : 'h-16 pt-4 pb-12'
            } mb-2`}
          >
            <button
              onClick={handleMobileMenuToggle}
              className="text-[var(--color-primary)] hover:text-black text-2xl"
            >
              <i className="ri-menu-line"></i>
            </button>

            <div className="absolute left-1/2 transform -translate-x-1/2 pt-5">
              <Link to="/">
                <img
                  src={log}
                  alt="شعار الأنثور"
                  className={`${scrolled ? 'h-16' : 'h-24'} object-contain transition-all duration-300`}
                />
              </Link>
            </div>

            <div className="flex items-center gap-4" dir="rtl">
              {user ? (
                <div className="relative">
                  <img
                    onClick={handleDropDownToggle}
                    src={user?.profileImage || avatarImg}
                    alt="صورة المستخدم"
                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200"
                  />
                  {isDropDownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <ul className="py-2">
                        {dropdownMenus.map((menu, idx) => (
                          <li key={idx}>
                            <Link
                              to={menu.path}
                              onClick={() => setIsDropDownOpen(false)}
                              className="block px-4 py-3 text-lg text-[var(--color-primary)] hover:text-black transition-colors"
                            >
                              {menu.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-right px-4 py-3 text-lg text-[var(--color-primary)] hover:text-black transition-colors"
                          >
                            تسجيل الخروج
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-[var(--color-primary)] hover:text-black text-2xl">
                  <i className="ri-user-line"></i>
                </Link>
              )}

              <button
                onClick={handleCartToggle}
                className="relative text-[var(--color-primary)] hover:text-black text-2xl"
              >
                <i className="ri-shopping-bag-line"></i>
                {products.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-secondary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {products.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navbar */}
          <div
            className={`hidden md:flex items-center justify-between ${
              scrolled ? 'h-16 pb-4' : 'h-20 pb-7'
            } transition-all duration-300`}
          >
            <div className="flex items-center gap-8">
              <select
                value={country}
                onChange={handleCountryChange}
                className="p-2 border rounded-md text-[var(--color-primary)] hover:text-black bg-white"
              >
                <option value="عمان">عمان (ر.ع.)</option>
                <option value="دول الخليج">دول الخليج (د.إ)</option>
              </select>

              <button
                onClick={handleCartToggle}
                className="relative text-[var(--color-primary)] hover:text-black text-3xl"
              >
                <i className="ri-shopping-bag-line"></i>
                {products.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-secondary)] text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
                    {products.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-grow flex justify-center">
              <Link to="/">
                <img
                  src={log}
                  alt="شعار الأنثور"
                  className={`${scrolled ? 'h-16' : 'h-28'} object-contain hover:scale-105 transition-all duration-300`}
                />
              </Link>
            </div>

            <div className="flex items-center gap-4" dir="rtl">
              {user ? (
                <div className="relative">
                  <img
                    onClick={handleDropDownToggle}
                    src={user?.profileImage || avatarImg}
                    alt="صورة المستخدم"
                    className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 hover:border-[var(--color-secondary)] transition-colors"
                  />
                  {isDropDownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <ul className="py-2">
                        {dropdownMenus.map((menu, idx) => (
                          <li key={idx}>
                            <Link
                              to={menu.path}
                              onClick={() => setIsDropDownOpen(false)}
                              className="block px-4 py-3 text-lg text-[var(--color-primary)] hover:text-black transition-colors"
                            >
                              {menu.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-right px-4 py-3 text-lg text-[var(--color-primary)] hover:text-black transition-colors"
                          >
                            تسجيل الخروج
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-[var(--color-primary)] hover:text-black text-3xl transition-colors">
                  <i className="ri-user-line"></i>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex justify-center border-t border-gray-200 py-4 mt-2">
            <div className="flex gap-10">
              <Link to="/shop" className="text-[var(--color-primary)] hover:text-black font-bold text-xl transition-colors">
                المنتجات
              </Link>
              <Link to="/" className="text-[var(--color-primary)] hover:text-black font-bold text-xl transition-colors">
                الصفحة الرئيسية
              </Link>
              <Link to="/about" className="text-[var(--color-primary)] hover:text-black font-bold text-xl transition-colors">
                قصتنا
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile Sliding Menu */}
        <div
          className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl transition-transform duration-300 ${
              isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="px-6 py-6 flex flex-col items-center gap-4">
              <button
                onClick={handleMobileMenuToggle}
                className="absolute top-4 left-4 text-[var(--color-primary)] hover:text-black text-2xl"
              >
                <i className="ri-close-line"></i>
              </button>

              <select
                value={country}
                onChange={handleCountryChange}
                className="w-full p-3 text-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:text-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent"
              >
                <option value="عمان">عمان 🇴🇲 (ر.ع.)</option>
                <option value="دول الخليج">دول الخليج  (د.إ)</option>
              </select>

              <Link
                to="/shop"
                onClick={handleMobileMenuToggle}
                className="w-full text-center py-4 px-6 font-medium text-xl text-[var(--color-primary)] hover:text-black rounded-lg transition-all duration-300"
              >
                المنتجات
              </Link>
              <Link
                to="/"
                onClick={handleMobileMenuToggle}
                className="w-full text-center py-4 px-6 font-medium text-xl text-[var(--color-primary)] hover:text-black rounded-lg transition-all duration-300"
              >
                الصفحة الرئيسية
              </Link>
              <Link
                to="/about"
                onClick={handleMobileMenuToggle}
                className="w-full text-center py-4 px-6 font-medium text-xl text-[var(--color-primary)] hover:text-black rounded-lg transition-all duration-300"
              >
                قصتنا
              </Link>
            </div>
          </div>
        </div>

        {/* Cart Modal */}
        {isCartOpen && (
          <CartModal
            products={products}
            isOpen={isCartOpen}
            onClose={handleCartToggle}
          />
        )}
      </header>

      {/* Spacer لمنع قفزة المحتوى بسبب الهيدر المثبّت */}
      <div className={`${scrolled ? 'h-16 md:h-20' : 'h-24 md:h-28'}`} />
    </>
  );
};

export default Navbar;
