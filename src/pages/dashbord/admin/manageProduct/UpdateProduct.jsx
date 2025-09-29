// ========================= UpdateProduct.jsx =========================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchProductByIdQuery, useUpdateProductMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
// مهم: كمبوننت التعديل (يعرض/يحذف صور حالية + يرفع صور جديدة)
import UploadImage from '../manageProduct/UploadImag';

// ==================== ثوابت المنتجات والأوزان ====================
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

// خريطة أوزان/سعات لكل منتج (مل)
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

const weightOptionsFor = (categoryValue) => {
  const nums = WEIGHTS_MAP[categoryValue] || [];
  return nums.map((n) => ({ label: `${n} مل`, value: String(n) }));
};

// ==================== الكمبوننت ====================
const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: productData, isLoading: isFetching, error: fetchError } = useFetchProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [product, setProduct] = useState({
    name: '',
    category: '',
    size: '',        // سعة/وزن بالمل
    price: '',
    oldPrice: '',
    description: '',
    image: [],
    inStock: true,   // متوفر افتراضياً
  });

  // الصور الجديدة (Files)
  const [newImages, setNewImages] = useState([]);
  // الصور المُبقاة من الحالية (روابط)
  const [keepImages, setKeepImages] = useState([]);

  // خيارات الوزن حسب الصنف
  const weightOptions = useMemo(
    () => [{ label: 'اختر الحجم', value: '' }, ...weightOptionsFor(product.category)],
    [product.category]
  );

  useEffect(() => {
    if (!productData) return;

    // بعض الـ APIs ترجع { product, reviews }
    const p = productData.product ? productData.product : productData;

    const currentImages = Array.isArray(p?.image) ? p.image : p?.image ? [p.image] : [];

    setProduct({
      name: p?.name || '',
      category: p?.category || '',
      size: p?.size != null ? String(p.size) : '', // إلى نص للـ <SelectInput>
      price: p?.price != null ? String(p.price) : '',
      oldPrice: p?.oldPrice != null ? String(p.oldPrice) : '',
      description: p?.description || '',
      image: currentImages,
      inStock: typeof p?.inStock === 'boolean' ? p.inStock : true,
    });

    setKeepImages(currentImages);
  }, [productData]);

  // عند تغيير الصنف: نفرّغ الحجم ليعيد المستخدم اختياره حسب الخيارات الصحيحة
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => {
      if (name === 'category') return { ...prev, category: value, size: '' };
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تحقق الحقول المطلوبة
    const required = {
      'اسم المنتج': product.name,
      'صنف المنتج': product.category,
      'الحجم': product.size,            // كل منتج به وزن/سعة
      'السعر': product.price,
      'الوصف': product.description,
    };

    const missing = Object.entries(required)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    if (missing.length) {
      alert(`الرجاء ملء الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('category', product.category);
      formData.append('price', product.price);                 // يُحوّل في السيرفر إلى Number
      formData.append('oldPrice', product.oldPrice || '');
      formData.append('description', product.description);
      formData.append('size', product.size);                   // يُحوّل في السيرفر إلى Number
      formData.append('author', user?._id || '');
      formData.append('inStock', String(product.inStock));     // 'true' أو 'false'

      // الصور المُبقاة من الحالية
      formData.append('keepImages', JSON.stringify(keepImages || []));

      // الصور الجديدة (Files)
      if (Array.isArray(newImages) && newImages.length > 0) {
        newImages.forEach((file) => formData.append('image', file));
      }

      await updateProduct({ id, body: formData }).unwrap();
      alert('تم تحديث المنتج بنجاح');
      navigate('/dashboard/manage-products');
    } catch (error) {
      alert('حدث خطأ أثناء تحديث المنتج: ' + (error?.data?.message || error?.message || 'خطأ غير معروف'));
    }
  };

  if (isFetching) return <div className="text-center py-8">جاري تحميل بيانات المنتج...</div>;
  if (fetchError) return <div className="text-center py-8 text-red-500">خطأ في تحميل بيانات المنتج</div>;

  return (
    <div className="container mx-auto mt-8 px-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-right">تحديث المنتج</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="أكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
          required
        />

        <SelectInput
          label="الحجم / السعة"
          name="size"
          value={product.size}
          onChange={handleChange}
          options={weightOptions}
          required
        />

        <TextInput
          label="السعر الحالي"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
          required
          min="0"
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

        {/* كمبوننت التعديل: يعرض صور حالية + يحذف + يجمع ملفات جديدة */}
        <UploadImage
          name="image"
          id="image"
          initialImages={product.image}   // صور حالية (روابط)
          setImages={setNewImages}        // ملفات جديدة
          setKeepImages={setKeepImages}   // الصور المُبقاة
        />

        <div className="text-right">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={product.description}
            placeholder="أكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        {/* حالة التوفر */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="available"
              checked={product.inStock === true}
              onChange={() => setProduct((prev) => ({ ...prev, inStock: true }))}
            />
            <span>المنتج متوفر</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="ended"
              checked={product.inStock === false}
              onChange={() => setProduct((prev) => ({ ...prev, inStock: false }))}
            />
            <span>انتهى المنتج</span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
