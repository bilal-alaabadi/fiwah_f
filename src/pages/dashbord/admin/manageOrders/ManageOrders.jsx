// ========================= ManageOrders.jsx (نهائي للطباعة D100 صفحة واحدة) =========================
import React, { useState } from 'react';
import { useDeleteOrderMutation, useGetAllOrdersQuery } from '../../../../redux/features/orders/orderApi';
import { formatDate } from '../../../../utils/formateDate';
import html2pdf from 'html2pdf.js';

const DEPOSIT_DEFAULT = 10;

const ManageOrders = () => {
  const { data: orders, error, isLoading, refetch } = useGetAllOrdersQuery();
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteOrder] = useDeleteOrderMutation();

  const handleDeleteOder = async (orderId) => {
    try {
      await deleteOrder(orderId).unwrap();
      alert("تم حذف الطلب بنجاح");
      refetch();
    } catch (error) {
      console.error("فشل حذف الطلب:", error);
    }
  };

  const handlePrintOrder = () => {
    setTimeout(() => window.print(), 100);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('order-details');
    if (!element) return;

    element.classList.add('for-pdf');

    const options = {
      margin: 0,
      filename: `طلب_${viewOrder?._id || 'فاتورة'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 384,
        windowHeight: 576,
      },
      jsPDF: {
        unit: 'mm',
        format: [101.6, 152.4],
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css'],
        before: [],
        after: [],
        avoid: ['.print-section', '.print-modal', 'table', 'tr'],
      },
    };

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .finally(() => {
        element.classList.remove('for-pdf');
      });
  };

  const formatPrice = (price) => {
    const n = Number(price);
    return (isNaN(n) ? 0 : n).toFixed(2);
  };

  const measurementLabels = {
    length: 'الطول',
    sleeveLength: 'طول الكم',
    width: 'العرض',
    design: 'التصميم',
    color: 'اللون',
    buttons: 'الأزرار',
    size: 'الحجم',
  };

  const getProductSize = (product) =>
    (product?.size || product?.selectedSize || product?.measurements?.size || '').toString().trim();

  const getProductColor = (product) =>
    (product?.selectedColor || product?.color || product?.measurements?.color || '').toString().trim();

  const renderMeasurements = (m) => {
    if (!m || typeof m !== 'object') return null;

    const entries = Object.entries(m).filter(([key, value]) => {
      const v = (value ?? '').toString().trim();
      return key !== 'color' && key !== 'size' && v !== '';
    });

    if (entries.length === 0) return null;

    return (
      <div className="measurements-box">
        <p className="font-semibold measurements-title">القياسات / الخيارات</p>
        <div className="measurements-grid">
          {entries.map(([key, value]) => (
            <div key={key} className="measurement-item">
              <span>{measurementLabels[key] || key}</span>: {String(value)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasGiftValues = (gc) => {
    if (!gc || typeof gc !== 'object') return false;
    const v = (x) => (x ?? '').toString().trim();
    return !!(v(gc.from) || v(gc.to) || v(gc.phone) || v(gc.note));
  };

  const renderGiftCard = (gc) => {
    if (!hasGiftValues(gc)) return null;
    return (
      <div className="gift-card-print">
        <div className="font-semibold">بطاقة هدية</div>
        {gc.from && String(gc.from).trim() && <div>من: {gc.from}</div>}
        {gc.to && String(gc.to).trim() && <div>إلى: {gc.to}</div>}
        {gc.phone && String(gc.phone).trim() && <div>رقم المستلم: {gc.phone}</div>}
        {gc.note && String(gc.note).trim() && <div>ملاحظات: {gc.note}</div>}
      </div>
    );
  };

  const isDepositOrder = (order) =>
    !!(order?.depositMode || order?.isDeposit || order?.deposit === true);

  const handleContactWhatsApp = (phone) => {
    if (!phone) {
      alert('رقم الهاتف غير متوفر');
      return;
    }

    const o = viewOrder || {};
    const cleanedPhone = phone.replace(/\D/g, '');
    const isDep = isDepositOrder(o);

    const linesProducts = (o.products || [])
      .map(p => `- ${p.name} (${p.quantity}x ${formatPrice(p.price)} ر.ع)`)
      .join('\n');

    const message = `مرحباً ${o.customerName || 'عميلنا العزيز'},

تفاصيل طلبك رقم: ${o.orderId}
تاريخ الطلب: ${formatDate(o.createdAt)}

المنتجات:
${linesProducts}

${isDep ? 'طريقة الدفع: دفعة مقدم' : `الإجمالي النهائي: ${formatPrice(o.amount || 0)} ر.ع`}

شكراً لثقتكم بنا!`;

    window.open(`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) return <div className="p-4 text-center">جار التحميل...</div>;
  if (error) return <div className="p-4 text-center text-red-500">لا توجد طلبات</div>;

  return (
    <div className="w-full p-2 md:p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-md p-4 w-full">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center md:text-right">
          إدارة الطلبات
        </h2>

        <div className="md:hidden space-y-3">
          {orders?.length > 0 ? (
            orders.map((order, index) => (
              <div key={index} className="border rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      العميل: {order?.customerName || order?.email || 'غير موجود'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">{formatDate(order?.updatedAt)}</p>
                  </div>
                </div>

                {isDepositOrder(order) && (
                  <div className="mt-2">
                    <span className="inline-block text-[10px] px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">
                      دفعة مقدم
                    </span>
                  </div>
                )}

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="text-blue-500 hover:underline text-xs px-2 py-1 border border-blue-200 rounded"
                    onClick={() => setViewOrder(order)}
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    className="text-red-500 hover:underline text-xs px-2 py-1 border border-red-200 rounded"
                    onClick={() => handleDeleteOder(order?._id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">لا توجد طلبات متاحة</div>
          )}
        </div>

        <div className="hidden md:block w-full overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-right w-1/6">رقم الطلب</th>
                <th className="py-3 px-4 border-b text-right w-2/6">العميل</th>
                <th className="py-3 px-4 border-b text-right w-1/6">التاريخ</th>
                <th className="py-3 px-4 border-b text-right w-2/6">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders?.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center gap-2">
                        <span>{order?.orderId || '--'}</span>
                        {isDepositOrder(order) && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                            دفعة مقدم
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {order?.customerName || order?.email || 'غير موجود'}
                    </td>
                    <td className="py-3 px-4 border-b">{formatDate(order?.updatedAt)}</td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex gap-3 justify-end">
                        <button
                          className="text-blue-500 hover:underline text-sm px-3 py-1 border border-blue-200 rounded"
                          onClick={() => setViewOrder(order)}
                        >
                          عرض التفاصيل
                        </button>
                        <button
                          className="text-red-500 hover:underline text-sm px-3 py-1 border border-red-200 rounded"
                          onClick={() => handleDeleteOder(order?._id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    لا توجد طلبات متاحة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {viewOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
            <div
              className="bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto print-modal"
              id="order-details"
              dir="rtl"
            >
<style>
{`
.print-price-total {
  display: none;
}

@media print {
  @page {
    size: 4in 6in;
    margin: 0;
  }

  html,
  body {
    width: 4in !important;
    height: 6in !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body * {
    visibility: hidden !important;
  }

  .print-modal,
  .print-modal * {
    visibility: visible !important;
  }

  .print-modal {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 4in !important;
    height: 6in !important;
    max-width: 4in !important;
    max-height: 6in !important;
    min-height: 6in !important;
    margin: 0 !important;
    padding: 4mm 5mm !important;
    background: #fff !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    text-align: center !important;
    direction: rtl !important;
    zoom: 0.88 !important;
  }

  .print-modal button,
  .print-modal svg,
  .print-modal img,
  .screen-only,
  .print-actions {
    display: none !important;
    visibility: hidden !important;
  }

  /* إخفاء الجدول كامل أثناء الطباعة */
  .print-modal table,
  .print-modal thead,
  .print-modal tbody,
  .print-modal tr,
  .print-modal th,
  .print-modal td,
  .desktop-products,
  .mobile-products,
  .summary-table {
    display: none !important;
    visibility: hidden !important;
  }

  /* إخفاء الأسعار وأي عناصر خاصة بالسعر */
  .price,
  .total,
  .subtotal,
  .shipping,
  .payment,
  .summary-table,
  .order-total,
  .product-price {
    display: none !important;
    visibility: hidden !important;
  }

  .print-modal,
  .print-modal * {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    page-break-before: avoid !important;
    page-break-after: avoid !important;
  }

  .print-header {
    display: block !important;
    text-align: center !important;
    margin: 0 0 3mm 0 !important;
    padding: 0 0 2mm 0 !important;
    border-bottom: 1px solid #ddd !important;
  }

  .invoice-title {
    font-size: 28px !important;
    font-weight: 800 !important;
    line-height: 1.2 !important;
    margin: 0 0 1mm 0 !important;
    text-align: center !important;
  }

  .invoice-meta {
    text-align: center !important;
    font-size: 18px !important;
    line-height: 1.4 !important;
  }

  .invoice-meta p {
    margin: 0.8mm 0 !important;
  }

  .print-modal h3 {
    font-size: 20px !important;
    font-weight: 800 !important;
    margin: 0 0 1mm 0 !important;
    padding: 0 0 1mm 0 !important;
    border-bottom: 1px solid #ddd !important;
    text-align: center !important;
  }

  .print-modal p,
  .print-modal span,
  .print-modal div {
    font-size: 15px !important;
    line-height: 1.35 !important;
    text-align: center !important;
  }

  .print-modal .grid {
    display: block !important;
  }

  .print-modal .mb-6,
  .print-modal .mb-4,
  .print-modal .mb-3,
  .print-modal .mb-2 {
    margin-bottom: 2mm !important;
  }

  .print-modal .bg-gray-50,
  .print-modal .bg-pink-50 {
    background: #fff !important;
  }

  .print-modal .p-4,
  .print-modal .p-3,
  .print-modal .p-6 {
    padding: 1.5mm !important;
  }

  .print-modal .rounded-lg {
    border-radius: 2mm !important;
  }

  .print-modal .space-y-1 > * + * {
    margin-top: 0.5mm !important;
  }

  .print-product-name {
    font-size: 16px !important;
    font-weight: 800 !important;
    text-align: center !important;
  }

  .measurements-box {
    margin-top: 1mm !important;
    padding: 1mm !important;
    background: #fafafa !important;
    border: 1px solid #eee !important;
    border-radius: 1.5mm !important;
    text-align: center !important;
  }

  .measurements-title {
    margin: 0 0 0.5mm 0 !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    text-align: center !important;
  }

  .measurements-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 0.5mm 1mm !important;
  }

  .measurement-item {
    font-size: 13px !important;
    line-height: 1.3 !important;
    text-align: center !important;
  }

  .gift-card-print {
    margin-top: 1mm !important;
    padding: 1mm !important;
    border: 1px solid #f4c2d7 !important;
    background: #fff5f8 !important;
    text-align: center !important;
  }

  .print-price-total {
    display: block !important;
    visibility: visible !important;
    margin-top: 2mm !important;
    padding: 1.5mm !important;
    border: 1px solid #ddd !important;
    border-radius: 1.5mm !important;
    background: #fff !important;
    font-size: 17px !important;
    font-weight: 800 !important;
    text-align: center !important;
  }
}


/* PDF MODE */

.for-pdf {
  width: 4in !important;
  max-width: 4in !important;
  min-height: 6in !important;
  max-height: 6in !important;
  overflow: hidden !important;
  box-shadow: none !important;
  border: none !important;
  padding: 4mm 5mm !important;
  background: #fff !important;
  font-size: 14px !important;
  line-height: 1.35 !important;
  text-align: center !important;
  direction: rtl !important;
  box-sizing: border-box !important;
}

.for-pdf,
.for-pdf * {
  visibility: visible !important;
  text-align: center !important;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

.for-pdf button,
.for-pdf svg,
.for-pdf img,
.for-pdf .screen-only,
.for-pdf .print-actions {
  display: none !important;
}

/* إخفاء الجدول والأسعار في PDF */
.for-pdf table,
.for-pdf thead,
.for-pdf tbody,
.for-pdf tr,
.for-pdf th,
.for-pdf td,
.for-pdf .desktop-products,
.for-pdf .mobile-products,
.for-pdf .summary-table,
.for-pdf .price,
.for-pdf .total,
.for-pdf .subtotal,
.for-pdf .shipping,
.for-pdf .payment,
.for-pdf .order-total,
.for-pdf .product-price {
  display: none !important;
  visibility: hidden !important;
}

.for-pdf .print-header {
  display: block !important;
  text-align: center !important;
  margin-bottom: 3mm !important;
  border-bottom: 1px solid #eee !important;
  padding-bottom: 2mm !important;
}

.for-pdf .print-price-total {
  display: block !important;
  visibility: visible !important;
  margin-top: 2mm !important;
  padding: 1.5mm !important;
  border: 1px solid #ddd !important;
  border-radius: 1.5mm !important;
  background: #fff !important;
  font-size: 17px !important;
  font-weight: 800 !important;
  text-align: center !important;
}
`}
</style>

              <div className="print-header print-section">
                <h1 className="invoice-title">فاتورة الطلب</h1>

                {isDepositOrder(viewOrder) && (
                  <div>
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">
                      دفعة مقدم
                    </span>
                  </div>
                )}

                <div className="invoice-meta">
                  <p><strong>رقم الفاتورة:</strong> #{viewOrder.orderId}</p>
                  <p><strong>تاريخ الفاتورة:</strong> {formatDate(viewOrder.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print-section">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">معلومات العميل</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>الاسم:</strong> {viewOrder.customerName || 'غير محدد'}</p>
                    <p><strong>رقم الهاتف:</strong> {viewOrder.customerPhone || 'غير محدد'}</p>
                    {viewOrder.email && <p><strong>البريد الإلكتروني:</strong> {viewOrder.email}</p>}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">معلومات التوصيل</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>البلد:</strong> {viewOrder.country || 'غير محدد'}</p>
                    <p><strong>الولاية:</strong> {viewOrder.wilayat || 'غير محدد'}</p>
                    <p><strong>ملاحظات:</strong> {viewOrder.description || 'لا توجد ملاحظات'}</p>
                  </div>
                </div>
              </div>

              {viewOrder?.giftCard &&
                (viewOrder.giftCard.from ||
                  viewOrder.giftCard.to ||
                  viewOrder.giftCard.phone ||
                  viewOrder.giftCard.note) && (
                  <div className="bg-pink-50 p-3 rounded-lg mb-6 border border-pink-200 print-section">
                    <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">بيانات بطاقة الهدية</h3>
                    <div className="space-y-1 text-sm">
                      {viewOrder.giftCard.from && <p><strong>من:</strong> {viewOrder.giftCard.from}</p>}
                      {viewOrder.giftCard.to && <p><strong>إلى:</strong> {viewOrder.giftCard.to}</p>}
                      {viewOrder.giftCard.phone && <p><strong>رقم المستلم:</strong> {viewOrder.giftCard.phone}</p>}
                      {viewOrder.giftCard.note && <p><strong>ملاحظات الهدية:</strong> {viewOrder.giftCard.note}</p>}
                    </div>
                  </div>
                )}

              <div className="mb-6 print-section">
                <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">المنتجات المطلوبة</h3>

                <div className="border rounded-lg overflow-hidden">
                  <div className="hidden md:block desktop-products">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-3 text-center w-12">#</th>
                          <th className="py-2 px-3 text-center">المنتج</th>
                          <th className="py-2 px-3 text-center">الكمية</th>
                          <th className="py-2 px-3 text-center">السعر</th>
                          <th className="py-2 px-3 text-center">المجموع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewOrder.products?.map((product, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2 px-3 text-center">{index + 1}</td>
                            <td className="py-2 px-3 text-center">
                              <p className="font-medium text-sm print-product-name">
                                {product.name || 'منتج غير محدد'}
                              </p>

                              {getProductSize(product) && (
                                <p className="text-xs text-gray-500">الحجم: {getProductSize(product)}</p>
                              )}

                              {getProductColor(product) && (
                                <p className="text-xs text-gray-500">اللون: {getProductColor(product)}</p>
                              )}

                              {renderMeasurements(product.measurements)}
                              {renderGiftCard(product.giftCard)}
                            </td>
                            <td className="py-2 px-3 text-center">{product.quantity || 0}</td>
                            <td className="py-2 px-3 text-center">{formatPrice(product.price)} ر.ع</td>
                            <td className="py-2 px-3 text-center font-medium">
                              {formatPrice((product.price || 0) * (product.quantity || 0))} ر.ع
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden mobile-products">
                    {viewOrder.products?.map((product, index) => (
                      <div key={index} className="border-b p-3 last:border-b-0">
                        <p className="font-medium text-sm print-product-name">
                          {index + 1}. {product.name || 'منتج غير محدد'}
                        </p>

                        {getProductSize(product) && (
                          <p className="text-xs text-gray-500">الحجم: {getProductSize(product)}</p>
                        )}

                        {getProductColor(product) && (
                          <p className="text-xs text-gray-500">اللون: {getProductColor(product)}</p>
                        )}

                        {renderMeasurements(product.measurements)}
                        {renderGiftCard(product.giftCard)}

                        <div className="flex justify-between mt-1">
                          <span className="text-xs">الكمية: {product.quantity || 0}</span>
                          <span className="text-xs font-medium">
                            {formatPrice((product.price || 0) * (product.quantity || 0))} ر.ع
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 print-section">
                <h3 className="font-bold text-base md:text-lg mb-3 border-b pb-2">ملخص الفاتورة</h3>

                {(() => {
                  const prods = Array.isArray(viewOrder?.products) ? viewOrder.products : [];
                  const productsSubtotal = prods.reduce(
                    (sum, p) => sum + Number(p?.price || 0) * Number(p?.quantity || 0),
                    0
                  );

                  const discount = Number(viewOrder?.pairDiscount ?? viewOrder?.discount ?? 0);
                  const productTotal = Math.max(0, productsSubtotal - discount);

                  const country = (viewOrder?.country || '').trim();
                  const defaultShipping = country === 'الإمارات' ? 4 : 2;

                  const storedShipping = Number(viewOrder?.shippingFee);
                  const shipping =
                    Number.isFinite(storedShipping) && storedShipping > 0
                      ? storedShipping
                      : defaultShipping;

                  const total = productTotal + shipping;
                  const amount = Number(viewOrder?.amount || 0);
                  const remaining = Math.max(0, total - amount);
                  const isDeposit = !!(viewOrder?.depositMode || viewOrder?.isDeposit);
                  const productTitle = prods.length === 1 ? (prods[0]?.name || 'منتج') : 'متعدد';

                  return (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border summary-table">
                        <thead className="bg-white">
                          <tr>
                            <th className="border px-3 py-2 text-center">المنتج</th>
                            <th className="border px-3 py-2 text-center">سعر المنتج</th>
                            <th className="border px-3 py-2 text-center">التوصيل</th>
                            <th className="border px-3 py-2 text-center">الإجمالي</th>
                            <th className="border px-3 py-2 text-center">المدفوع</th>
                            <th className="border px-3 py-2 text-center">المتبقي</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={isDeposit ? 'bg-amber-50' : ''}>
                            <td className="border px-3 py-2">{productTitle}</td>
                            <td className="border px-3 py-2">{formatPrice(productTotal)} ر.ع</td>
                            <td className="border px-3 py-2">{formatPrice(shipping)} ر.ع</td>
                            <td className="border px-3 py-2">{formatPrice(total)} ر.ع</td>
                            <td className="border px-3 py-2">{formatPrice(amount)} ر.ع</td>
                            <td className="border px-3 py-2">{formatPrice(remaining)} ر.ع</td>
                          </tr>
                        </tbody>
                      </table>

                      {isDeposit && (
                        <p className="mt-2 text-xs text-gray-600">
                          * دفعة المقدم تُحتسب ضمن الإجمالي.
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-3">
                        <span>حالة الطلب:</span>
                        <span>{viewOrder?.status || '—'}</span>
                      </div>

                      <div className="print-price-total">
                        مجموع السعر: {formatPrice(total)} ر.ع
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-wrap gap-2 justify-end print-actions">
                <button
                  className="bg-gray-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-gray-600 text-xs md:text-sm flex items-center gap-1"
                  onClick={() => setViewOrder(null)}
                >
                  إغلاق
                </button>

                <button
                  className="bg-blue-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-blue-600 text-xs md:text-sm flex items-center gap-1"
                  onClick={handlePrintOrder}
                >
                  طباعة
                </button>

                <button
                  className="bg-green-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-green-600 text-xs md:text-sm flex items-center gap-1"
                  onClick={() => handleContactWhatsApp(viewOrder?.customerPhone)}
                >
                  تواصل واتساب
                </button>

                <button
                  className="bg-emerald-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-emerald-700 text-xs md:text-sm flex items-center gap-1"
                  onClick={handleDownloadPDF}
                >
                  تحميل PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;