'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { products as defaultProducts, defaultImages } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingBag, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use string comparison to avoid issues with large IDs
  const productId = params.id as string;

  // Fetch product by ID from API
  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        if (data.product) {
          const p = data.product;
          const frontendProduct = {
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
          };
          setProducts([frontendProduct]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const product = products.find(p => String(p.id) === productId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-white"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-tight text-neutral-900 dark:text-white mb-4">Product Not Found</h1>
          <Link href="/shop" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors inline-block">
            Back to Shop
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const emojiMap: Record<string, string> = {
    dresses: '👗',
    tops: '👚',
    pants: '👖',
    skirts: '👗',
    outerwear: '🧥',
    accessories: '👜',
  };

  const handleAddToCart = () => {
    // Check if selected size has stock
    const selectedSizeObj = product.sizes.find((s: any) => s.name === selectedSize);
    if (selectedSizeObj && selectedSizeObj.stock !== undefined && selectedSizeObj.stock <= 0) {
      alert('Sorry, this size is sold out. Please select another size.');
      return;
    }
    if (!selectedSize) {
      alert(t('product.selectSize'));
      return;
    }
    if (!selectedColor) {
      alert(t('product.selectColor'));
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const availableSizes = product.sizes ? product.sizes.filter((s: any) => s.available) : [];
  const availableColors = product.colors ? product.colors.filter((c: any) => c.available) : [];

  // Calculate total stock
  const totalStock = product.sizes ? product.sizes.reduce((sum: number, s: any) => sum + (s.stock ?? 0), 0) : 0;
  const isSoldOut = totalStock <= 0 || availableSizes.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 relative overflow-hidden">
      {/* Subtle Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.02]"
        />
      </div>
      
      <div className="relative z-10 pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {t('product.back')}
          </button>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            {/* Product Image */}
            <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <Image
                  src={defaultImages[product.category] || defaultImages.dresses}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
              {product.isNew && (
                <span className="absolute top-6 left-6 text-[10px] tracking-[0.2em] uppercase font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2">
                  {t('common.newArrival')}
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <div className="max-w-lg">
                <Link href={`/shop?category=${product.category}`} className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4 inline-block">
                  {product.category}
                </Link>
                
                <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight text-neutral-900 dark:text-white mb-6">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white" />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">(48 reviews)</span>
                </div>

                <p className="text-3xl font-light text-neutral-900 dark:text-white mb-8">€{product.price.toFixed(2)}</p>
                
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10 font-light">{product.description}</p>

                {/* Color Selection */}
                {availableColors.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-4 text-neutral-900 dark:text-white">
                      {t('common.color')} {selectedColor && <span className="text-neutral-500 dark:text-neutral-400 font-normal">— {selectedColor}</span>}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color: any) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-10 h-10 transition-all duration-300 ${
                            selectedColor === color.name
                              ? 'ring-2 ring-neutral-900 dark:ring-white ring-offset-2 dark:ring-offset-neutral-950'
                              : 'hover:ring-2 hover:ring-neutral-400 hover:ring-offset-2 dark:hover:ring-offset-neutral-950'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {availableSizes.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-xs tracking-[0.2em] uppercase font-medium text-neutral-900 dark:text-white">
                        {t('common.size')}
                      </label>
                      <button className="text-xs tracking-[0.15em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4 transition-colors">
                        {t('product.sizeGuide')}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(product.sizes || []).map((size: any) => {
                        const sizeStock = size.stock ?? 0;
                        const isSizeSoldOut = sizeStock <= 0;

                        return (
                          <div key={size.name} className="relative">
                            <button
                              onClick={() => size.available && !isSizeSoldOut && setSelectedSize(size.name)}
                              disabled={!size.available || isSizeSoldOut}
                              className={`min-w-[60px] px-5 py-3 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 ${
                                !size.available || isSizeSoldOut
                                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed line-through'
                                  : selectedSize === size.name
                                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                  : 'bg-transparent border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white text-neutral-900 dark:text-white'
                              }`}
                            >
                              {size.name}
                            </button>
                            {/* Stock indicator for selected size */}
                            {selectedSize === size.name && sizeStock > 0 && sizeStock <= 5 && (
                              <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-1 text-center">
                                Only {sizeStock} left!
                              </p>
                            )}
                            {isSizeSoldOut && (
                              <p className="text-[10px] text-red-500 mt-1 text-center">
                                Sold Out
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selection */}
                <div className="mb-10">
                  <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-4 text-neutral-900 dark:text-white">
                    {t('product.quantity')}
                  </label>
                  <div className="flex items-center border border-neutral-300 dark:border-neutral-700 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    </button>
                    <span className="w-16 text-center font-medium text-neutral-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-5 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-500 ${
                    addedToCart
                      ? 'bg-neutral-700 dark:bg-neutral-300 text-white dark:text-neutral-900'
                      : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200'
                  }`}
                >
                  {addedToCart ? t('product.addedToCart') : t('product.addToCart')}
                </button>

                {/* Features */}
                <div className="mt-10 pt-10 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light">✓ {t('product.complimentaryShipping')}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light">✓ {t('product.cashOnDelivery')}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light">✓ {t('product.easyReturns')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-16">
            <h2 className="font-display text-3xl font-light tracking-tight text-neutral-900 dark:text-white mb-12">{t('product.details')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-4 text-neutral-500 dark:text-neutral-400">{t('product.description')}</h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">{product.description}</p>
              </div>
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-4 text-neutral-500 dark:text-neutral-400">{t('product.sizeFit')}</h3>
                <ul className="space-y-3 text-neutral-700 dark:text-neutral-300 font-light">
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
