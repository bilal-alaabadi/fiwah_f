// ========================= src/components/admin/addProduct/AddProduct.jsx =========================
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';

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

const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState({
    name: '',
    mainCategory: '',
    category: '',
    weight: '',
    price: '',
    description: '',
    oldPrice: '',
    inStock: true,
    stock: '',
  });

  const [image, setImage] = useState([]);
  const [addProduct, { isLoading }] = useAddProductMutation();
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'ended' && type === 'checkbox') {
      setProduct((prev) => ({ ...prev, inStock: !checked }));
      return;
    }

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
      'أسم المنتج': product.name,
      'الفئة الأساسية': product.mainCategory,
      'الفئة الفرعية': product.category,
      'الحجم': product.weight,
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
        name: product.name,
        mainCategory: product.mainCategory,
        category: product.category,
        description: product.description,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
        image,
        author: user?._id,
        size: Number(product.weight),
        inStock: typeof product.inStock === 'boolean' ? product.inStock : true,
        stock: product.stock !== '' ? Number(product.stock) : undefined,
      }).unwrap();

      alert('تمت إضافة المنتج بنجاح');

      setProduct({
        name: '',
        mainCategory: '',
        category: '',
        weight: '',
        oldPrice: '',
        price: '',
        description: '',
        inStock: true,
        stock: '',
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
          label="الفئة الأساسية"
          name="mainCategory"
          value={product.mainCategory}
          onChange={handleChange}
          options={mainCategories}
        />

        <SelectInput
          label="الفئة الفرعية"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={subCategoryOptions}
        />

        <TextInput
          label="الحجم / السعة"
          name="weight"
          type="number"
          placeholder="مثال: 250"
          value={product.weight}
          onChange={handleChange}
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
          label="السعر"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
          min="0"
          required
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