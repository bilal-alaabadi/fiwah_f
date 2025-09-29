import React from 'react';
import { Link } from 'react-router-dom';
import timings from "../../assets/بنر-فواح-الجبل.png01.png";

const Banner = () => {
    return (
        <div className="py-3"> {/* شلت px-4 */}
            <div className="text-right" dir="rtl">
                {/* يمكن إضافة محتوى هنا إذا لزم الأمر */}
            </div>

            <div className="mt-4 px-1 md:mt-8">
                <Link to="/shop">
                    <img
                        src={timings}
                        alt="صورة البانر"
                        className="w-full h-auto object-cover md:object-contain
                                   max-h-[70vh] md:max-h-none
                                   rounded-lg shadow-md
                                   transform hover:scale-[1.01] transition-transform duration-300"
                    />
                </Link>
            </div>
        </div>
    );
};

export default Banner;
