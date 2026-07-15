'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { defaultImages } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { Minus, Plus, ArrowLeft, Star, Box, ImageIcon, Check, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import SneakerViewer3D from '@/components/three/SneakerViewer3D';
import { variantForColorwayIndex } from '@/lib/sneaker-models';
import { useReveal } from '@/lib/reveal';
import Magnetic from '@/components/Magnetic';
import TextRoll from '@/components/TextRoll';

export default function ProductPage() {
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const productId = params.id as string;

  useEffect(() => {
    if (!productId) return;
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.product) {
          const p = data.product;
          setProducts([
            {
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
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const product = products.find((p) => String(p.id) === productId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-plasma" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-6 text-center">
        <div>
          <h1 className="font-display text-5xl uppercase tracking-tight text-hollow">Not Found</h1>
          <p className="mt-4 text-mist">This silhouette doesn&apos;t exist (or sold out of the archive).</p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-neon px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: any }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const scope = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [view, setView] = useState<'3d' | 'photo'>('3d');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useReveal(scope, []);

  const handleAddToCart = () => {
    const selectedSizeObj = product.sizes.find((s: any) => s.name === selectedSize);
    if (selectedSizeObj && selectedSizeObj.stock !== undefined && selectedSizeObj.stock <= 0) {
      setError('That size is sold out — pick another.');
      return;
    }
    if (!selectedSize) return setError(t('product.selectSize'));
    if (!selectedColor) return setError(t('product.selectColor'));
    setError(null);
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const availableSizes = product.sizes ? product.sizes.filter((s: any) => s.available) : [];
  const availableColors = product.colors ? product.colors.filter((c: any) => c.available) : [];
  const heroImage = product.images?.[0] || defaultImages[product.category] || defaultImages.running;
  const catLabel =
    t(`home.${product.category}`) !== `home.${product.category}` ? t(`home.${product.category}`) : product.category;

  return (
    <div ref={scope} className="relative min-h-screen overflow-hidden bg-void text-fog">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aura-blob aura-blob-b left-[-8%] top-[15%] h-[50vh] w-[50vh] opacity-30" />
        <div className="aura-blob aura-blob-c right-[-6%] top-[40%] h-[45vh] w-[45vh] opacity-25" />
        <div className="absolute inset-0 grid-overlay opacity-40" />
      </div>

      <div className="relative z-10 pt-28 md:pt-32">
        {/* breadcrumb */}
        <div className="mx-auto max-w-[1500px] px-6 py-6 md:px-12">
          <button
            onClick={() => router.back()}
            data-cursor="link"
            className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mist transition-colors hover:text-fog"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            {t('product.back')}
          </button>
        </div>

        <div className="mx-auto max-w-[1500px] px-6 py-8 md:px-12">
          <div className="mb-28 grid grid-cols-1 gap-14 lg:grid-cols-2">
            {/* ============ VISUAL ============ */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center">
                <span className="select-none font-display text-[30vw] font-bold leading-none text-hollow opacity-[0.08] lg:text-[16rem]">
                  {String(product.id).padStart(2, '0')}
                </span>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-3xl panel-glass lg:aspect-[4/5]">
                {view === '3d' ? (
                  <SneakerViewer3D
                    variant={variantForColorwayIndex(
                      Math.max(0, (product.colors || []).findIndex((c: any) => c.name === selectedColor))
                    )}
                    autoRotate
                    interactive
                    fallbackImage={heroImage}
                    alt={product.name}
                    className="h-full w-full"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={heroImage} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                )}

                {/* view toggle */}
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full panel-glass p-1">
                  <button
                    onClick={() => setView('3d')}
                    data-cursor="link"
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] transition ${
                      view === '3d' ? 'bg-neon text-white' : 'text-mist hover:text-fog'
                    }`}
                  >
                    <Box className="h-3.5 w-3.5" /> Live 3D
                  </button>
                  <button
                    onClick={() => setView('photo')}
                    data-cursor="link"
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] transition ${
                      view === 'photo' ? 'bg-neon text-white' : 'text-mist hover:text-fog'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Photo
                  </button>
                </div>

                {product.isNew && (
                  <span className="absolute left-5 top-5 z-10 rounded-full bg-neon px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                    {t('common.newArrival')}
                  </span>
                )}
                {view === '3d' && (
                  <span className="absolute right-5 top-5 z-10 rounded-full border border-fog/15 bg-void/50 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-mist backdrop-blur">
                    Drag to rotate
                  </span>
                )}
              </div>
            </div>

            {/* ============ INFO ============ */}
            <div className="flex flex-col justify-center">
              <div className="max-w-lg">
                <Link
                  href={`/shop?category=${product.category}`}
                  data-reveal
                  className="mb-4 inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-plasma transition-colors hover:text-fog"
                >
                  {catLabel}
                </Link>

                <h1 className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight md:text-6xl" data-reveal data-reveal-delay="0.05">
                  {product.name}
                </h1>

                <div className="mt-5 flex items-center gap-3" data-reveal data-reveal-delay="0.1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-plasma text-plasma" />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ghost">48 reviews</span>
                </div>

                <p className="mt-6 font-mono text-3xl text-fog" data-reveal data-reveal-delay="0.12">
                  €{Number(product.price).toFixed(2)}
                </p>

                <p className="mt-6 leading-relaxed text-mist" data-reveal data-reveal-delay="0.15">
                  {product.description}
                </p>

                {/* colors */}
                {availableColors.length > 0 && (
                  <div className="mt-9">
                    <label className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
                      {t('common.color')}{' '}
                      {selectedColor && <span className="text-fog">— {selectedColor}</span>}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color: any) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          data-cursor="link"
                          className={`h-10 w-10 rounded-full transition-all duration-300 ${
                            selectedColor === color.name
                              ? 'ring-2 ring-plasma ring-offset-2 ring-offset-void'
                              : 'ring-1 ring-fog/15 hover:ring-fog/40'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                          aria-label={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* sizes */}
                {availableSizes.length > 0 && (
                  <div className="mt-9">
                    <label className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
                      {t('common.size')} <span className="text-ghost">· EU</span>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {(product.sizes || []).map((size: any) => {
                        const sizeStock = size.stock ?? 0;
                        const isSizeSoldOut = sizeStock <= 0 || !size.available;
                        const active = selectedSize === size.name;
                        return (
                          <button
                            key={size.name}
                            onClick={() => !isSizeSoldOut && setSelectedSize(size.name)}
                            disabled={isSizeSoldOut}
                            data-cursor={isSizeSoldOut ? undefined : 'link'}
                            className={`relative min-w-[54px] rounded-xl px-4 py-3 font-mono text-[12px] font-medium transition-all duration-300 ${
                              isSizeSoldOut
                                ? 'cursor-not-allowed border border-fog/5 text-ghost/50 line-through'
                                : active
                                  ? 'bg-neon text-white'
                                  : 'border border-fog/15 text-fog hover:border-fog/40'
                            }`}
                          >
                            {size.name}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSize &&
                      (() => {
                        const s = product.sizes.find((x: any) => x.name === selectedSize);
                        const st = s?.stock ?? 0;
                        return st > 0 && st <= 5 ? (
                          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-volt">
                            Only {st} left in EU {selectedSize}
                          </p>
                        ) : null;
                      })()}
                  </div>
                )}

                {/* quantity */}
                <div className="mt-9">
                  <label className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
                    {t('product.quantity')}
                  </label>
                  <div className="flex w-fit items-center rounded-full border border-fog/15">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3.5 text-mist transition-colors hover:text-fog" aria-label="Decrease">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-mono text-fog">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3.5 text-mist transition-colors hover:text-fog" aria-label="Increase">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-flare">{error}</p>
                )}

                {/* add to cart */}
                <div className="mt-8">
                  <Magnetic strength={0.15}>
                    <button
                      onClick={handleAddToCart}
                      data-cursor="link"
                      className={`flex w-full items-center justify-center gap-2 rounded-full py-5 font-mono text-[12px] uppercase tracking-[0.2em] transition-all duration-300 ${
                        addedToCart ? 'bg-volt text-white' : 'bg-neon text-white hover:brightness-110'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="h-4 w-4" /> {t('product.addedToCart')}
                        </>
                      ) : (
                        <TextRoll text={t('product.addToCart')} />
                      )}
                    </button>
                  </Magnetic>
                </div>

                {/* assurances */}
                <div className="mt-10 grid grid-cols-1 gap-3 border-t border-fog/8 pt-8 sm:grid-cols-3">
                  {[
                    { icon: Truck, label: t('product.complimentaryShipping') },
                    { icon: ShieldCheck, label: t('product.cashOnDelivery') },
                    { icon: RotateCcw, label: t('product.easyReturns') },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mist">
                      <Icon className="h-4 w-4 shrink-0 text-plasma" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* details */}
          <div className="border-t border-fog/8 pt-16">
            <h2 className="mb-12 font-display text-4xl font-semibold uppercase tracking-tight text-hollow">
              {t('product.details')}
            </h2>
            <div className="grid grid-cols-1 gap-14 md:grid-cols-2">
              <div>
                <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ghost">{t('product.description')}</h3>
                <p className="leading-relaxed text-mist">{product.description}</p>
              </div>
              <div>
                <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ghost">{t('product.sizeFit')}</h3>
                <ul className="space-y-3 text-mist">
                  <li>• {t('product.modelWearing')}</li>
                  <li>• {t('product.fitsTrue')}</li>
                  <li>• {t('product.referToGuide')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
