"use client";

import React from 'react';
import SectionHeading from '@/components/shared/SectionHeading';
import ProductCard from '@/components/shared/ProductCard';
import { useGetProductsQuery } from '@/redux/api/productApi';

const NewProducts: React.FC = () => {
    const { data, isLoading } = useGetProductsQuery({ limit: 6, sort: 'newest' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (data?.data || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        image: p.thumbnail,
        price: p.price,
        mrp: p.comparePrice,
        rating: p.rating || 0,
        reviews: p.reviewCount || 0,
        categoryName: p.category?.name,
    }));

    return (
        <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-20'>
            <div>
                <SectionHeading
                    description="Don't wait. The time will never be just right."
                    heading="Day of "
                    colorHeading="The deal"
                />
            </div>
            <div>
                {isLoading ? (
                    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10'>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className='bg-gray-100 rounded-md aspect-[4/3] animate-pulse' />
                        ))}
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10'>
                        {(products as any[]).map((p: any) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewProducts;
