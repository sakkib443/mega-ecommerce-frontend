"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import { FiFilter, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import { useGetProductsQuery } from '@/redux/api/productApi';

const sortOptions = [
    { label: 'Default Sorting', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Best Rating', value: 'rating' },
    { label: 'Best Selling', value: 'bestselling' },
    { label: 'Name A-Z', value: 'name-asc' },
];

const priceRanges = [
    { label: 'All', min: undefined, max: undefined },
    { label: 'Under ৳500', min: undefined, max: 500 },
    { label: '৳500 - ৳2000', min: 500, max: 2000 },
    { label: '৳2000 - ৳5000', min: 2000, max: 5000 },
    { label: 'Over ৳5000', min: 5000, max: undefined },
];

export default function ShopPage() {
    const [sortBy, setSortBy] = useState('newest');
    const [sortLabel, setSortLabel] = useState('Default Sorting');
    const [selectedPrice, setSelectedPrice] = useState(0);
    const [page, setPage] = useState(1);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const limit = 12;

    const priceFilter = priceRanges[selectedPrice];

    const { data, isLoading } = useGetProductsQuery({
        sort: sortBy,
        page,
        limit,
        minPrice: priceFilter.min,
        maxPrice: priceFilter.max,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (data?.data || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        image: p.thumbnail,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating || 0,
        reviews: p.reviewCount || 0,
        categoryName: p.category?.name,
    }));

    const total = data?.meta?.total || 0;
    const totalPages = data?.meta?.totalPages || 1;
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-100 py-10">
                <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">SHOP</h1>
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-gray-900">Shop</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-12">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-md border border-gray-100 p-8 sticky top-24 shadow-sm">
                            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-50">
                                <FiFilter className="text-[var(--color-primary)]" size={20} />
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">FILTERS</h2>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-5">Price Range</h3>
                                <div className="space-y-3">
                                    {priceRanges.map((range, idx) => (
                                        <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                checked={selectedPrice === idx}
                                                onChange={() => { setSelectedPrice(idx); setPage(1); }}
                                                className="w-4 h-4 border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                            />
                                            <span className="text-sm text-gray-500 font-bold group-hover:text-gray-900 transition-colors">{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-md overflow-hidden relative aspect-[3/4] group">
                                <img
                                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt="Promo"
                                />
                                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                                    <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-2">New Season</p>
                                    <h4 className="text-white text-xl font-black mb-4 leading-tight">SALE UP TO<br />50% OFF</h4>
                                    <button className="bg-white text-gray-900 py-3 rounded-md font-bold text-[10px] hover:bg-[var(--color-primary)] hover:text-white transition-all uppercase tracking-widest">Shop Now</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="bg-white rounded-md border border-gray-100 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                            <p className="text-sm text-gray-500 font-bold tracking-tight whitespace-nowrap">
                                {total > 0
                                    ? <>Showing <span className="text-gray-900 font-black">{from}–{to}</span> of <span className="text-gray-900 font-black">{total}</span> results</>
                                    : 'No products found'
                                }
                            </p>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-initial">
                                    <button
                                        onClick={() => setShowSortMenu(!showSortMenu)}
                                        className="flex items-center justify-between gap-10 w-full px-6 py-2.5 bg-gray-50 rounded-md text-sm font-bold text-gray-700 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100"
                                    >
                                        {sortLabel}
                                        <FiChevronDown />
                                    </button>
                                    {showSortMenu && (
                                        <div className="absolute top-full mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg z-10">
                                            {sortOptions.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setSortBy(opt.value); setSortLabel(opt.label); setPage(1); setShowSortMenu(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-colors"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center border border-gray-100 rounded-md overflow-hidden shrink-0">
                                    <button className="p-2.5 bg-white text-[var(--color-primary)] hover:bg-gray-50 transition-colors border-r border-gray-100">
                                        <FiGrid size={20} />
                                    </button>
                                    <button className="p-2.5 bg-white text-gray-400 hover:bg-gray-50 transition-colors">
                                        <FiList size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className='bg-gray-100 rounded-md aspect-[4/3] animate-pulse' />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {(products as any[]).map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center gap-3">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-11 h-11 rounded-md border flex items-center justify-center font-black text-xs transition-all ${page === i + 1
                                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                            : 'border-gray-200 text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                {page < totalPages && (
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-6 h-11 rounded-md border border-gray-200 flex items-center justify-center font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all"
                                    >
                                        NEXT
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
