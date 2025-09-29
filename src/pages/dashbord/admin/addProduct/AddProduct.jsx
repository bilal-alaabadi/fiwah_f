import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';

const categories = [
  { label: 'أختر منتج', value: '' },
  { label: 'واقي شمس الفوح', value: 'واقي شمس الفوح' },
  { label: 'كريم اللبان الفوح', value: 'كريم اللبان الفوح' },
  { label: 'شامبو الشعر الفوح', value: 'شامبو الشعر الفوح' },
  { label: 'جل الاستحمام الفوح', value: 'جل الاستحمام الفوح' },
  { label: 'مقشر الجسم باللبان الفوح', value: 'مقشر الجسم باللبان الفوح' },
  { label: 'مقشر الجسم بماء الورد الفوح', value: 'مقشر الجسم بماء الورد الفوح' },
  { label: 'ماء الورد الأبيض الفوح', value: 'ماء الورد الأبيض الفوح' },
  { label: 'ماء الورد الأحمر الفوح', value: 'ماء الورد الأحمر الفوح' },
  { label: 'ماء اللبان الفوح', value: 'ماء اللبان الفوح' },
  { label: 'زيت الزيتون الفوح (أوليو)', value: 'زيت الزيتون الفوح (أوليو)' },
  { label: 'خليط إكليل الجبل الفوح (السر السحري)', value: 'خليط إكليل الجبل الفوح (السر السحري)' },
];


// خريطة أوزان/سعات لكل منتج (بالـ ml لمنتجات Al Fawah)
const WEIGHTS_MAP = {
  'واقي شمس الفوح': [50],
  'كريم اللبان الفوح': [100],
  'شامبو الشعر الفوح': [250],
  'جل الاستحمام الفوح': [250],
  'مقشر الجسم باللبان الفوح': [150],
  'مقشر الجسم بماء الورد الفوح': [150],
  'ماء الورد الأبيض الفوح': [250],
  'ماء الورد الأحمر الفوح': [250],
  'ماء اللبان الفوح': [250],
  'زيت الزيتون الفوح (أوليو)': [250],
  'خليط إكليل الجبل الفوح (السر السحري)': [150],
};


// مولد خيارات وزن حسب المنتج المختار
const weightOptionsFor = (categoryValue) => {
  const nums = WEIGHTS_MAP[categoryValue] || [];
  return nums.map((n) => ({ label: `${n} مل`, value: n }));
};

const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    weight: '',     // الوزن/السعة (إلزامي)
    price: '',
    description: '',
    oldPrice: '',
    inStock: true,  // متوفر افتراضياً
  });

  const [image, setImage] = useState([]);

  const [addProduct, { isLoading }] = useAddProductMutation();
  const navigate = useNavigate();

  // خيارات الوزن تتحدّث تلقائياً عند تغيير الصنف
  const weightOptions = useMemo(
    () => [{ label: 'أختر الوزن', value: '' }, ...weightOptionsFor(product.category)],
    [product.category]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ended' && type === 'checkbox') {
      setProduct((prev) => ({ ...prev, inStock: !checked }));
    } else {
      setProduct((prev) => {
        // لو غيّرنا الصنف، نفرغ الوزن ليعيد اختياره من القائمة الصحيحة
        if (name === 'category') {
          return { ...prev, category: value, weight: '' };
        }
        return { ...prev, [name]: value };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      'أسم المنتج': product.name,
      'صنف المنتج': product.category,
      'الوزن/السعة': product.weight,
      'السعر': product.price,
      'الوصف': product.description,
      'الصور': image.length > 0,
    };

    const missing = Object.entries(required)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    if (missing.length) {
      alert(`الرجاء ملء الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    try {
      await addProduct({
        ...product,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
        weight: Number(product.weight), // تأكيد أن الوزن رقم
        image,
        author: user?._id,
      }).unwrap();

      alert('تمت إضافة المنتج بنجاح');
      setProduct({
        name: '',
        category: '',
        weight: '',
        oldPrice: '',
        price: '',
        description: '',
        inStock: true,
      });
      setImage([]);
      navigate('/shop');
    } catch (err) {
      console.error('Failed to submit product', err);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  return (
    <div className="container mx-auto mt-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">إضافة منتج جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="أسم المنتج"
          name="name"
          placeholder="اكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
        />

        {/* الوزن/السعة (إلزامي) */}
        <SelectInput
          label="الوزن / السعة"
          name="weight"
          value={product.weight}
          onChange={handleChange}
          options={weightOptions}
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
          min="0"
        />

        <TextInput
          label="السعر"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
          min="0"
          required
        />

        {/* هل انتهى المنتج؟ (إذا تم التأشير = لا يمكن إضافته للسلة) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ended"
            name="ended"
            checked={!product.inStock}
            onChange={handleChange}
          />
          <label htmlFor="ended">هل انتهى المنتج؟</label>
        </div>

        <UploadImage
          name="image"
          id="image"
          uploaded={image}
          setImage={setImage}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="add-product-InputCSS"
            value={product.description}
            placeholder="اكتب وصف المنتج"
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isLoading}>
            {isLoading ? 'جاري الإضافة...' : 'أضف منتج'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
