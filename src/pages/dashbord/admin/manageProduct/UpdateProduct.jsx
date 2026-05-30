// ========================= src/components/admin/updateProduct/UpdateProduct.jsx =========================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useFetchProductByIdQuery,
  useUpdateProductMutation,
} from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
import UploadImage from '../manageProduct/UploadImag';

const mainCategories = [
  { label: 'أختر الفئة الأساسية', value: '' },
  { label: 'الزيوت العطرية', value: 'الزيوت العطرية' },
  { label: 'المياه العطرية', value: 'المياه العطرية' },
  { label: 'منتجات العناية الشخصية', value: 'منتجات العناية الشخصية' },
];

const subCategoriesMap = {
  'الزيوت العطرية': [
    'زيت اللبان العماني',
    'زيت إكليل الجبل',
    'زيت الريحان',
    'زيت العلعلان',
    'زيت الياس',
    'زيت عشبة الليمون',
    'زيت النعناع',
  ],
  'المياه العطرية': [
    'ماء اللبان العماني',
    'ماء الورد الأحمر',
    'ماء الورد الأبيض',
    'ماء الريحان',
    'ماء الياس',
    'ماء العلعلان',
  ],
  'منتجات العناية الشخصية': [
    'شامبو وسائل استحمام الورد العماني',
    'سائل استحمام اللبان العماني',
    'شامبو الياس',
    'كريم اللبان العماني',
    'واقي الشمس',
    'صابونة الورد العماني',
    'صابونة اللبان العماني',
    'مزيل العرق باللبان العماني',
    'مقشر الورد العماني',
    'مقشر اللبان العماني',
  ],
};

const findMainCategoryBySub = (subCategory) => {
  for (const [main, subs] of Object.entries(subCategoriesMap)) {
    if (subs.includes(subCategory)) return main;
  }
  return '';
};

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    data: productData,
    isLoading: isFetching,
    error: fetchError,
  } = useFetchProductByIdQuery(id);

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [product, setProduct] = useState({
    name: '',
    mainCategory: '',
    category: '',
    weight: '',
    price: '',
    oldPrice: '',
    description: '',
    image: [],
    inStock: true,
    stock: '',
  });

  const [newImages, setNewImages] = useState([]);
  const [keepImages, setKeepImages] = useState([]);

  const subCategoryOptions = useMemo(() => {
    const items = subCategoriesMap[product.mainCategory] || [];

    return [
      { label: 'أختر المنتج', value: '' },
      ...items.map((item) => ({
        label: item,
        value: item,
      })),
    ];
  }, [product.mainCategory]);

  useEffect(() => {
    if (!productData) return;

    const p = productData.product ? productData.product : productData;
    const currentImages = Array.isArray(p?.image)
      ? p.image
      : p?.image
      ? [p.image]
      : [];

    const detectedMainCategory =
      p?.mainCategory || findMainCategoryBySub(p?.category || '');

    setProduct({
      name: p?.name || '',
      mainCategory: detectedMainCategory,
      category: p?.category || '',
      weight: p?.size || p?.weight || '',
      price: p?.price != null ? String(p.price) : '',
      oldPrice: p?.oldPrice != null ? String(p.oldPrice) : '',
      description: p?.description || '',
      image: currentImages,
      inStock: typeof p?.inStock === 'boolean' ? p.inStock : true,
      stock: p?.stock != null ? String(p.stock) : '',
    });

    setKeepImages(currentImages);
  }, [productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => {
      if (name === 'mainCategory') {
        return {
          ...prev,
          mainCategory: value,
          category: '',
        };
      }

      if (name === 'stock') {
        const n = Math.max(0, Math.floor(Number(value || 0)));
        return { ...prev, stock: String(n) };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      'اسم المنتج': product.name,
      'الفئة الأساسية': product.mainCategory,
      'الفئة الفرعية': product.category,
      'الحجم': product.weight,
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
      formData.append('mainCategory', product.mainCategory);
      formData.append('category', product.category);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('oldPrice', product.oldPrice || '');
      formData.append('size', product.weight);
      formData.append('author', user?._id || '');
      formData.append('inStock', String(product.inStock));

      if (product.stock !== '') {
        formData.append('stock', product.stock);
      }

      formData.append('keepImages', JSON.stringify(keepImages || []));

      if (Array.isArray(newImages) && newImages.length > 0) {
        newImages.forEach((file) => formData.append('image', file));
      }

      await updateProduct({ id, body: formData }).unwrap();

      alert('تم تحديث المنتج بنجاح');
      navigate('/dashboard/manage-products');
    } catch (error) {
      console.error('FULL ERROR:', error);
      alert(
        'حدث خطأ أثناء تحديث المنتج: ' +
          (error?.data?.message || error?.message || 'خطأ غير معروف')
      );
    }
  };

  if (isFetching) {
    return <div className="text-center py-8">جاري تحميل بيانات المنتج...</div>;
  }

  if (fetchError) {
    return (
      <div className="text-center py-8 text-red-500">
        خطأ في تحميل بيانات المنتج
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-right">تحديث المنتج</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="اكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="الفئة الأساسية"
          name="mainCategory"
          value={product.mainCategory}
          onChange={handleChange}
          options={mainCategories}
          required
        />

        <SelectInput
          label="الفئة الفرعية"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={subCategoryOptions}
          required
        />

        <TextInput
          label="الحجم / السعة"
          name="weight"
          type="text"
          placeholder="مثال: 250 مل أو 100 جرام"
          value={product.weight}
          onChange={handleChange}
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

        <TextInput
          label="الكمية (المخزون)"
          name="stock"
          type="number"
          placeholder="مثال: 25"
          value={product.stock}
          onChange={handleChange}
          min="0"
          step="1"
        />

        <UploadImage
          name="image"
          id="image"
          initialImages={product.image}
          setImages={setNewImages}
          setKeepImages={setKeepImages}
        />

        <div className="text-right">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            وصف المنتج
          </label>

          <textarea
            name="description"
            id="description"
            className="add-product-InputCSS"
            value={product.description}
            placeholder="اكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="available"
              checked={product.inStock === true}
              onChange={() =>
                setProduct((prev) => ({ ...prev, inStock: true }))
              }
            />
            <span>المنتج متوفر</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="ended"
              checked={product.inStock === false}
              onChange={() =>
                setProduct((prev) => ({ ...prev, inStock: false }))
              }
            />
            <span>انتهى المنتج</span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="add-product-btn disabled:opacity-50"
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