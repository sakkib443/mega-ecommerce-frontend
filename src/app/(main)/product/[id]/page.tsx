"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    FiHeart, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle,
    FiAlertCircle, FiTruck, FiRefreshCw, FiShield, FiPackage,
    FiTag, FiInfo, FiStar, FiMessageSquare, FiList
} from 'react-icons/fi';
import { FaStar, FaFacebookF, FaTwitter as FaTwitterIcon, FaPinterestP, FaInstagram as FaInstagramIcon, FaWhatsapp } from 'react-icons/fa';
import ProductCard from '@/components/shared/ProductCard';
import { useGetProductByIdQuery, useGetProductsQuery } from '@/redux/api/productApi';
import { useAppDispatch } from '@/redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToWishlist } from '@/redux/slices/wishlistSlice';

const TABS = [
    { id: 'description', label: 'Description', icon: FiInfo },
    { id: 'details', label: 'Product Details', icon: FiList },
    { id: 'reviews', label: 'Reviews', icon: FiMessageSquare },
];

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState(0);

    const { data: productRes, isLoading, isError } = useGetProductByIdQuery(id);
    const product = productRes?.data;

    const categoryId = product?.category?._id || product?.category;
    const { data: relatedRes } = useGetProductsQuery(
        { category: categoryId, limit: 5 },
        { skip: !categoryId }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relatedProducts = (relatedRes?.data || []).filter((p: any) => p._id !== id).slice(0, 4).map((p: any) => ({
        id: p._id, name: p.name, image: p.thumbnail, price: p.price,
        mrp: p.comparePrice, rating: p.rating || 0, reviews: p.reviewCount || 0,
        categoryName: p.category?.name,
    }));

    /* ─── Loading ─── */
    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-6">
                    <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse mb-8" />
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="w-full lg:w-1/2 aspect-square bg-gray-200 rounded-md animate-pulse" />
                        <div className="flex-1 space-y-4">
                            {[80, 48, 32, 64, 96, 48].map((w, i) => (
                                <div key={i} className={`h-4 bg-gray-200 rounded-md animate-pulse`} style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── Error ─── */
    if (isError || !product) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center p-8 border border-gray-100 rounded-md shadow-sm max-w-sm">
                    <FiAlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">The product you are looking for does not exist or has been removed.</p>
                    <Link href="/shop" className="inline-block bg-[#00B207] text-white px-6 py-2.5 rounded-md font-semibold hover:bg-[#009606] transition-all text-sm">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    /* ─── Derived values ─── */
    const images: string[] = product.images?.length ? product.images : [product.thumbnail];
    const discountPct = product.comparePrice && product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;
    const savings = product.comparePrice ? product.comparePrice - product.price : 0;
    const isInStock = !product.trackQuantity || product.quantity > 0 || product.allowBackorder;
    const isLowStock = product.trackQuantity && product.quantity > 0 && product.quantity <= (product.lowStockThreshold || 5);
    const categoryName = product.category?.name || '';
    const categoryId2 = product.category?._id || '';
    const ratingValue = product.rating || 0;

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: product._id, name: product.name, price: product.price,
            mrp: product.comparePrice || product.price,
            image: product.thumbnail, category: categoryName,
        }));
    };
    const handleAddToWishlist = () => {
        dispatch(addToWishlist({
            id: product._id, name: product.name, price: product.price,
            mrp: product.comparePrice || product.price,
            image: product.thumbnail, category: categoryName, rating: ratingValue,
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* ── Breadcrumb ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-3 text-xs text-gray-400 flex items-center gap-1.5 flex-wrap font-medium">
                    <Link href="/" className="hover:text-[#00B207] transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-[#00B207] transition-colors">Shop</Link>
                    {categoryId2 && (
                        <>
                            <span>/</span>
                            <Link href={`/shop?category=${categoryId2}`} className="hover:text-[#00B207] transition-colors">{categoryName}</Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-md border border-gray-100 shadow-sm p-6 lg:p-10">
                    <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

                        {/* ══ LEFT: Image Gallery ══ */}
                        <div className="w-full lg:w-[45%] flex flex-col-reverse md:flex-row gap-4">
                            {/* Thumbnails */}
                            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[520px] pb-1 md:pb-0 flex-shrink-0">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 border-2 rounded-md overflow-hidden transition-all ${selectedImage === idx ? 'border-[#00B207] shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt={`view ${idx + 1}`} className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=200'; }} />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1 relative border border-gray-100 rounded-md overflow-hidden bg-white aspect-square flex items-center justify-center">
                                {discountPct > 0 && (
                                    <span className="absolute top-3 left-3 bg-[#EA4335] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider z-10">
                                        -{discountPct}%
                                    </span>
                                )}
                                {!isInStock && (
                                    <span className="absolute top-3 right-3 bg-gray-700 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider z-10">
                                        Sold Out
                                    </span>
                                )}
                                <img
                                    src={images[selectedImage] || product.thumbnail}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-6 transition-all duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800'; }}
                                />
                            </div>
                        </div>

                        {/* ══ RIGHT: Product Info ══ */}
                        <div className="flex-1 flex flex-col gap-5">

                            {/* Category + Brand badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {categoryName && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00B207] bg-[#EDF2EE] px-2.5 py-1 rounded-md">
                                        {categoryName}
                                    </span>
                                )}
                                {product.brand && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                                        {product.brand}
                                    </span>
                                )}
                                {product.isFeatured && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                            {/* Rating + Meta */}
                            <div className="flex items-center gap-4 flex-wrap text-sm">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} size={13} className={i < Math.floor(ratingValue) ? 'text-[#FF8A00]' : i < ratingValue ? 'text-[#FFB800]' : 'text-gray-200'} />
                                        ))}
                                    </div>
                                    <span className="font-bold text-gray-700">{ratingValue.toFixed(1)}</span>
                                    <span className="text-gray-400">({product.reviewCount || 0} reviews)</span>
                                </div>
                                <span className="text-gray-200">|</span>
                                {product.sku && <span className="text-gray-400">SKU: <span className="text-gray-600 font-medium">{product.sku}</span></span>}
                                <span className="text-gray-200">|</span>
                                {product.salesCount > 0 && <span className="text-gray-400">{product.salesCount} sold</span>}
                            </div>

                            {/* Price Block */}
                            <div className="bg-gray-50 border border-gray-100 rounded-md p-4">
                                <div className="flex items-end gap-3 flex-wrap mb-2">
                                    <span className="text-3xl font-black text-gray-900">৳{product.price.toLocaleString()}</span>
                                    {product.comparePrice && product.comparePrice > product.price && (
                                        <span className="text-lg text-gray-400 line-through font-medium mb-0.5">৳{product.comparePrice.toLocaleString()}</span>
                                    )}
                                    {discountPct > 0 && (
                                        <span className="bg-[#EA4335] text-white text-xs font-black px-2.5 py-1 rounded-md mb-0.5">
                                            {discountPct}% OFF
                                        </span>
                                    )}
                                </div>
                                {savings > 0 && (
                                    <p className="text-[#00B207] text-sm font-semibold flex items-center gap-1.5">
                                        <FiTag size={13} /> You save ৳{savings.toLocaleString()} on this order
                                    </p>
                                )}
                            </div>

                            {/* Availability */}
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-md ${isInStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {isInStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {isLowStock && isInStock && (
                                    <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2.5 py-1 rounded-md">
                                        Only {product.quantity} left!
                                    </span>
                                )}
                                {product.trackQuantity && product.quantity > 0 && !isLowStock && (
                                    <span className="text-gray-400 text-xs">{product.quantity} units available</span>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && (
                                <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-[#00B207] pl-4 bg-[#EDF2EE]/40 py-2 pr-3 rounded-md">
                                    {product.shortDescription}
                                </p>
                            )}

                            {/* Highlights */}
                            {product.highlights?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Key Highlights</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {product.highlights.slice(0, 6).map((item: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <FiCheckCircle size={14} className="text-[#00B207] flex-shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Actions */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <div className="flex items-center border-2 border-gray-200 rounded-md overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                                        className="w-10 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FiMinus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-black text-gray-900 text-base border-x-2 border-gray-200 h-12 flex items-center justify-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.maxOrderQuantity || 99, quantity + 1))}
                                        className="w-10 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FiPlus size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                    className="flex-1 min-w-[160px] h-12 bg-[#00B207] text-white rounded-md flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#009606] transition-all shadow-sm shadow-green-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiShoppingCart size={16} /> Add to Cart
                                </button>

                                <button
                                    onClick={handleAddToWishlist}
                                    className="w-12 h-12 border-2 border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <FiHeart size={18} />
                                </button>
                            </div>

                            {/* Delivery & Guarantees */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-md">
                                    <FiTruck size={18} className="text-[#00B207] flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Free Delivery</p>
                                        <p className="text-[10px] text-gray-400">Orders over ৳500</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-md">
                                    <FiRefreshCw size={18} className="text-[#00B207] flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Easy Returns</p>
                                        <p className="text-[10px] text-gray-400">7-day return policy</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-md">
                                    <FiShield size={18} className="text-[#00B207] flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Secure Payment</p>
                                        <p className="text-[10px] text-gray-400">100% protected</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-md">
                                    <FiPackage size={18} className="text-[#00B207] flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Authentic Product</p>
                                        <p className="text-[10px] text-gray-400">100% original</p>
                                    </div>
                                </div>
                            </div>

                            {/* Product Meta */}
                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                {categoryName && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-400 font-medium w-24 flex-shrink-0">Category</span>
                                        <Link href={`/shop?category=${categoryId2}`} className="text-[#00B207] hover:underline font-medium">{categoryName}</Link>
                                    </div>
                                )}
                                {product.brand && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-400 font-medium w-24 flex-shrink-0">Brand</span>
                                        <span className="text-gray-700 font-medium">{product.brand}</span>
                                    </div>
                                )}
                                {product.sku && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-400 font-medium w-24 flex-shrink-0">SKU</span>
                                        <span className="text-gray-700 font-mono">{product.sku}</span>
                                    </div>
                                )}
                                {product.tags?.length > 0 && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-400 font-medium w-24 flex-shrink-0">Tags</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {product.tags.map((tag: string, i: number) => (
                                                <span key={i} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Share */}
                            <div className="flex items-center gap-3 pt-1">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Share</span>
                                <div className="flex gap-2">
                                    {[
                                        { Icon: FaFacebookF, bg: 'bg-[#1877F2]' },
                                        { Icon: FaTwitterIcon, bg: 'bg-[#1DA1F2]' },
                                        { Icon: FaWhatsapp, bg: 'bg-[#25D366]' },
                                        { Icon: FaPinterestP, bg: 'bg-[#E60023]' },
                                    ].map(({ Icon, bg }, i) => (
                                        <button key={i} className={`w-8 h-8 ${bg} text-white rounded-md flex items-center justify-center hover:opacity-85 transition-opacity`}>
                                            <Icon size={13} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tabs Section ── */}
                <div className="mt-8 bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
                    {/* Tab Header */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === id
                                    ? 'border-[#00B207] text-[#00B207] bg-[#EDF2EE]/30'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 lg:p-10">

                        {/* ── Description Tab ── */}
                        {activeTab === 'description' && (
                            <div className="flex flex-col lg:flex-row gap-12">
                                <div className="flex-1">
                                    {/* Short Description */}
                                    {product.shortDescription && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Overview</h3>
                                            <p className="text-gray-700 text-base leading-relaxed font-medium border-l-4 border-[#00B207] pl-4">
                                                {product.shortDescription}
                                            </p>
                                        </div>
                                    )}

                                    {/* Long Description */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Full Description</h3>
                                        <div className="prose prose-sm max-w-none text-gray-600 leading-7">
                                            {product.description?.split('\n').filter(Boolean).map((para: string, i: number) => (
                                                <p key={i} className="mb-4">{para}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Key Highlights */}
                                    {product.highlights?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Key Features</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {product.highlights.map((item: string, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-md">
                                                        <div className="w-5 h-5 rounded-md bg-[#00B207] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <FiCheckCircle size={11} className="text-white" />
                                                        </div>
                                                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Side Panel */}
                                <div className="lg:w-72 flex-shrink-0 space-y-4">
                                    {/* Product Image */}
                                    <div className="border border-gray-100 rounded-md overflow-hidden aspect-square">
                                        <img
                                            src={images[0] || product.thumbnail}
                                            className="w-full h-full object-contain p-4"
                                            alt={product.name}
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400'; }}
                                        />
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="space-y-2">
                                        {discountPct > 0 && (
                                            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-md">
                                                <span className="text-xs font-bold text-red-700">Discount</span>
                                                <span className="text-sm font-black text-red-600">{discountPct}% OFF</span>
                                            </div>
                                        )}
                                        {savings > 0 && (
                                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-md">
                                                <span className="text-xs font-bold text-green-700">You Save</span>
                                                <span className="text-sm font-black text-green-600">৳{savings.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-md">
                                            <span className="text-xs font-bold text-blue-700">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <FaStar size={12} className="text-amber-400" />
                                                <span className="text-sm font-black text-blue-600">{ratingValue.toFixed(1)}/5</span>
                                            </div>
                                        </div>
                                        {product.salesCount > 0 && (
                                            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-100 rounded-md">
                                                <span className="text-xs font-bold text-purple-700">Total Sold</span>
                                                <span className="text-sm font-black text-purple-600">{product.salesCount}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Product Details Tab ── */}
                        {activeTab === 'details' && (
                            <div className="flex flex-col lg:flex-row gap-12">
                                <div className="flex-1">
                                    {/* General Info Table */}
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">General Information</h3>
                                    <div className="border border-gray-100 rounded-md overflow-hidden mb-8">
                                        {[
                                            { label: 'Product Name', value: product.name },
                                            { label: 'Brand', value: product.brand || '—' },
                                            { label: 'Category', value: categoryName || '—' },
                                            { label: 'SKU', value: product.sku || '—' },
                                            { label: 'Barcode', value: product.barcode || '—' },
                                            { label: 'Availability', value: isInStock ? 'In Stock' : 'Out of Stock' },
                                            { label: 'Min. Order Qty', value: product.minOrderQuantity || 1 },
                                            { label: 'Max. Order Qty', value: product.maxOrderQuantity || '—' },
                                            { label: 'Tax Included', value: product.taxIncluded ? 'Yes' : 'No' },
                                        ].filter(r => r.value && r.value !== '—').map(({ label, value }, i) => (
                                            <div key={i} className={`flex text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                <span className="w-40 flex-shrink-0 px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">{label}</span>
                                                <span className={`flex-1 px-4 py-3 text-gray-800 font-medium ${label === 'Availability' ? (isInStock ? 'text-green-600' : 'text-red-600') : ''}`}>
                                                    {String(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Specifications */}
                                    {product.specifications?.length > 0 && (
                                        <>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Specifications</h3>
                                            <div className="border border-gray-100 rounded-md overflow-hidden mb-8">
                                                {product.specifications.map((spec: any, i: number) => (
                                                    <div key={i} className={`flex text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                        <span className="w-40 flex-shrink-0 px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">{spec.name}</span>
                                                        <span className="flex-1 px-4 py-3 text-gray-800 font-medium">{spec.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Attributes */}
                                    {product.attributes?.length > 0 && (
                                        <>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Attributes</h3>
                                            <div className="border border-gray-100 rounded-md overflow-hidden">
                                                {product.attributes.map((attr: any, i: number) => (
                                                    <div key={i} className={`flex text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                        <span className="w-40 flex-shrink-0 px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">{attr.name}</span>
                                                        <span className="flex-1 px-4 py-3 text-gray-800 font-medium">{attr.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Shipping Info Side Panel */}
                                <div className="lg:w-72 flex-shrink-0 space-y-3">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">Shipping & Returns</h3>
                                    {[
                                        { icon: FiTruck, title: 'Free Delivery', desc: 'On orders over ৳500. Standard delivery 3-5 days.' },
                                        { icon: FiRefreshCw, title: '7-Day Returns', desc: 'Easy return. Item must be unused and in original packaging.' },
                                        { icon: FiShield, title: 'Warranty', desc: product.warranty || 'Manufacturer warranty included where applicable.' },
                                        { icon: FiPackage, title: 'Packaging', desc: 'Securely packed to ensure safe delivery.' },
                                    ].map(({ icon: Icon, title, desc }, i) => (
                                        <div key={i} className="flex gap-3 p-4 border border-gray-100 rounded-md bg-gray-50">
                                            <div className="w-9 h-9 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                                <Icon size={16} className="text-[#00B207]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Reviews Tab ── */}
                        {activeTab === 'reviews' && (
                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Rating Summary */}
                                <div className="lg:w-64 flex-shrink-0">
                                    <div className="border border-gray-100 rounded-md p-6 text-center bg-gray-50">
                                        <p className="text-5xl font-black text-gray-900">{ratingValue.toFixed(1)}</p>
                                        <div className="flex justify-center gap-1 my-2">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={16} className={i < Math.floor(ratingValue) ? 'text-[#FF8A00]' : 'text-gray-200'} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium">Based on {product.reviewCount || 0} reviews</p>
                                    </div>

                                    {/* Rating bars */}
                                    <div className="mt-4 space-y-2">
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div key={star} className="flex items-center gap-2 text-xs">
                                                <span className="w-6 text-gray-500 font-bold text-right">{star}</span>
                                                <FaStar size={10} className="text-[#FF8A00]" />
                                                <div className="flex-1 h-2 bg-gray-100 rounded-md overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#FF8A00] rounded-md transition-all"
                                                        style={{ width: star === Math.round(ratingValue) ? '60%' : star > ratingValue ? '10%' : '35%' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Review List */}
                                <div className="flex-1">
                                    {(product.reviewCount || 0) === 0 ? (
                                        <div className="text-center py-16 border border-dashed border-gray-200 rounded-md">
                                            <FiMessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No reviews yet</p>
                                            <p className="text-gray-400 text-sm mt-1">Be the first to review this product</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm">Reviews coming soon.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Related Products ── */}
                {relatedProducts.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                            <Link href={`/shop?category=${categoryId2}`} className="text-sm font-bold text-[#00B207] hover:underline">
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(relatedProducts as any[]).map((p: any) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
