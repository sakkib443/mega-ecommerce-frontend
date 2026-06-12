"use client";

import React, { useState } from 'react';
import ProductCard from '../shared/ProductCard';
import { useGetProductsQuery } from '@/redux/api/productApi';

const filters = [
    { id: 'all', label: 'ALL PRODUCTS', params: {} },
    { id: 'new', label: 'NEW ARRIVALS', params: { isNewProduct: true } },
    { id: 'best', label: 'BEST SELLER', params: { sort: 'bestselling' } },
    { id: 'popular', label: 'MOST POPULAR', params: { sort: 'rating' } },
    { id: 'featured', label: 'FEATURED', params: { isFeatured: true } },
];

const PopularProducts: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const currentParams = filters.find(f => f.id === activeFilter)?.params ?? {};
    const { data, isLoading } = useGetProductsQuery({ limit: 10, ...currentParams });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (data?.data || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        image: p.thumbnail,
        price: p.price,
        originalPrice: p.comparePrice,
        rating: p.rating || 0,
        reviews: p.reviewCount || 0,
        categoryName: p.category?.name,
    }));

    return (
        <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-20'>
            <div className='mb-12'>
                <h2 className='text-3xl font-bold text-gray-900 mb-8'>Popular Departments</h2>
                <div className='flex flex-wrap gap-4'>
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-6 py-2.5 text-[13px] font-bold tracking-wider rounded-md transition-all ${activeFilter === filter.id
                                ? 'bg-[var(--color-primary)] text-white shadow-xl shadow-[var(--color-primary)]/20'
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className='bg-gray-100 rounded-md aspect-[4/3] animate-pulse' />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <p className='text-gray-400 text-center py-12'>No products found.</p>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                    {(products as any[]).map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PopularProducts;
