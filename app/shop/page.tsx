'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { categories, sortOptions, defaultImages } from '@/data/products';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: { name: string; available: boolean }[];
  colors: { name: string; hex: string; available: boolean }[];
  isNew?: boolean;
  isFeatured?: boolean;
  stock?: number;
}

export default function ShopPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Supabase API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const frontendProducts = data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description,
            images: p.images || [],
            sizes: p.sizes || [],
            colors: p.colors || [],
            isNew: p.is_new,
            isFeatured: p.is_featured,
          }));
          setProducts(frontendProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (selectedSort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSort, products]);

  const getCategoryTranslation = (catId: string) => {
    const key = `home.${catId}`;
    return t(key);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Page Header with Background Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
            alt="Shop Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60 dark:from-neutral-950/95 dark:via-neutral-950/80 dark:to-neutral-950/60" />
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-neutral-900 dark:bg-white" />
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-neutral-600 dark:text-neutral-400">{t('shop.collection')}</span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl font-light tracking-tight text-neutral-900 dark:text-white mb-4">{t('shop.title')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-light text-lg">{t('shop.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white'
                }`}
              >
                {cat.id === 'all' ? t('shop.all') : getCategoryTranslation(cat.id)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs tracking-[0.15em] uppercase font-medium focus:outline-none focus:border-neutral-900 dark:focus:border-white bg-transparent dark:bg-neutral-900 text-neutral-900 dark:text-white cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400 mb-8">
          {filteredProducts.length} {filteredProducts.length === 1 ? t('shop.product') : t('shop.products')}
        </p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl tracking-tight text-neutral-900 dark:text-white mb-4">{t('shop.noProducts')}</p>
            <p className="text-neutral-500 dark:text-neutral-400 font-light mb-8">{t('shop.noProductsDesc')}</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSort('newest');
              }}
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              {t('shop.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage();

  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className="aspect-[3/4] bg-neutral-100 dark:bg-charcoal-700 relative overflow-hidden mb-6">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = defaultImages[product.category] || defaultImages.dresses;
            }}
          />
        ) : (
          <img
            src={defaultImages[product.category] || defaultImages.dresses}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {product.isNew && (
          <span className="absolute top-4 left-4 text-[10px] tracking-[0.2em] uppercase font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-3 py-2">
            {t('shop.new')}
          </span>
        )}
        {!product.sizes.some(s => s.available) ? (
          <div className="absolute inset-0 bg-neutral-900/60 dark:bg-white/60 flex items-center justify-center">
            <span className="text-white dark:text-neutral-900 text-xs tracking-[0.2em] uppercase font-medium">{t('shop.soldOut')}</span>
          </div>
        ) : product.stock !== undefined && product.stock <= 0 ? (
          <div className="absolute inset-0 bg-red-900/60 dark:bg-red-900/60 flex items-center justify-center">
            <span className="text-white text-xs tracking-[0.2em] uppercase font-medium">Sold Out</span>
          </div>
        ) : null}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-500" />
      </div>
      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400">{product.category}</p>
        <h3 className="font-medium tracking-wide text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors duration-300">{product.name}</h3>
        <p className="font-light text-neutral-900 dark:text-white">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
