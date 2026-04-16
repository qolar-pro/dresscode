'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Star, Sparkles, ArrowDownRight, Tag, Shirt, Footprints, Sun, Wind, Briefcase, Gem } from 'lucide-react';
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
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  // Fetch featured products from database
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const featured = data.products
            .filter((p: any) => p.is_featured)
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              category: p.category,
              isNew: p.is_new,
              image: p.images?.[0] || '',
            }));

          // If no featured products in DB, fallback to newest
          if (featured.length === 0) {
            const newest = data.products
              .filter((p: any) => p.is_new)
              .slice(0, 4)
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                isNew: p.is_new,
                image: p.images?.[0] || '',
              }));
            setFeaturedProducts(newest);
          } else {
            setFeaturedProducts(featured);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch featured products:', error);
      }
    }
    fetchFeatured();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus('idle'), 5000);
      } else {
        setNewsletterStatus('error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
    }
  };

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
                  <p className="text-2xl font-display text-charcoal-900 dark:text-pearl-50">€89</p>
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
                    {t('home.activeSales')}
                  </span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-charcoal-900 dark:text-pearl-50">
                  {t('home.dontMissOut')}
                </h2>
              </div>
              <Link href="/shop" className="btn-luxury mt-4 md:mt-0 text-sm">
                {t('home.shopAllSales')} →
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
                        {(collection.product_ids || []).length} {t('home.productsIncluded')}
                      </span>
                      <span className="text-xs tracking-[0.15em] uppercase text-red-500 font-medium group-hover:translate-x-1 transition-transform duration-300">
                        {t('home.shopNow')} →
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
                <Shirt className="w-10 h-10 mb-3 text-rose-500 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.tops')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">38 {t('home.items')}</p>
              </div>
            </Link>

            {/* Small Card - Pants */}
            <Link href="/shop?category=pants" className="bento-card-small group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <Wind className="w-10 h-10 mb-3 text-neutral-500 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.pants')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">32 {t('home.items')}</p>
              </div>
            </Link>

            {/* Small Card - Skirts */}
            <Link href="/shop?category=skirts" className="bento-card-small group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <Sun className="w-10 h-10 mb-3 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.skirts')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">28 {t('home.items')}</p>
              </div>
            </Link>

            {/* Small Card - Accessories */}
            <Link href="/shop?category=accessories" className="bento-card-small group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <Gem className="w-10 h-10 mb-3 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-lg font-display text-charcoal-900 dark:text-pearl-50 font-light">
                  {t('home.accessories')}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">33 {t('home.items')}</p>
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
                <p className="text-xs tracking-[0.3em] uppercase text-pearl-50/70 mb-2">24 {t('home.items')}</p>
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
            {featuredProducts.length === 0 ? (
              // Loading skeletons
              [...Array(4)].map((_, i) => (
                <div key={i} className="group animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-200 dark:bg-charcoal-700 mb-6 rounded-sm" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-neutral-200 dark:bg-charcoal-700" />
                    <div className="h-4 w-32 bg-neutral-200 dark:bg-charcoal-700" />
                    <div className="h-4 w-12 bg-neutral-200 dark:bg-charcoal-700" />
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] bg-neutral-100 dark:bg-charcoal-700 relative overflow-hidden mb-6 rounded-sm">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 dark:bg-charcoal-700" />
                    )}
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
                    <p className="font-light text-charcoal-900 dark:text-pearl-50">€{product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))
            )}
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
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder={t('home.emailPlaceholder')}
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                setNewsletterStatus('idle');
              }}
              className="input-luxury flex-1"
              required
            />
            <button type="submit" className="btn-luxury whitespace-nowrap">
              {t('home.subscribe')}
            </button>
          </form>
          {newsletterStatus === 'success' && (
            <p className="mt-4 text-green-600 dark:text-green-400 text-sm">
              ✓ Thanks for subscribing! Check your inbox for a confirmation.
            </p>
          )}
          {newsletterStatus === 'error' && (
            <p className="mt-4 text-red-600 dark:text-red-400 text-sm">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
