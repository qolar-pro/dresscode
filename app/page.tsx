'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Star, Sparkles, ArrowDownRight, Tag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SalesCollection {
  id: number;
  name: string;
  description: string;
  discount_percentage: number;
  image_url: string;
  product_ids: number[];
  is_active: boolean;
}

export default function Home() {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [salesCollections, setSalesCollections] = useState<SalesCollection[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);

  // Fetch active sales collections
  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch('/api/sales-collections');
        const data = await res.json();
        if (data.collections && Array.isArray(data.collections)) {
          setSalesCollections(data.collections.filter((c: any) => c.is_active));
        }
      } catch (error) {
        console.warn('Failed to fetch sales collections:', error);
      } finally {
        setLoadingSales(false);
      }
    }
    fetchSales();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="overflow-hidden bg-pearl-50 dark:bg-charcoal-900">
      {/* ==================== HERO SECTION - BENTO GRID STYLE ==================== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-pearl-100 via-pearl-50 to-white dark:from-charcoal-900 dark:via-charcoal-950 dark:to-charcoal-900"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          />
          {/* Floating Orbs */}
          <div 
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-luxury-gold/20 to-luxury-champagne/10 rounded-full blur-3xl animate-float"
            style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
          />
          <div 
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-luxury-slate/10 to-charcoal-900/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '3s', transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)` }}
          />
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Main Hero Text - Spans 7 columns */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 animate-fade-in">
                <Sparkles className="w-4 h-4 text-luxury-gold" />
                <span className="text-xs tracking-[0.3em] uppercase text-neutral-600 dark:text-neutral-400">
                  {t('home.newCollection')}
                </span>
              </div>
              
              {/* Main Title - Kinetic Typography */}
              <h1 className="font-display text-7xl md:text-8xl lg:text-9xl font-light tracking-tighter text-charcoal-900 dark:text-pearl-50 animate-kinetic-text">
                DRESS
                <br />
                <span className="font-normal italic">CODE</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-lg font-light animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {t('home.subtitle')}
              </p>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Link href="/shop" className="btn-luxury">
                  {t('home.shopCollection')}
                </Link>
                <Link href="/contact" className="btn-ghost">
                  {t('home.visitStore')}
                </Link>
              </div>
            </div>

            {/* Hero Image - Spans 5 columns */}
            <div className="lg:col-span-5 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80"
                  alt="Luxury Fashion"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/30 to-transparent" />
                {/* Floating Price Tag */}
                <div className="absolute bottom-6 left-6 glass px-4 py-3 rounded-xl">
                  <p className="text-xs tracking-wider uppercase text-neutral-600 dark:text-neutral-400">Starting from</p>
                  <p className="text-2xl font-display text-charcoal-900 dark:text-pearl-50">$89</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDownRight className="w-6 h-6 text-neutral-400" />
        </div>
      </section>

      {/* ==================== MARQUEE SECTION ==================== */}
      <section className="py-8 bg-charcoal-900 dark:bg-pearl-50 overflow-hidden">
        <div className="marquee-track">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-8 whitespace-nowrap">
              <span className="text-2xl md:text-4xl font-display text-pearl-50 dark:text-charcoal-900 font-light tracking-tight">
                DRESS CODE
              </span>
              <span className="text-luxury-gold text-2xl">✦</span>
              <span className="text-2xl md:text-4xl font-display text-pearl-50/50 dark:text-charcoal-900/50 font-light tracking-tight">
                LUXURY FASHION
              </span>
              <span className="text-luxury-gold text-2xl">✦</span>
              <span className="text-2xl md:text-4xl font-display text-pearl-50 dark:text-charcoal-900 font-light tracking-tight">
                NEW COLLECTION 2026
              </span>
              <span className="text-luxury-gold text-2xl">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== SALES COLLECTIONS (Above Categories) ==================== */}
      {salesCollections.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-yellow-950/30">
          <div className="container mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-3 mb-4">
                  <Tag className="w-4 h-4 text-red-500" />
                  <span className="text-xs tracking-[0.3em] uppercase text-red-600 dark:text-red-400 font-semibold">
                    Active Sales
                  </span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-charcoal-900 dark:text-pearl-50">
                  Don't Miss Out
                </h2>
              </div>
              <Link href="/shop" className="btn-luxury mt-4 md:mt-0 text-sm">
                Shop All Sales →
              </Link>
            </div>

            {/* Sales Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/shop?sale=${collection.id}`}
                  className="group relative rounded-2xl overflow-hidden bg-white dark:bg-charcoal-800 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Background Image or Gradient */}
                  <div className="aspect-video relative overflow-hidden">
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 dark:from-red-700 dark:to-orange-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4 bg-white dark:bg-charcoal-900 rounded-full w-16 h-16 flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-lg font-display font-bold text-red-500">
                        -{collection.discount_percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl text-charcoal-900 dark:text-pearl-50 font-light mb-2">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {(collection.product_ids || []).length} products included
                      </span>
                      <span className="text-xs tracking-[0.15em] uppercase text-red-500 font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== BENTO GRID - CATEGORIES ==================== */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-[1px] bg-charcoal-900 dark:bg-pearl-50" />
                <span className="text-xs tracking-[0.3em] uppercase text-neutral-600 dark:text-neutral-400">
                  {t('home.categories')}
                </span>
              </div>
              <h2 className="section-title text-charcoal-900 dark:text-pearl-50">
                {t('home.browseCollection')}
              </h2>
            </div>
            <Link href="/shop" className="btn-ghost mt-6 md:mt-0">
              {t('home.viewAll')} →
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="bento-grid">
            {/* Large Card - Dresses */}
            <Link href="/shop?category=dresses" className="bento-card-large md:col-span-2 md:row-span-2 group">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
                  alt="Dresses"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-charcoal-900/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-xs tracking-[0.3em] uppercase text-pearl-50/70 mb-2">45 {t('home.pieces').toLowerCase()}</p>
                <h3 className="text-3xl md:text-4xl font-display text-pearl-50 font-light">
                  {t('home.dresses')}
                </h3>
              </div>
            </Link>

            {/* Small Card - Tops */}
            <Link href="/shop?category=tops" className="bento-card-small group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-500">👚</span>
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.tops')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">38 items</p>
              </div>
            </Link>

            {/* Small Card - Pants */}
            <Link href="/shop?category=pants" className="bento-card-small group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-500">👖</span>
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.pants')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">32 items</p>
              </div>
            </Link>

            {/* Small Card - Skirts */}
            <Link href="/shop?category=skirts" className="bento-card-small group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-500">👗</span>
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.skirts')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">28 items</p>
              </div>
            </Link>

            {/* Small Card - Accessories */}
            <Link href="/shop?category=accessories" className="bento-card-small group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-500">👜</span>
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.accessories')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">33 items</p>
              </div>
            </Link>

            {/* Medium Card - Outerwear */}
            <Link href="/shop?category=outerwear" className="bento-card md:col-span-2 group">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80"
                  alt="Outerwear"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs tracking-[0.3em] uppercase text-pearl-50/70 mb-2">24 items</p>
                <h3 className="text-2xl font-display text-pearl-50 font-light">
                  {t('home.outerwear')}
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== EDITORIAL SECTION WITH PARALLAX ==================== */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1 space-y-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-[1px] bg-charcoal-900 dark:bg-pearl-50" />
                <span className="text-xs tracking-[0.3em] uppercase text-neutral-600 dark:text-neutral-400">
                  {t('home.theEdit')}
                </span>
              </div>
              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-charcoal-900 dark:text-pearl-50">
                {t('home.timelessElegance')}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg font-light max-w-md">
                {t('home.timelessDesc')}
              </p>
              <Link href="/shop" className="btn-luxury inline-flex items-center gap-3">
                {t('home.discoverMore')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Editorial Image with Parallax */}
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                  alt="Editorial Fashion"
                  className="w-full h-full object-cover"
                  style={{ transform: `translateY(${(scrollY - 1000) * 0.1}px)` }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl animate-float">
                <p className="text-xs tracking-[0.2em] uppercase text-neutral-600 dark:text-neutral-400 mb-1">Since 2020</p>
                <p className="text-2xl font-display text-charcoal-900 dark:text-pearl-50">500+</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Happy Clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      <section className="py-24 px-4 bg-white dark:bg-charcoal-800/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-charcoal-900 dark:bg-pearl-50" />
              <span className="text-xs tracking-[0.3em] uppercase text-neutral-600 dark:text-neutral-400">
                {t('home.featured')}
              </span>
              <div className="w-8 h-[1px] bg-charcoal-900 dark:bg-pearl-50" />
            </div>
            <h2 className="section-title text-charcoal-900 dark:text-pearl-50">
              {t('home.featuredSelection')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <Link 
                key={product.id} 
                href={`/product/${product.id}`} 
                className="group"
              >
                <div className="aspect-[3/4] bg-neutral-100 dark:bg-charcoal-700 relative overflow-hidden mb-6 rounded-sm">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {product.isNew && (
                    <span className="absolute top-4 left-4 text-[10px] tracking-[0.2em] uppercase font-medium bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-pearl-50 px-3 py-2">
                      {t('common.new')}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400">
                    {product.category}
                  </p>
                  <h3 className="font-medium tracking-wide text-charcoal-900 dark:text-pearl-50 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="font-light text-charcoal-900 dark:text-pearl-50">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIAL SECTION ==================== */}
      <section className="py-32 px-4 bg-charcoal-900 dark:bg-charcoal-950 text-pearl-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="flex justify-center mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-luxury-gold text-luxury-gold" />
            ))}
          </div>
          <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed mb-8">
            {t('home.testimonial')}
          </blockquote>
          <div className="text-sm tracking-[0.2em] uppercase text-neutral-400">
            {t('home.testimonialAuthor')}
          </div>
        </div>
      </section>

      {/* ==================== NEWSLETTER SECTION ==================== */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-5 dark:opacity-3"
            loading="lazy"
          />
        </div>

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6 text-charcoal-900 dark:text-pearl-50">
            {t('home.stayConnected')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12 font-light text-lg">
            {t('home.newsletterDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder={t('home.emailPlaceholder')}
              className="input-luxury flex-1"
            />
            <button className="btn-luxury whitespace-nowrap">
              {t('home.subscribe')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Featured Products Data
const featuredProducts = [
  {
    id: 1,
    name: "Floral Summer Dress",
    price: 89.99,
    category: "dresses",
    isNew: true,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
  },
  {
    id: 2,
    name: "Classic Black Blazer",
    price: 129.99,
    category: "outerwear",
    isNew: false,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
  },
  {
    id: 3,
    name: "Silk Blouse",
    price: 69.99,
    category: "tops",
    isNew: true,
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&q=80",
  },
  {
    id: 4,
    name: "Leather Crossbody Bag",
    price: 119.99,
    category: "accessories",
    isNew: false,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
  },
];
