'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { categories, sortOptions, defaultImages } from '@/data/products';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: { name: string; available: boolean; stock?: number }[];
  colors: { name: string; hex: string; available: boolean }[];
  isNew?: boolean;
  isFeatured?: boolean;
}

interface SalesCollection {
  id: number;
  name: string;
  description: string;
  discount_percentage: number;
  image_url: string;
  product_ids: number[];
  is_active: boolean;
}

// Calculate total stock from all sizes
function getTotalStock(product: Product): number {
  if (!product.sizes || !Array.isArray(product.sizes)) return 0;
  return product.sizes.reduce((total, size) => total + (size.stock ?? 0), 0);
}

// Get the size with the lowest stock (for display)
function getLowStockSize(product: Product): { name: string; stock: number } | null {
  if (!product.sizes || !Array.isArray(product.sizes)) return null;
  const availableSizes = product.sizes.filter(s => s.available && (s.stock ?? 0) > 0);
  if (availableSizes.length === 0) return null;
  
  const lowest = availableSizes.reduce((min, size) => {
    const sizeStock = size.stock ?? 0;
    return sizeStock < (min.stock ?? Infinity) ? { name: size.name, stock: sizeStock } : min;
  }, { name: '', stock: Infinity });
  
  return lowest.stock <= 5 ? lowest : null;
}

export default function ShopPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [salesCollections, setSalesCollections] = useState<SalesCollection[]>([]);
  const [activeCollection, setActiveCollection] = useState<SalesCollection | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and sales collections from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();

        if (productsData.products && Array.isArray(productsData.products)) {
          const frontendProducts = productsData.products.map((p: any) => ({
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

        // Fetch collections separately so it doesn't break if the API fails
        try {
          const collectionsRes = await fetch('/api/sales-collections');
          const collectionsData = await collectionsRes.json();

          if (collectionsData.collections && Array.isArray(collectionsData.collections)) {
            const activeCollections = collectionsData.collections.filter((c: any) => c.is_active);
            setSalesCollections(activeCollections);
            if (activeCollections.length > 0) {
              setActiveCollection(activeCollections[0]);
            }
          }
        } catch (collectionsError) {
          console.warn('Sales collections not available yet:', collectionsError);
          setSalesCollections([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle ?sale= query parameter from homepage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const saleId = urlParams.get('sale');
    if (saleId && salesCollections.length > 0) {
      const foundCollection = salesCollections.find(c => String(c.id) === String(saleId));
      if (foundCollection) {
        setSelectedCategory(`sale-${foundCollection.id}`);
        setActiveCollection(foundCollection);
      }
    }
  }, [salesCollections]);

  useEffect(() => {
    let filtered = [...products];

    // If a sales collection is selected, filter by product IDs
    if (selectedCategory.startsWith('sale-')) {
      const collectionId = parseInt(selectedCategory.replace('sale-', ''));
      const collection = salesCollections.find(c => c.id === collectionId);
      if (collection && collection.product_ids && Array.isArray(collection.product_ids)) {
        filtered = filtered.filter(p => collection.product_ids.includes(p.id));
      }
    } else if (selectedCategory !== 'all') {
      // Normal category filter
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
  }, [selectedCategory, selectedSort, products, activeCollection]);

  const allCategories = [
    { id: 'all', name: 'All' },
    ...(salesCollections || []).map(c => ({ id: `sale-${c.id}`, name: `${c.name} (-${c.discount_percentage}%)` })),
    ...categories.filter(c => c.id !== 'all'),
  ];

  const getCategoryTranslation = (catId: string) => {
    const key = `home.${catId}`;
    return t(key);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Page Header Skeleton */}
        <div className="relative overflow-hidden h-64 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          {/* Filters Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-24 h-9 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
            <div className="w-40 h-9 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-800 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
            {allCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white'
                }`}
              >
                {cat.id === 'all' ? t('shop.all') : (t(`home.${cat.id}`) !== `home.${cat.id}` ? t(`home.${cat.id}`) : cat.name)}
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
              <option key={opt.id} value={opt.id}>
                {opt.id === 'newest' && t('shop.sort.newest')}
                {opt.id === 'price-low' && t('shop.sort.priceLow')}
                {opt.id === 'price-high' && t('shop.sort.priceHigh')}
                {opt.id === 'name' && t('shop.sort.name')}
              </option>
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
              <ProductCard key={product.id} product={product} activeCollection={activeCollection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, activeCollection }: { product: Product; activeCollection: SalesCollection | null }) {
  const { t } = useLanguage();
  
  const totalStock = getTotalStock(product);
  const lowStockSize = getLowStockSize(product);
  const isSoldOut = totalStock <= 0 || !product.sizes || !Array.isArray(product.sizes) || !product.sizes.some(s => s.available);
  
  // Calculate discounted price if in an active collection
  const isInCollection = activeCollection && activeCollection.product_ids && Array.isArray(activeCollection.product_ids)
    ? activeCollection.product_ids.includes(product.id)
    : false;
  const discountedPrice = isInCollection && activeCollection
    ? product.price * (1 - activeCollection.discount_percentage / 100)
    : product.price;

  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className="aspect-[3/4] bg-neutral-100 dark:bg-charcoal-700 relative overflow-hidden mb-6">
        {(product.images && product.images[0]) ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <Image
            src={defaultImages[product.category] || defaultImages.dresses}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-3 py-2">
              {t('shop.new')}
            </span>
          )}
          {isInCollection && activeCollection && (
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium bg-red-500 text-white px-3 py-2">
              -{activeCollection.discount_percentage}%
            </span>
          )}
          {lowStockSize && !isSoldOut && (
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium bg-yellow-500 text-neutral-900 px-3 py-2">
              Only {lowStockSize.stock} left!
            </span>
          )}
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-neutral-900/60 dark:bg-white/60 flex items-center justify-center">
            <span className="text-white dark:text-neutral-900 text-xs tracking-[0.2em] uppercase font-medium">{t('shop.soldOut')}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-500" />
      </div>
      
      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400">
          {t(`home.${product.category}`) !== `home.${product.category}` ? t(`home.${product.category}`) : product.category}
        </p>
        <h3 className="font-medium tracking-wide text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors duration-300">{product.name}</h3>
        <div className="flex items-center gap-2">
          {isInCollection && activeCollection ? (
            <>
              <p className="font-light text-red-500">€{discountedPrice.toFixed(2)}</p>
              <p className="font-light text-neutral-400 line-through">€{product.price.toFixed(2)}</p>
            </>
          ) : (
            <p className="font-light text-neutral-900 dark:text-white">€{product.price.toFixed(2)}</p>
          )}
        </div>
        {/* Stock indicator */}
        {!isSoldOut && totalStock > 0 && (
          <p className="text-[10px] text-neutral-400">
            {totalStock > 20 ? t('product.available').replace('${stock}', totalStock.toString()) : t('product.leftInStock').replace('${stock}', totalStock.toString())}
          </p>
        )}
      </div>
    </Link>
  );
}
