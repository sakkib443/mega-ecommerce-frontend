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
        mrp: p.originalPrice, rating: p.rating || 0, reviews: p.reviewCount || 0,
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
                                <div key={i} className="h-4 bg-gray-200 rounded-md animate-pulse" style={{ width: `${w}%` }} />
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

    /* ─── Derived values (correct field names for this backend) ─── */
    const images: string[] = product.images?.length ? product.images : [product.thumbnail];
    const mrp: number = product.originalPrice || 0;
    const price: number = product.price || 0;
    const discountPct: number = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
    const savings: number = mrp > price ? mrp - price : 0;
    const isInStock: boolean = (product.stock || 0) > 0;
    const isLowStock: boolean = isInStock && (product.stock || 0) <= 10;
    const categoryName: string = product.category?.name || '';
    const categoryId2: string = product.category?._id || '';
    const ratingValue: number = product.rating || 0;
    const shortDesc: string = product.tagline || '';
    const longDesc: string = product.description || '';
    const colors: string[] = product.colors || [];
    const sizes: string[] = product.sizes || [];
    const tags: string[] = product.tags || [];
    const totalSold: number = product.totalSold || product.soldCount || 0;

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: product._id, name: product.name, price,
            mrp: mrp || price,
            image: product.thumbnail, category: categoryName,
        }));
    };
    const handleAddToWishlist = () => {
        dispatch(addToWishlist({
            id: product._id, name: product.name, price,
            mrp: mrp || price,
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

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-md border border-gray-100 shadow-sm p-6 lg:p-10">
                    <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-start">

                        {/* ══ LEFT: Image Gallery ══ */}
                        <div className="w-full lg:w-[48%] flex flex-col-reverse md:flex-row gap-3 lg:sticky lg:top-24">
                            {/* Thumbnails */}
                            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[480px] flex-shrink-0">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-14 h-14 md:w-[72px] md:h-[72px] flex-shrink-0 border-2 rounded-md overflow-hidden transition-all ${selectedImage === idx ? 'border-[#00B207] shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt={`view ${idx + 1}`} className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=200'; }} />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1 relative border border-gray-100 rounded-md overflow-hidden bg-white aspect-square flex items-center justify-center min-h-[340px] md:min-h-[440px]">
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
                                    className="w-full h-full object-contain p-4 transition-all duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800'; }}
                                />
                            </div>
                        </div>

                        {/* ══ RIGHT: Product Info ══ */}
                        <div className="flex-1 flex flex-col gap-5 min-w-0">

                            {/* Category badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {categoryName && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00B207] bg-[#EDF2EE] px-2.5 py-1 rounded-md">
                                        {categoryName}
                                    </span>
                                )}
                                {product.priceType === 'negotiable' && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                                        Negotiable
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                            {/* Tagline */}
                            {shortDesc && (
                                <p className="text-gray-500 text-sm italic">"{shortDesc}"</p>
                            )}

                            {/* Rating + Meta */}
                            <div className="flex items-center gap-4 flex-wrap text-sm">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} size={13} className={i < Math.floor(ratingValue) ? 'text-[#FF8A00]' : 'text-gray-200'} />
                                        ))}
                                    </div>
                                    <span className="font-bold text-gray-700">{ratingValue.toFixed(1)}</span>
                                    <span className="text-gray-400">({product.reviewCount || 0} reviews)</span>
                                </div>
                                {totalSold > 0 && (
                                    <>
                                        <span className="text-gray-200">|</span>
                                        <span className="text-gray-400">{totalSold} sold</span>
                                    </>
                                )}
                                {product.sku && (
                                    <>
                                        <span className="text-gray-200">|</span>
                                        <span className="text-gray-400">SKU: <span className="text-gray-600 font-medium">{product.sku}</span></span>
                                    </>
                                )}
                            </div>

                            {/* Price Block */}
                            <div className="bg-gray-50 border border-gray-100 rounded-md p-4">
                                <div className="flex items-end gap-3 flex-wrap mb-2">
                                    <span className="text-3xl font-black text-gray-900">৳{price.toLocaleString()}</span>
                                    {mrp > price && (
                                        <span className="text-lg text-gray-400 line-through font-medium mb-0.5">৳{mrp.toLocaleString()}</span>
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
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-md ${isInStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {isInStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {isLowStock && (
                                    <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2.5 py-1 rounded-md">
                                        Only {product.stock} left!
                                    </span>
                                )}
                            </div>

                            {/* Colors */}
                            {colors.length > 0 && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Available Colors</p>
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map((color: string, i: number) => (
                                            <span key={i} className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 font-medium hover:border-[#00B207] cursor-pointer transition-all">
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {sizes.length > 0 && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Available Sizes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((size: string, i: number) => (
                                            <span key={i} className="w-10 h-10 border-2 border-gray-200 rounded-md text-sm text-gray-700 font-bold flex items-center justify-center hover:border-[#00B207] hover:text-[#00B207] cursor-pointer transition-all">
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Actions */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <div className="flex items-center border-2 border-gray-200 rounded-md overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FiMinus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-black text-gray-900 text-base border-x-2 border-gray-200 h-12 flex items-center justify-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
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

                            {/* Delivery Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: FiTruck, title: 'Free Delivery', sub: 'Orders over ৳500' },
                                    { icon: FiRefreshCw, title: 'Easy Returns', sub: '7-day return policy' },
                                    { icon: FiShield, title: 'Secure Payment', sub: '100% protected' },
                                    { icon: FiPackage, title: 'Authentic Product', sub: '100% original' },
                                ].map(({ icon: Icon, title, sub }, i) => (
                                    <div key={i} className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-md">
                                        <Icon size={16} className="text-[#00B207] flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">{title}</p>
                                            <p className="text-[10px] text-gray-400">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Meta */}
                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                {categoryName && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-400 font-medium w-24 flex-shrink-0">Category</span>
                                        <Link href={`/shop?category=${categoryId2}`} className="text-[#00B207] hover:underline font-medium">{categoryName}</Link>
                                    </div>
                                )}
                                {product.sku && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-400 font-medium w-24 flex-shrink-0">SKU</span>
                                        <span className="text-gray-700 font-mono">{product.sku}</span>
                                    </div>
                                )}
                                {tags.length > 0 && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-400 font-medium w-24 flex-shrink-0">Tags</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tags.slice(0, 6).map((tag: string, i: number) => (
                                                <span key={i} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Share */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Share</span>
                                <div className="flex gap-2">
                                    {[
                                        { Icon: FaFacebookF, bg: 'bg-[#1877F2]' },
                                        { Icon: FaTwitterIcon, bg: 'bg-[#1DA1F2]' },
                                        { Icon: FaWhatsapp, bg: 'bg-[#25D366]' },
                                        { Icon: FaPinterestP, bg: 'bg-[#E60023]' },
                                        { Icon: FaInstagramIcon, bg: 'bg-[#E1306C]' },
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

                {/* ── Tabs ── */}
                <div className="mt-8 bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === id
                                    ? 'border-[#00B207] text-[#00B207] bg-[#EDF2EE]/30'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 lg:p-10">

                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div className="flex flex-col lg:flex-row gap-12">
                                <div className="flex-1">
                                    {shortDesc && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Overview</h3>
                                            <p className="text-gray-700 text-base leading-relaxed font-medium border-l-4 border-[#00B207] pl-4 py-1">
                                                {shortDesc}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Full Description</h3>
                                        <div className="text-gray-600 text-sm leading-7">
                                            {longDesc.split('\n').filter(Boolean).map((para: string, i: number) => (
                                                <p key={i} className="mb-4">{para}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Care / Delivery Info from backend */}
                                    {product.careInfo && (
                                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-md">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Care Instructions</h4>
                                            <p className="text-sm text-amber-800">{product.careInfo}</p>
                                        </div>
                                    )}
                                    {product.deliveryInfo && (
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-2">Delivery Information</h4>
                                            <p className="text-sm text-blue-800">{product.deliveryInfo}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Side stats */}
                                <div className="lg:w-64 flex-shrink-0 space-y-3">
                                    <div className="border border-gray-100 rounded-md overflow-hidden">
                                        <img
                                            src={images[0] || product.thumbnail}
                                            className="w-full aspect-square object-contain p-4 bg-white"
                                            alt={product.name}
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400'; }}
                                        />
                                    </div>
                                    {[
                                        discountPct > 0 && { label: 'Discount', value: `${discountPct}% OFF`, cls: 'bg-red-50 border-red-100 text-red-700' },
                                        savings > 0 && { label: 'You Save', value: `৳${savings.toLocaleString()}`, cls: 'bg-green-50 border-green-100 text-green-700' },
                                        { label: 'Rating', value: `${ratingValue.toFixed(1)} / 5`, cls: 'bg-amber-50 border-amber-100 text-amber-700' },
                                        totalSold > 0 && { label: 'Total Sold', value: totalSold, cls: 'bg-purple-50 border-purple-100 text-purple-700' },
                                    ].filter(Boolean).map((item: any, i: number) => (
                                        <div key={i} className={`flex items-center justify-between p-3 border rounded-md ${item.cls}`}>
                                            <span className="text-xs font-bold">{item.label}</span>
                                            <span className="text-sm font-black">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Details Tab */}
                        {activeTab === 'details' && (
                            <div className="flex flex-col lg:flex-row gap-12">
                                <div className="flex-1">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">General Information</h3>
                                    <div className="border border-gray-100 rounded-md overflow-hidden mb-8">
                                        {[
                                            { label: 'Product Name', value: product.name },
                                            { label: 'Category', value: categoryName },
                                            { label: 'SKU', value: product.sku },
                                            { label: 'Stock', value: isInStock ? `${product.stock} units available` : 'Out of Stock' },
                                            { label: 'Price Type', value: product.priceType === 'negotiable' ? 'Negotiable' : 'Fixed' },
                                            { label: 'Status', value: product.status === 'active' ? 'Active' : product.status },
                                            { label: 'Total Views', value: product.viewCount || 0 },
                                            { label: 'Total Sold', value: totalSold },
                                        ].filter(r => r.value !== undefined && r.value !== null && r.value !== '').map(({ label, value }, i) => (
                                            <div key={i} className={`flex text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                <span className="w-40 flex-shrink-0 px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">{label}</span>
                                                <span className="flex-1 px-4 py-3 text-gray-800 font-medium">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Colors & Sizes */}
                                    {(colors.length > 0 || sizes.length > 0) && (
                                        <>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Variants</h3>
                                            <div className="border border-gray-100 rounded-md overflow-hidden mb-8">
                                                {colors.length > 0 && (
                                                    <div className="flex text-sm bg-gray-50">
                                                        <span className="w-40 flex-shrink-0 px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">Colors</span>
                                                        <span className="flex-1 px-4 py-3 text-gray-800 font-medium">{colors.join(', ')}</span>
                                                    </div>
                                                )}
                                                {sizes.length > 0 && (
                                                    <div className="flex text-sm bg-white">
                                                        <span className="w-40 flex-shrink-0 px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">Sizes</span>
                                                        <span className="flex-1 px-4 py-3 text-gray-800 font-medium">{sizes.join(', ')}</span>
                                                    </div>
                                                )}
                                                {tags.length > 0 && (
                                                    <div className="flex text-sm bg-gray-50">
                                                        <span className="w-40 flex-shrink-0 px-4 py-3 font-semibold text-gray-500 border-r border-gray-100">Tags</span>
                                                        <span className="flex-1 px-4 py-3 text-gray-800 font-medium">{tags.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Payment Info */}
                                    {product.paymentInfo && (
                                        <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-green-700 mb-2">Payment Information</h4>
                                            <p className="text-sm text-green-800">{product.paymentInfo}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Side */}
                                <div className="lg:w-72 flex-shrink-0 space-y-3">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">Shipping & Returns</h3>
                                    {[
                                        { icon: FiTruck, title: 'Free Delivery', desc: 'On orders over ৳500. Standard delivery 3-5 days.' },
                                        { icon: FiRefreshCw, title: '7-Day Returns', desc: 'Easy return. Item must be unused and in original packaging.' },
                                        { icon: FiShield, title: 'Secure Payment', desc: 'All transactions are 100% secure and encrypted.' },
                                        { icon: FiPackage, title: 'Safe Packaging', desc: 'Securely packed to ensure safe delivery.' },
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

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="lg:w-64 flex-shrink-0">
                                    <div className="border border-gray-100 rounded-md p-6 text-center bg-gray-50">
                                        <p className="text-5xl font-black text-gray-900">{ratingValue.toFixed(1)}</p>
                                        <div className="flex justify-center gap-1 my-2">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={16} className={i < Math.floor(ratingValue) ? 'text-[#FF8A00]' : 'text-gray-200'} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium">Based on {product.reviewCount || 0} reviews</p>
                                        <div className="mt-4 flex justify-between text-xs text-gray-400 font-medium">
                                            <span>👍 {product.likeCount || 0} Likes</span>
                                            <span>💬 {product.commentCount || 0} Comments</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div key={star} className="flex items-center gap-2 text-xs">
                                                <span className="w-4 text-gray-500 font-bold">{star}</span>
                                                <FiStar size={10} className="text-[#FF8A00]" />
                                                <div className="flex-1 h-2 bg-gray-100 rounded-md overflow-hidden">
                                                    <div className="h-full bg-[#FF8A00] rounded-md" style={{ width: star === Math.round(ratingValue) ? '65%' : star > ratingValue ? '8%' : '30%' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-center py-16 border border-dashed border-gray-200 rounded-md">
                                        <FiMessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No written reviews yet</p>
                                        <p className="text-gray-400 text-sm mt-1">Be the first to review this product</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                            <Link href={`/shop?category=${categoryId2}`} className="text-sm font-bold text-[#00B207] hover:underline">View All →</Link>
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
