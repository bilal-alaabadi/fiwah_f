// src/pages/About.jsx
import React from 'react';
import heroImg from '../assets/ChatGPT Image Sep 28, 2025, 12_48_41 PM.png';

const About = () => {
  return (
    <div dir="rtl" className="bg-white text-gray-800">
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          {/* الصورة */}
          <div className="md:w-1/2">
            <img
              src={heroImg}
              alt="Al Fawah Specialty Products — منتجات طبيعية بروح عُمانية"
              className="w-full max-w-md mx-auto rounded-xl shadow-lg"
            />
          </div>

          {/* النص */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-[#d3beaa] mb-4">
              Al Fawah Specialty Products
              <br />
              <span className="text-gray-700"> عبق الطبيعة العُمانية… بصياغة علمية</span>
            </h2>

            <p className="text-lg leading-loose mb-4">
              في قلب عُمان، حيث يلتقي تراث اللبان وماء الورد وزيت الزيتون بجمال الجبل الأخضر، وُلدت
              <span className="font-semibold text-[#d3beaa]"> Al Fawah</span> لتقدم منتجات عناية يومية
              تجمع بين المكوّنات الطبيعية والبحث العلمي المعتمد. رؤيتنا بسيطة: عناية فعّالة، أصيلة، وآمنة،
              ترفع روتينك اليومي إلى تجربة مدروسة وراقية.
            </p>

            <p className="leading-loose mb-4">
              بدأت الرحلة بمنتجات محلية الصنع صُمّمت بعناية وفق معايير الجودة، ثم تطوّرت إلى تشكيلة كاملة
              مستوحاة من الطبيعة العُمانية: كريمات اللبان، ماء الورد، الشامبو برائحة الآس، وزيوت الشعر
              المدعّمة بالرزماري. كل منتج يحكي قصة مكوّن أصيل مصاغ بصياغة علمية دقيقة.
            </p>

            <div className="mt-6 p-5 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-[#d3beaa] mb-3">رؤيتنا</h3>
              <ul className="space-y-2 list-disc pr-5">
                <li>دمج التراث الطبيعي العُماني مع صيغ علمية فعّالة يمكن الوثوق بها.</li>
                <li>مكوّنات نظيفة: اختيار مدروس وخالي من التعقيد غير الضروري.</li>
                <li>تجربة استخدام راقية بسعر منصف، تلائم الروتين اليومي.</li>
              </ul>
            </div>

            

            <p className="mt-8 text-lg font-medium text-[#d3beaa]">
              Al Fawah — حيث تلتقي الأصالة العُمانية بالصياغة العلمية.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-xl font-semibold text-[#d3beaa]">
            منتج واحد… يحكي قصة طبيعة وهوية خالدة.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
