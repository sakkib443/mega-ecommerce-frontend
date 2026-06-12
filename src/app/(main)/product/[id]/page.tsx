"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle, FiPlay, FiAlertCircle } from 'react-icons/fi';
import { FaStar, FaFacebookF, FaTwitter as FaTwitterIcon, FaPinterestP, FaInstagram as FaInstagramIcon } from 'react-icons/fa';
import ProductCard from '@/components/shared/ProductCard';
import { useGetProductByIdQuery, useGetProductsQuery } from '@/redux/api/productApi';
import { useAppDispatch } from '@/redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToWishlist } from '@/redux/slices/wishlistSlice';

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('descriptions');
    const [selectedImage, setSelectedImage] = useState(0);

    const { data: productRes, isLoading, isError } = useGetProductByIdQuery(id);
    const product = productRes?.data;

    const categoryId = product?.category?._id || product?.category;
    const { data: relatedRes } = useGetProductsQuery(
        { category: categoryId, limit: 4 },
        { skip: !categoryId }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relatedRaw = (relatedRes?.data || []).filter((p: any) => p._id !== id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relatedProducts = relatedRaw.slice(0, 4).map((p: any) => ({
        id: p._id,
        name: p.name,
        image: p.thumbnail,
        price: p.price,
        mrp: p.comparePrice,
        rating: p.rating || 0,
        reviews: p.reviewCount || 0,
        categoryName: p.category?.name,
    }));

    if (isLoading) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#00B207] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading product...</p>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FiAlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
                    <Link href="/shop" className="text-[#00B207] font-medium hover:underline">Back to Shop</Link>
                </div>
            </div>
        );
    }

    const images: string[] = product.images?.length ? product.images : [product.thumbnail];
    const discount = product.comparePrice && product.comparePrice > product.price
        ? `${Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% Off`
        : null;
    const isInStock = !product.trackQuantity || product.quantity > 0 || product.allowBackorder;
    const categoryName = product.category?.name || 'Category';
    const categoryId2 = product.category?._id || '';

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            mrp: product.comparePrice || product.price,
            image: product.thumbnail,
            category: categoryName,
        }));
    };

    const handleAddToWishlist = () => {
        dispatch(addToWishlist({
            id: product._id,
            name: product.name,
            price: product.price,
            mrp: product.comparePrice || product.price,
            image: product.thumbnail,
            category: categoryName,
            rating: product.rating || 0,
        }));
    };

    return (
        <div className="bg-white min-h-screen font-['Poppins']">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4 text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                <Link href="/" className="hover:text-[#00B207]">🏠</Link>
                <span>&gt;</span>
                <Link href="/shop" className="hover:text-[#00B207]">Shop</Link>
                <span>&gt;</span>
                {categoryId2 && (
                    <>
                        <Link href={`/shop?category=${categoryId2}`} className="hover:text-[#00B207]">{categoryName}</Link>
                        <span>&gt;</span>
                    </>
                )}
                <span className="text-[#00B207]">{product.name}</span>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* LEFT: Image Gallery */}
                    <div className="w-full lg:w-1/2 flex gap-4">
                        <div className="hidden md:flex flex-col gap-3">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-20 h-20 border rounded-lg cursor-pointer flex items-center justify-center p-2 transition-all ${selectedImage === idx ? 'border-[#00B207]' : 'border-gray-200'}`}
                                >
                                    <img
                                        src={img}
                                        alt="thumb"
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=200'; }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 border border-gray-100 rounded-xl flex items-center justify-center p-10 bg-white">
                            <img
                                src={images[selectedImage] || product.thumbnail}
                                alt={product.name}
                                className="max-w-full max-h-[500px] object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800'; }}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="w-full lg:w-1/2">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-4xl font-semibold text-gray-900">{product.name}</h1>
                            <span className={`text-xs px-2.5 py-1 rounded font-medium ${isInStock ? 'bg-[#EDF2EE] text-[#00B207]' : 'bg-red-50 text-red-500'}`}>
                                {isInStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} size={14} className={i < Math.floor(product.rating || 0) ? 'text-[#FF8A00]' : 'text-gray-300'} />
                                ))}
                                <span className="text-gray-600 ml-1">{product.reviewCount || 0} Review{(product.reviewCount || 0) !== 1 ? 's' : ''}</span>
                            </div>
                            {product.sku && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <div className="text-gray-900 font-medium">SKU: <span className="text-gray-500 font-normal">{product.sku}</span></div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            {product.comparePrice && product.comparePrice > product.price && (
                                <span className="text-gray-400 line-through text-xl">৳{product.comparePrice.toLocaleString()}</span>
                            )}
                            <span className="text-[#2C742F] text-2xl font-semibold">৳{product.price.toLocaleString()}</span>
                            {discount && (
                                <span className="bg-[#EA43351A] text-[#EA4335] text-xs font-semibold px-2.5 py-1 rounded-full">{discount}</span>
                            )}
                        </div>

                        <div className="border-y border-gray-100 py-6 mb-6 flex items-center justify-between flex-wrap gap-4">
                            {product.brand && (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-900 font-medium">Brand:</span>
                                    <div className="border border-gray-100 rounded px-3 py-1.5">
                                        <span className="text-xs font-bold text-gray-500 italic">{product.brand}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-900 font-medium">Share:</span>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-full bg-[#00B207] text-white flex items-center justify-center hover:opacity-90 transition-all"><FaFacebookF size={14} /></button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><FaTwitterIcon size={14} /></button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><FaPinterestP size={14} /></button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><FaInstagramIcon size={14} /></button>
                                </div>
                            </div>
                        </div>

                        {product.shortDescription && (
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">{product.shortDescription}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                                <button
                                    onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-50 rounded-full"
                                >
                                    <FiMinus />
                                </button>
                                <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-50 rounded-full"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={!isInStock}
                                className="flex-1 bg-[#00B207] text-white rounded-full h-12 flex items-center justify-center gap-3 font-semibold hover:bg-[#009606] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add to Cart <FiShoppingCart />
                            </button>
                            <button
                                onClick={handleAddToWishlist}
                                className="w-12 h-12 rounded-full bg-[#EDF2EE] text-[#00B207] flex items-center justify-center hover:bg-[#00B207] hover:text-white transition-all"
                            >
                                <FiHeart size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex gap-1.5">
                                <span className="text-gray-900 font-medium">Category:</span>
                                <span className="text-gray-500">{categoryName}</span>
                            </div>
                            {product.tags?.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    <span className="text-gray-900 font-medium">Tags:</span>
                                    <span className="text-gray-500">{product.tags.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="mt-20">
                    <div className="flex justify-center border-b border-gray-100 gap-8 md:gap-16">
                        {['Descriptions', 'Additional Information', 'Customer Feedback'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                                className={`pb-4 text-sm md:text-base font-medium transition-all relative ${activeTab === tab.toLowerCase().split(' ')[0] ? 'text-gray-900 border-b-2 border-[#00B207]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="py-12 flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-3/5">
                            {activeTab === 'descriptions' && (
                                <>
                                    <p className="text-gray-500 text-sm leading-7 mb-8">{product.description}</p>
                                    {product.highlights?.length > 0 && (
                                        <ul className="space-y-4">
                                            {product.highlights.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                                    <div className="w-5 h-5 rounded-full bg-[#00B207] flex items-center justify-center text-white flex-shrink-0">
                                                        <FiCheckCircle size={12} />
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                            {activeTab === 'additional' && (
                                <div className="space-y-3">
                                    {product.specifications?.length > 0 ? (
                                        product.specifications.map((spec: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 text-sm border-b border-gray-50 pb-3">
                                                <span className="font-medium text-gray-900 w-40 flex-shrink-0">{spec.name}</span>
                                                <span className="text-gray-500">{spec.value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm">No additional information available.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 'customer' && (
                                <p className="text-gray-400 text-sm">No reviews yet.</p>
                            )}
                        </div>

                        <div className="lg:w-2/5">
                            <div className="relative rounded-2xl overflow-hidden mb-6 h-64 md:h-80">
                                <img
                                    src={images[0] || product.thumbnail}
                                    className="w-full h-full object-cover"
                                    alt={product.name}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800'; }}
                                />
                                {product.video && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <button className="w-16 h-16 rounded-full bg-[#00B207] text-white flex items-center justify-center hover:scale-110 transition-transform">
                                            <FiPlay size={24} className="ml-1" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {discount && (
                                <div className="border border-gray-100 rounded-xl p-5 flex items-center gap-4">
                                    <div className="bg-[#EDF2EE] w-12 h-12 rounded-lg flex items-center justify-center">
                                        <span className="text-[#00B207] text-lg font-bold">{discount.replace(' Off', '')}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">Discount</div>
                                        <div className="text-xs text-gray-500">Save your money</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RELATED PRODUCTS */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 pt-20 border-t border-gray-100">
                        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-12">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {(relatedProducts as any[]).map((p: any) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
