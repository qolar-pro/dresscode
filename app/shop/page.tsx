'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { categories, sortOptions, defaultImages } from '@/data/products';
import { useReveal } from '@/lib/reveal';
import Magnetic from '@/components/Magnetic';
import TextRoll from '@/components/TextRoll';
import Link from 'next/link';

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

function getTotalStock(product: Product): number {
  if (!product.sizes || !Array.isArray(product.sizes)) return 0;
  return product.sizes.reduce((total, size) => total + (size.stock ?? 0), 0);
}

function getLowStockSize(product: Product): { name: string; stock: number } | null {
  if (!product.sizes || !Array.isArray(product.sizes)) return null;
  const availableSizes = product.sizes.filter((s) => s.available && (s.stock ?? 0) > 0);
  if (availableSizes.length === 0) return null;
  const lowest = availableSizes.reduce(
    (min, size) => {
      const sizeStock = size.stock ?? 0;
      return sizeStock < (min.stock ?? Infinity) ? { name: size.name, stock: sizeStock } : min;
    },
    { name: '', stock: Infinity }
  );
  return lowest.stock <= 5 ? lowest : null;
}

export default function ShopPage() {
  const { t } = useLanguage();
  const scope = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesCollections, setSalesCollections] = useState<SalesCollection[]>([]);
  const [activeCollection, setActiveCollection] = useState<SalesCollection | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        if (productsData.products && Array.isArray(productsData.products)) {
          setProducts(
            productsData.products.map((p: any) => ({
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
            }))
          );
        }
        try {
          const collectionsRes = await fetch('/api/sales-collections');
          const collectionsData = await collectionsRes.json();
          if (collectionsData.collections && Array.isArray(collectionsData.collections)) {
            const active = collectionsData.collections.filter((c: any) => c.is_active);
            setSalesCollections(active);
            if (active.length > 0) setActiveCollection(active[0]);
          }
        } catch {
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

  // Handle ?category= and ?sale= query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('category');
    if (cat) setSelectedCategory(cat);
    const saleId = urlParams.get('sale');
    if (saleId && salesCollections.length > 0) {
      const found = salesCollections.find((c) => String(c.id) === String(saleId));
      if (found) {
        setSelectedCategory(`sale-${found.id}`);
        setActiveCollection(found);
      }
    }
  }, [salesCollections]);

  useEffect(() => {
    let filtered = [...products];
    if (selectedCategory.startsWith('sale-')) {
      const collectionId = parseInt(selectedCategory.replace('sale-', ''));
      const collection = salesCollections.find((c) => c.id === collectionId);
      if (collection?.product_ids && Array.isArray(collection.product_ids)) {
        filtered = filtered.filter((p) => collection.product_ids.includes(p.id));
      }
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

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
      default:
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSort, products, salesCollections]);

  useReveal(scope, [loading, filteredProducts.length]);

  const allCategories = [
    { id: 'all', name: 'All' },
    ...(salesCollections || []).map((c) => ({
      id: `sale-${c.id}`,
      name: `${c.name} · -${c.discount_percentage}%`,
    })),
    ...categories.filter((c) => c.id !== 'all'),
  ];

  return (
    <div ref={scope} className="min-h-screen bg-void text-fog">
      {/* ============================ HERO HEADER ============================ */}
      <section className="relative overflow-hidden pt-40 pb-16 md:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aura-blob aura-blob-c left-[10%] top-[10%] h-[45vh] w-[45vh]" />
          <div className="aura-blob aura-blob-b right-[6%] top-[20%] h-[38vh] w-[38vh]" />
          <div className="absolute inset-0 grid-overlay opacity-50" />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-6 md:px-12">
          <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-mist" data-reveal>
            <span className="h-1.5 w-1.5 rounded-full bg-volt shadow-[0_0_10px_#4d7cff]" />
            {t('shop.collection')}
          </div>
          <h1 className="font-display text-6xl font-semibold uppercase leading-[0.85] tracking-tight md:text-8xl">
            <span className="line-mask"><span className="block">{t('shop.title')}</span></span>
          </h1>
          <p className="mt-6 max-w-md text-mist" data-reveal data-reveal-delay="0.1">
            {t('shop.subtitle')}
          </p>
        </div>
      </section>

      {/* ============================ FILTERS ============================ */}
      <div className="sticky top-[68px] z-30 border-y border-fog/8 panel-glass">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-12">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const isSale = cat.id.startsWith('sale-');
              const active = selectedCategory === cat.id;
              const label = isSale
                ? cat.name
                : cat.id === 'all'
                  ? t('shop.all')
                  : t(`home.${cat.id}`) !== `home.${cat.id}`
                    ? t(`home.${cat.id}`)
                    : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  data-cursor="link"
                  className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-300 ${
                    active
                      ? 'bg-neon text-white'
                      : isSale
                        ? 'border border-flare/40 text-flare hover:border-flare'
                        : 'border border-fog/12 text-mist hover:border-fog/40 hover:text-fog'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ghost sm:inline">
              Sort
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              data-cursor="link"
              className="cursor-pointer rounded-full border border-fog/12 bg-carbon px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fog outline-none transition-colors focus:border-fog/40"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-carbon">
                  {opt.id === 'newest' && t('shop.sort.newest')}
                  {opt.id === 'price-low' && t('shop.sort.priceLow')}
                  {opt.id === 'price-high' && t('shop.sort.priceHigh')}
                  {opt.id === 'name' && t('shop.sort.name')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================ GRID ============================ */}
      <section className="mx-auto max-w-[1500px] px-6 py-14 md:px-12">
        <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.25em] text-ghost">
          {loading ? '—' : filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? t('shop.product') : t('shop.products')}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-fog/5" />
                <div className="mt-5 space-y-2">
                  <div className="h-2 w-16 rounded bg-fog/5" />
                  <div className="h-3 w-32 rounded bg-fog/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-28 text-center">
            <p className="font-display text-3xl uppercase tracking-tight text-hollow">{t('shop.noProducts')}</p>
            <p className="mx-auto mt-4 max-w-sm text-mist">{t('shop.noProductsDesc')}</p>
            <Magnetic strength={0.3}>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSort('newest');
                }}
                data-cursor="link"
                className="mt-8 rounded-full bg-neon px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110"
              >
                <TextRoll text={t('shop.clearFilters')} />
              </button>
            </Magnetic>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-reveal-group>
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} activeCollection={activeCollection} t={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductCard({
  product,
  index,
  activeCollection,
  t,
}: {
  product: Product;
  index: number;
  activeCollection: SalesCollection | null;
  t: (k: string) => string;
}) {
  const totalStock = getTotalStock(product);
  const lowStockSize = getLowStockSize(product);
  const isSoldOut =
    totalStock <= 0 ||
    !product.sizes ||
    !Array.isArray(product.sizes) ||
    !product.sizes.some((s) => s.available);

  const isInCollection =
    activeCollection?.product_ids && Array.isArray(activeCollection.product_ids)
      ? activeCollection.product_ids.includes(product.id)
      : false;
  const discountedPrice =
    isInCollection && activeCollection
      ? product.price * (1 - activeCollection.discount_percentage / 100)
      : product.price;

  const img = product.images?.[0] || defaultImages[product.category] || defaultImages.running;
  const catLabel =
    t(`home.${product.category}`) !== `home.${product.category}` ? t(`home.${product.category}`) : product.category;

  return (
    <Link href={`/product/${product.id}`} data-cursor="view" className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl panel-glass">
        <span aria-hidden className="absolute left-4 top-3 z-10 font-display text-6xl font-bold text-hollow opacity-25">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
          {product.isNew && (
            <span className="rounded-full bg-neon px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
              {t('shop.new')}
            </span>
          )}
          {isInCollection && activeCollection && (
            <span className="rounded-full bg-flare px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
              -{activeCollection.discount_percentage}%
            </span>
          )}
          {lowStockSize && !isSoldOut && (
            <span className="rounded-full border border-volt/50 bg-void/60 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-volt backdrop-blur">
              {lowStockSize.stock} left
            </span>
          )}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />

        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/70 backdrop-blur-[2px]">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-fog">{t('shop.soldOut')}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ghost">{catLabel}</div>
          <h3 className="mt-1 font-display text-lg font-medium text-fog transition-colors group-hover:text-plasma">
            {product.name}
          </h3>
        </div>
        <div className="text-right">
          {isInCollection && activeCollection ? (
            <>
              <div className="font-mono text-sm text-flare">€{discountedPrice.toFixed(2)}</div>
              <div className="font-mono text-[11px] text-ghost line-through">€{product.price.toFixed(2)}</div>
            </>
          ) : (
            <div className="font-mono text-sm text-fog">€{Number(product.price).toFixed(2)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
