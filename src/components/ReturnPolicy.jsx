import React from 'react';

const ReturnPolicy = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        
        {/* العنوان الرئيسي */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-[#d3beaa] mb-6">
          سياسة الاسترجاع والاستبدال
        </h1>

        {/* مقدمة الصفحة */}
        <div className="mb-8 text-right space-y-4">
          <p className="text-gray-700 text-lg leading-relaxed">
            في <span className="font-semibold text-[#d3beaa]">Fawah Al Jabal</span> نحرص دائمًا على رضا عملائنا وضمان جودة منتجاتنا، ونلتزم بتقديم تجربة تسوق آمنة وسهلة. ولأن منتجاتنا طبيعية وعناية شخصية (مثل الكريمات، الزيوت، ماء الورد، الشامبو…)، فإننا نتبع سياسة استرجاع واستبدال واضحة تحافظ على صحتك وجودة منتجاتنا.
          </p>
        </div>

        {/* البنود الأساسية */}
        <div className="space-y-6 text-right">
          
          {/* البند الأول */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">الاسترجاع</h3>
            <p className="text-gray-600 leading-relaxed">
              نقبل طلبات الاسترجاع فقط في حالة وصول المنتج <span className="font-semibold text-[#d3beaa]">تالفًا أو مكسورًا</span>، أو في حال استلام منتج <span className="font-semibold text-[#d3beaa]">مختلف عن الطلبية</span>. يجب تقديم الطلب خلال <span className="font-semibold text-[#d3beaa]">24 ساعة من استلام الطلبية</span> مع إرفاق صور توضح المشكلة.
            </p>
          </div>

          {/* البند الثاني */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">الاستبدال</h3>
            <p className="text-gray-600 leading-relaxed">
              نقبل استبدال المنتج فقط إذا كان مغلقًا في عبواته الأصلية ولم يُفتح أو يُستخدم. لا يمكن استبدال المنتجات المفتوحة أو المستخدمة حفاظًا على الصحة العامة وضمان الجودة.
            </p>
          </div>

          {/* البند الثالث */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">المنتجات التالفة أو الناقصة</h3>
            <p className="text-gray-600 leading-relaxed">
              في حال استلام منتج ناقص أو تالف، نرجو التواصل فورًا بخدمة العملاء مرفقًا بالصور خلال <span className="font-semibold text-[#d3beaa]">24 ساعة</span> ليتم تعويضك أو إرسال بديل.
            </p>
          </div>

          {/* البند الرابع */}
          <div className="pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">تكاليف الشحن</h3>
            <p className="text-gray-600 leading-relaxed">
              نتحمل تكاليف الشحن في حال كان الخطأ من جانبنا (منتج تالف أو خاطئ). في الحالات الأخرى (مثل رغبة العميل في الاستبدال دون وجود خطأ من جانبنا)، يتحمل العميل تكاليف الشحن.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-700 text-sm italic">
            📌 ملاحظة: لأن منتجاتنا طبيعية وصحية، لا يمكننا قبول الإرجاع بعد فتح العبوة، وذلك حفاظًا على سلامة عملائنا وجودة منتجاتنا.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReturnPolicy;
