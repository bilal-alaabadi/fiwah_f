// ShopFiltering.jsx
import React from 'react';

const ShopFiltering = ({ filters, filtersState, setFiltersState, clearFilters }) => {
  return (
    <div className='space-y-5 flex-shrink-0' dir="rtl">
      <h3>الفلاتر</h3>

      {/* الفئات الرئيسية فقط */}
      <div className='flex flex-col space-y-2'>
        <h4 className='font-medium text-lg'>الفئة</h4>
        <hr />
        {filters.categories.map((category) => (
          <label key={category} className='cursor-pointer flex items-center gap-2'>
            <input
              type="radio"
              name="category"
              value={category}
              checked={filtersState.category === category}
              onChange={(e) =>
                setFiltersState({
                  ...filtersState,
                  category: e.target.value,
                })
              }
              className='ml-2'
            />
            <span>{category}</span>
          </label>
        ))}
      </div>

      {/* مسح الفلاتر */}
      <button
        onClick={clearFilters}
        className='bg-[#d3beaa] py-1 px-4 text-white rounded'
      >
        مسح كل الفلاتر
      </button>
    </div>
  );
};

export default ShopFiltering;
