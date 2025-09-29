import React from "react";
import log from "../assets/logo_d3beaa.png"; // شعار RF_COLLECTION
import {
  SiVisa,
  SiMastercard,
  SiApplepay,
  SiGooglepay,
} from "react-icons/si";
import { FaInstagram, FaWhatsapp, FaSnapchatGhost, FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* ===== شريط علوي FULL-BLEED بعرض الشاشة بالكامل ===== */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        {/* الخلفية المنحنية */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 36"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M28 0 H100 V36 H28 A28 28 0 0 1 28 0 Z" fill="#d3beaa" />
        </svg>

        {/* محتوى الشريط */}
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 ">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* الشعار */}
            <div className="shrink-0 self-start">
              <img
                src={log}
                alt="شعار RF_COLLECTION"
                className="w-28 md:w-40 object-contain select-none pointer-events-none"
              />
            </div>

            {/* وسائل الدفع */}
            <div className="text-white w-full md:w-auto md:ml-auto md:self-center">
              <div className="w-full flex justify-end">
                <div className="flex items-center gap-5 md:gap-6 mb-3 md:mb-4">
                  <SiVisa className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiMastercard className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiApplepay className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiGooglepay className="text-3xl md:text-4xl drop-shadow-sm" />
                </div>
              </div>

              <p className="text-right text-lg md:text-2xl font-semibold leading-relaxed">
                وسائل دفع متعددة
                <br />
                اختر وسيلة الدفع المناسبة
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ===== نهاية الشريط العلوي ===== */}

      {/* الأقسام السفلية */}
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-10  bg-white text-[#d3beaa] md:text-right text-center">
          {/* RF_COLLECTION */}
          {/* <div>
            <h4 className="text-xl font-bold mb-3">RF_COLLECTION</h4>
            <p className="text-lg leading-loose mb-4">
              في سلطنة عُمان، كانت هناك فتاة تحلم منذ صغرها بابتكار شيءٍ
              يعكس أناقة المرأة العُمانية بروحٍ عصرية. من هذا الحلم وُلدت
              <span className="font-semibold text-[#CB908B]"> RF_COLLECTION</span>:
              علامة عبايات راقية بقصّات نادرة وبسيطة، توازن بين الحشمة
              والتميّز.
            </p>
          </div> */}

          {/* روابط مهمة */}
          <div>
            <h4 className="text-xl font-bold mb-3">روابط مهمة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="hover:text-[#d3ae27] transition">
                  من نحن
                </a>
              </li>
              <li>
                <a
                  href="/return-policy"
                  className="hover:text-[#d3ae27] transition"
                >
                  سياسة الاستبدال والاسترجاع
                </a>
              </li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <h4 className="text-xl font-bold mb-3">تواصل معنا</h4>
            <p className="text-sm mb-4">+96898858036</p>
            <div className="flex justify-center md:justify-end gap-4 ">
              <a
                href="https://www.instagram.com/fawah_1/reels/"
                target="_blank"
                rel="noopener noreferrer"
                className=" hover:text-[#9B2D1F] transition"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=96898858036&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className=" hover:text-[#9B2D1F] transition"
              >
                <FaWhatsapp className="text-xl" />
              </a>


            </div>
          </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-[#CB908B]/30 pt-4 pb-8 text-center text-sm text-[#d3beaa]" dir="rtl">
          جميع الحقوق محفوظة لدى فواح الجبل
 —{" "}
          <a
            href="https://www.instagram.com/mobadeere/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#2e3528] transition-colors"
          >
            تصميم مبادر
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
