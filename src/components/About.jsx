// src/pages/About.jsx
import React from 'react';
import heroImg from '../assets/ChatGPT Image Sep 28, 2025, 12_48_41 PM.png';

const About = () => {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#fdf7f1] via-[#f3e5d8] to-[#fdf7f1] text-gray-800 pt-16"
    >
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        {/* كارد المحتوى الرئيسي */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#e5d4c4] px-6 py-10 md:px-10">
          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
            {/* الصورة */}
            <div className="md:w-1/2">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#d3beaa33] via-transparent to-[#f3e5d855] blur-xl" />
                <img
                  src={heroImg}
                  alt="Al Fawah Specialty Products — منتجات طبيعية بروح عُمانية"
                  className="relative w-full rounded-2xl shadow-xl border border-[#ead9c8]"
                />
              </div>
            </div>

            {/* النص */}
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-[#c7ad93] mb-4 leading-snug">
Al Fawah Speciality Perfumes 
                <br />
                <span className="text-gray-700 text-2xl md:text-2xl">
                  عبق الطبيعة العُمانية… بصياغة علمية
                </span>
              </h2>

              {/* النص الجديد */}
              <p className="text-lg leading-loose mb-4">
                في قلب عُمان، حيث يلتقي تراث اللبان وماء الورد وزيت الزيتون بجمال الجبل الأخضر،
                وُلدت <span className="font-semibold text-[#c7ad93]">Al Fawah</span> لتقدم منتجات
                عناية يومية تجمع بين المكوّنات الطبيعية والبحث العلمي الموثوق. رؤيتنا واضحة وبسيطة:
                عناية فعّالة، أصيلة، وآمنة، ترتقي بروتينك اليومي إلى تجربة راقية ومدروسة.
              </p>

              <p className="leading-loose mb-4">
                انطلقت رحلتنا من منتجات محلية مُصنَّعة بعناية وفق أعلى معايير الجودة،
                ثم تطوّرنا إلى مجموعة متكاملة مستوحاة من الطبيعة العُمانية:
                كريمات اللبان، ماء الورد، شامبو برائحة الآس، وزيوت شعر مدعّمة بالرزماري.
                كل منتج يحكي قصة مكوّن أصيل تمت صياغته بعلم ومعرفة ليصل إليك بأفضل صورة.
              </p>

              {/* رؤيتنا */}
              <div className="mt-6 p-5 rounded-2xl border border-[#e5d4c4] bg-[#fdf7f1]">
                <h3 className="text-2xl font-semibold text-[#c7ad93] mb-3">رؤيتنا</h3>
                <ul className="space-y-2 list-disc pr-5 text-base leading-relaxed">
                  <li>السعي لنكون أفضل شركة مختصة في إنتاج المياه والزيوت العطرية الطبيعية.</li>
                  <li>تمكين المستهلك من الحصول على ما يحتاجه من كميات وأنواع مختلفة.</li>
                  <li>تقديم منتجات عالية الجودة تلبي توقعات واحتياجات المستهلك.</li>
                </ul>
              </div>

              <p className="mt-8 text-lg font-medium text-[#c7ad93]">
                Al Fawah Speciality Perfumes — حيث تلتقي الأصالة العُمانية بالصياغة العلمية.
              </p>
            </div>
          </div>
        </div>

        {/* جملة ختامية في الأسفل */}
        <div className="text-center mt-16">
          <p className="inline-block px-6 py-3 rounded-full border border-[#e5d4c4] bg-white/80 shadow-md text-xl font-semibold text-[#c7ad93]">
            منتج واحد… يحكي قصة طبيعة وهوية خالدة.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
