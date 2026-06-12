import { createApi } from '@reduxjs/toolkit/query/react';
import { MOCK_PRODUCTS, filterProducts } from '@/lib/mockData';

// Local data query — no network calls
const localBaseQuery = async (args: unknown) => {
    await new Promise(r => setTimeout(r, 120)); // small delay so loading states show

    if (typeof args === 'string') {
        // GET /products/:id
        const id = args.replace('/products/', '');
        const product = MOCK_PRODUCTS.find(p => p._id === id || p.slug === id);
        if (!product) return { error: { status: 404, data: 'Not found' } };
        return { data: { success: true, data: product } };
    }

    const req = args as {
        url: string; params?: Record<string, unknown>;
        method?: string; body?: unknown;
    };

    // Admin stats
    if (req.url === '/products/admin/stats') {
        return {
            data: {
                success: true,
                data: {
                    total: MOCK_PRODUCTS.length,
                    active: MOCK_PRODUCTS.filter(p => p.status === 'active').length,
                    outOfStock: MOCK_PRODUCTS.filter(p => p.stock === 0).length,
                    featured: MOCK_PRODUCTS.filter(p => p.isFeatured).length,
                    totalRevenue: MOCK_PRODUCTS.reduce((s, p) => s + p.price * p.salesCount, 0),
                },
            },
        };
    }

    // GET single product by id
    if (req.url && req.url.startsWith('/products/') && req.url !== '/products') {
        const id = req.url.replace('/products/', '');
        const product = MOCK_PRODUCTS.find(p => p._id === id || p.slug === id);
        if (!product) return { error: { status: 404, data: 'Not found' } };
        return { data: { success: true, data: product } };
    }

    // GET /products list
    if (!req.method || req.method === 'GET') {
        const p = (req.params || {}) as Record<string, unknown>;
        const result = filterProducts({
            category: p.category as string,
            sort: p.sort as string,
            page: p.page ? Number(p.page) : 1,
            limit: p.limit ? Number(p.limit) : 12,
            minPrice: p.minPrice ? Number(p.minPrice) : undefined,
            maxPrice: p.maxPrice ? Number(p.maxPrice) : undefined,
            search: p.search as string,
            isFeatured: p.isFeatured === true || p.isFeatured === 'true',
            isNewProduct: p.isNewProduct === true || p.isNewProduct === 'true',
        });
        return { data: { success: true, ...result } };
    }

    // Mutations — return success without doing anything
    return { data: { success: true, message: 'Done' } };
};

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: localBaseQuery,
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: (params) => ({ url: '/products', params }),
            providesTags: ['Products'],
        }),
        getProductById: builder.query({
            query: (id) => ({ url: `/products/${id}` }),
            providesTags: (result, error, id) => [{ type: 'Products', id }],
        }),
        getProductStats: builder.query({
            query: () => ({ url: '/products/admin/stats' }),
            providesTags: ['Products'],
        }),
        createProduct: builder.mutation({
            query: (data) => ({ url: '/products', method: 'POST', body: data }),
            invalidatesTags: ['Products'],
        }),
        updateProduct: builder.mutation({
            query: ({ id, data }) => ({ url: `/products/${id}`, method: 'PATCH', body: data }),
            invalidatesTags: ['Products'],
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Products'],
        }),
        updateStock: builder.mutation({
            query: ({ id, quantity }) => ({ url: `/products/${id}/stock`, method: 'PATCH', body: { quantity } }),
            invalidatesTags: ['Products'],
        }),
        bulkUpdateStatus: builder.mutation({
            query: (data) => ({ url: '/products/admin/bulk-status', method: 'PATCH', body: data }),
            invalidatesTags: ['Products'],
        }),
        bulkDelete: builder.mutation({
            query: (data) => ({ url: '/products/admin/bulk-delete', method: 'DELETE', body: data }),
            invalidatesTags: ['Products'],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetProductStatsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUpdateStockMutation,
    useBulkUpdateStatusMutation,
    useBulkDeleteMutation,
} = productApi;
