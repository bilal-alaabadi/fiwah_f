// ========================= src/redux/features/cart/cartSlice.js =========================
import { createSlice } from "@reduxjs/toolkit";

/* ------------------------ أدوات تخزين الحالة محليًا ------------------------ */
const DEFAULTS = {
  products: [],
  selectedItems: 0,
  totalPrice: 0,   // بالعملة الأساسية (ر.ع.)
  shippingFee: 2,  // بالعملة الأساسية (يُعاد احتسابه تلقائياً)
  country: "عُمان",
  giftCard: null,  // { from, to, phone, note }
};

const loadState = () => {
  try {
    const raw = localStorage.getItem("cartState");
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem("cartState", JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save cart state:", err);
  }
};

/* ------------------------ دوال مساعدة ------------------------ */
const trim = (v) => (v ?? "").toString().trim();
const hasGiftValues = (gc) =>
  !!(gc && (trim(gc.from) || trim(gc.to) || trim(gc.phone) || trim(gc.note)));

const makeLineKey = (p) => {
  const id = p?._id || p?.productId || "";
  const m = p?.measurements ? JSON.stringify(p.measurements) : "{}";

  let gift = "{}";
  if (hasGiftValues(p?.giftCard)) {
    const norm = {
      from: trim(p.giftCard.from),
      to: trim(p.giftCard.to),
      phone: trim(p.giftCard.phone),
      note: trim(p.giftCard.note),
    };
    gift = JSON.stringify(norm);
  }

  return `${id}::${m}::${gift}`;
};

// خصم الأزواج للشيلات على مستوى السطر (بالريال)
const lineTotalBase = (product) => {
  const unit = Number(product.price || 0);
  const qty = Number(product.quantity || 0);
  const isShayla =
    product.category === "الشيلات فرنسية" ||
    product.category === "الشيلات سادة";
  const pairs = isShayla ? Math.floor(qty / 2) : 0;
  const pairDiscount = pairs * 1;
  const subtotal = unit * qty;
  return Math.max(0, subtotal - pairDiscount);
};

const calcSelectedItems = (state) =>
  state.products.reduce((total, product) => total + Number(product.quantity || 0), 0);

const calcTotalPrice = (state) =>
  state.products.reduce((total, product) => total + lineTotalBase(product), 0);

/* ------------------------ منطق الشحن المطلوب ------------------------ */
/*
  ✅ لا زيادة عند 3 منتجات أو أقل. تبدأ الزيادة من المنتج الرابع،
  ثم كل 3 منتجات إضافية تضيف +4 ر.ع (4–6 => +4, 7–9 => +8, ...)

  - عُمان: 2 ر.ع ثابت.
  - الإمارات: 4 ر.ع ثابت.
  - دول الخليج: 5 ر.ع لأول 3 منتجات، ثم +4 ر.ع لكل 3 منتجات إضافية.
*/
const computeShippingOMR = (country, totalItems) => {
  const n = Math.max(0, Number(totalItems) || 0);

  const isOman = country === "عُمان" || country === "عمان";
  if (isOman) return 2;

  if (country === "الإمارات") {
    return 4; // ثابت
  }

  if (country === "دول الخليج") {
    const base = 5;                 // أول 3 منتجات
    if (n <= 3) return base;        // لا زيادة لأول 3
    const extraItems = n - 3;       // من الرابع فصاعدًا
    const blocks = Math.ceil(extraItems / 3); // كل 3 منتجات = بلوك
    return base + blocks * 4;       // كل بلوك +4 ر.ع
  }

  // افتراضي
  return 2;
};

// إعادة حساب المجاميع + الشحن وحفظ الحالة
const recalcAndSave = (state) => {
  state.selectedItems = calcSelectedItems(state);
  state.totalPrice = calcTotalPrice(state);
  state.shippingFee = computeShippingOMR(state.country, state.selectedItems);
  saveState(state);
};

// helper: أقصى مخزون صالح للعنصر (إن لم يوجد، نعتبره غير محدود)
const getMaxStock = (p) => {
  const s = Number(p?.stock);
  return Number.isFinite(s) && s >= 0 ? s : Infinity;
};

/* ------------------------ الحالة الابتدائية ------------------------ */
const initialState = loadState();
initialState.selectedItems = calcSelectedItems(initialState);
initialState.totalPrice = calcTotalPrice(initialState);
initialState.shippingFee = computeShippingOMR(initialState.country, initialState.selectedItems);

/* ------------------------ الـ Slice ------------------------ */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      const _id = payload._id || payload.productId;
      const quantityToAdd = Math.max(1, Number(payload.quantity || 1));
      const lineKey = makeLineKey(payload);
      const maxStock = getMaxStock(payload);

      const existing = state.products.find(
        (p) => p._id === _id && makeLineKey(p) === lineKey
      );

      if (existing) {
        const currentQty = Number(existing.quantity || 0);
        const allowedToAdd = Math.max(0, (maxStock === Infinity ? Infinity : maxStock - currentQty));
        const addQty = Math.min(quantityToAdd, allowedToAdd);
        if (addQty > 0) {
          existing.quantity = currentQty + addQty;
        }
        // إذا allowedToAdd = 0 لا نزيد شيئًا
      } else {
        // إدراج أولي لا يتجاوز المخزون
        const initialQty = maxStock === Infinity
          ? quantityToAdd
          : Math.min(quantityToAdd, Math.max(0, maxStock));
        if (initialQty > 0) {
          state.products.push({
            ...payload,
            _id,
            quantity: initialQty,
          });
        }
      }

      recalcAndSave(state);
    },

    updateQuantity: (state, action) => {
      const { id, type, lineKey } = action.payload;
      const product = state.products.find((p) => {
        if (lineKey) return makeLineKey(p) === lineKey;
        return p._id === id;
      });

      if (product) {
        const maxStock = getMaxStock(product);
        if (type === "increment") {
          // لا نتجاوز المخزون
          if (Number(product.quantity || 0) < maxStock) {
            product.quantity += 1;
          }
        } else if (type === "decrement" && product.quantity > 1) {
          product.quantity -= 1;
        }
      }

      recalcAndSave(state);
    },

    removeFromCart: (state, action) => {
      let id, lineKey;
      if (typeof action.payload === "string") {
        id = action.payload;
      } else {
        id = action.payload?.id;
        lineKey = action.payload?.lineKey;
      }

      state.products = state.products.filter((p) => {
        if (lineKey) return makeLineKey(p) !== lineKey;
        return p._id !== id;
      });

      recalcAndSave(state);
    },

    clearCart: (state) => {
      state.products = [];
      state.selectedItems = 0;
      state.totalPrice = 0;
      state.giftCard = null;
      state.shippingFee = computeShippingOMR(state.country, 0);
      saveState(state);
    },

    // تغيير الدولة يعيد حساب الشحن وفق السياسة الجديدة
    setCountry: (state, action) => {
      state.country = action.payload;
      state.shippingFee = computeShippingOMR(state.country, calcSelectedItems(state));
      saveState(state);
    },

    // تحميل حالة مخصّصة (لو احتجتها)
    loadCart: (state, action) => {
      const merged = { ...DEFAULTS, ...(action.payload || {}) };
      merged.selectedItems = calcSelectedItems(merged);
      merged.totalPrice = calcTotalPrice(merged);
      merged.shippingFee = computeShippingOMR(merged.country, merged.selectedItems);
      saveState(merged);
      return merged;
    },

    /* ------------------------ بطاقة الهدية على مستوى الطلب ------------------------ */
    setGiftCard: (state, action) => {
      const { from = "", to = "", phone = "", note = "" } = action.payload || {};
      const allEmpty = [from, to, phone, note].every((v) => !String(v || "").trim());
      state.giftCard = allEmpty ? null : { from, to, phone, note };
      saveState(state);
    },

    clearGiftCard: (state) => {
      state.giftCard = null;
      saveState(state);
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCountry,
  loadCart,
  setGiftCard,
  clearGiftCard,
} = cartSlice.actions;

export default cartSlice.reducer;
