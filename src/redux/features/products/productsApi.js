// ========================= redux/features/products/productsApi.js =========================
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../../utils/baseURL";

const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/products`,
    credentials: "include",
  }),
  tagTypes: ["Product", "ProductList"],
  endpoints: (builder) => ({
    fetchAllProducts: builder.query({
      query: ({
        category,
        gender,
        minPrice,
        maxPrice,
        search,
        sort = "createdAt:desc",
        page = 1,
        limit = 10,
      }) => {
        const params = {
          page: page.toString(),
          limit: limit.toString(),
          sort,
        };

        if (category && category !== "الكل") params.category = category;
        if (gender) params.gender = gender;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (search) params.search = search;

        const queryParams = new URLSearchParams(params).toString();
        return `/?${queryParams}`;
      },
      transformResponse: (response) => ({
        products: response.products,
        totalPages: response.totalPages,
        totalProducts: response.totalProducts,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    fetchProductById: builder.query({
      query: (id) => `/product/${id}`,
      transformResponse: (response) => {
        const p = response?.product ?? response?.data ?? response;

        if (!p || !p._id) {
          throw new Error("المنتج غير موجود");
        }

        const images = Array.isArray(p.image)
          ? p.image
          : p?.image
          ? [p.image]
          : [];

        return {
          _id: p._id,
          name: p.name ?? "",
          category: p.category ?? "",
          size: typeof p.size === "number" || typeof p.size === "string" ? p.size : "",
          price: p.price ?? "",
          oldPrice: p.oldPrice ?? "",
          description: p.description ?? "",
          image: images,
          author: p.author ?? null,
          inStock: typeof p.inStock === "boolean" ? p.inStock : true,
          stock: typeof p.stock === "number" ? p.stock : 0, // ✅ إرجاع الكمية
        };
      },
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    fetchRelatedProducts: builder.query({
      query: (id) => `/related/${id}`,
      providesTags: (result, error, id) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/create-product",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["ProductList"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-product/${id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    searchProducts: builder.query({
      query: (searchTerm) => `/search?q=${searchTerm}`,
      transformResponse: (response) => {
        return (Array.isArray(response) ? response : []).map((product) => ({
          ...product,
          image: Array.isArray(product.image)
            ? product.image
            : product?.image
            ? [product.image]
            : [],
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    fetchBestSellingProducts: builder.query({
      query: (limit = 4) => `/best-selling?limit=${limit}`,
      providesTags: ["ProductList"],
    }),
  }),
});

export const {
  useFetchAllProductsQuery,
  useLazyFetchAllProductsQuery,
  useFetchProductByIdQuery,
  useLazyFetchProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useFetchRelatedProductsQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useFetchBestSellingProductsQuery,
} = productsApi;

export default productsApi;
