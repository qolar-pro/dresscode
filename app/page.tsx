'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useReveal } from '@/lib/reveal';
import Magnetic from '@/components/Magnetic';
import TextRoll from '@/components/TextRoll';
import Marquee from '@/components/immersive/Marquee';
import SneakerViewer3D from '@/components/three/SneakerViewer3D';
import Sneaker3DShowcase from '@/components/Sneaker3DShowcase';
import { products as staticProducts } from '@/data/products';
import { variantForColorwayIndex } from '@/lib/sneaker-models';
import type { Product } from '@/types';

export default function Home() {
  const { t } = useLanguage();
  const scope = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Product[]>(staticProducts);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (!active || !data?.products?.length) return;
        const mapped: Product[] = data.products.map((p: any) => ({
          id: p.id, name: p.name, price: p.price, category: p.category,
          description: p.description, images: p.images || [],
          sizes: p.sizes || [], colors: p.colors || [],
          isNew: p.is_new, isFeatured: p.is_featured, stock: p.stock,
        }));
        const feat = mapped.filter((p) => p.isFeatured);
        setFeatured((feat.length ? feat : mapped).slice(0, 6));
      } catch { /* keep static fallback */ }
    })();
    return () => { active = false; };
  }, []);

  useReveal(scope, [featured.length]);

  const heroSneaker = featured[0] ?? staticProducts[0];

  return (
    <div ref={scope} className="bg-void text-fog">
      {/* ============================ HERO ============================ */}
      <section className="relative min-h-[100svh] overflow-hidden">
        {/* ambient field */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
               style={{ background: 'radial-gradient(circle, #8a5cff, transparent 65%)' }} />
          <div className="absolute right-[8%] bottom-[6%] h-[45vh] w-[45vh] rounded-full opacity-30 blur-[110px]"
               style={{ background: 'radial-gradient(circle, #ff4fd8, transparent 65%)' }} />
          <div className="absolute left-[6%] top-[12%] h-[40vh] w-[40vh] rounded-full opacity-25 blur-[110px]"
               style={{ background: 'radial-gradient(circle, #4d7cff, transparent 65%)' }} />
          <div className="absolute inset-0 grid-overlay opacity-[0.5]" />
        </div>

        <div className="relative mx-auto grid min-h-[100svh] max-w-[1500px] grid-cols-1 items-center gap-6 px-6 pt-28 pb-16 md:grid-cols-2 md:px-12">
          {/* copy */}
          <div className="order-2 md:order-1">
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-mist" data-reveal>
              <span className="h-1.5 w-1.5 rounded-full bg-flare shadow-[0_0_10px_#ff4fd8]" />
              {t('home.newCollection') || 'New Heat · 2026'}
            </div>

            <h1 className="font-display text-[15vw] font-semibold uppercase leading-[0.82] tracking-tight md:text-[8.5vw] lg:text-[7rem]">
              <span className="line-mask"><span className="block">{t('home.title1') || 'SNEAKER'}</span></span>
              <span className="line-mask"><span className="block text-neon">{t('home.title2') || 'AIR'}</span></span>
            </h1>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-mist" data-reveal data-reveal-delay="0.1">
              {t('home.subtitle') || 'Premium sneakers for those who move different. Running, basketball, lifestyle, skate & limited drops — engineered and previewed in live 3D.'}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4" data-reveal data-reveal-delay="0.2">
              <Magnetic strength={0.4}>
                <Link href="/shop" data-cursor="link"
                  className="group flex items-center gap-3 rounded-full bg-neon px-8 py-4 text-sm font-semibold text-white transition-[filter] duration-300 hover:brightness-110">
                  <TextRoll text={t('home.shopCollection') || 'Shop the drop'} />
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link href="#showcase" data-cursor="link"
                  className="flex items-center gap-2 rounded-full border border-fog/15 px-8 py-4 text-sm font-semibold text-fog/80 transition-colors hover:border-fog/40 hover:text-fog">
                  <TextRoll text="See it in 3D" />
                </Link>
              </Magnetic>
            </div>

            <div className="mt-14 flex gap-10 font-mono text-xs text-ghost" data-reveal-group>
              <div><div className="text-2xl font-semibold text-fog">120+</div><div className="mt-1 uppercase tracking-widest">Silhouettes</div></div>
              <div><div className="text-2xl font-semibold text-fog">EU 38–46</div><div className="mt-1 uppercase tracking-widest">Full run</div></div>
              <div><div className="text-2xl font-semibold text-fog">48h</div><div className="mt-1 uppercase tracking-widest">Shipping</div></div>
            </div>
          </div>

          {/* live 3D hero shoe */}
          <div className="order-1 md:order-2">
            <div className="relative mx-auto aspect-square w-full max-w-[560px]">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="select-none font-display text-[42vw] font-bold leading-none text-hollow opacity-[0.12] md:text-[26vw] lg:text-[22rem]">SA</span>
              </div>
              <SneakerViewer3D
                variant="midnight"
                autoRotate
                interactive
                fallbackImage={heroSneaker?.images?.[0]}
                alt={heroSneaker?.name ?? 'Sneaker Air'}
                className="relative h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div aria-hidden className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ghost">
          Scroll
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ============================ MARQUEE ============================ */}
      <Marquee items={['Sneaker Air', 'Premium Drops', 'Live 3D', 'New Heat 2026', 'Free Shipping €100+', 'Move Different']} />

      {/* ============================ FEATURED DROPS ============================ */}
      <section className="relative mx-auto max-w-[1500px] px-6 py-28 md:px-12">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.35em] text-mist" data-reveal>Featured</div>
            <h2 className="font-display text-5xl font-semibold uppercase leading-[0.9] tracking-tight md:text-7xl">
              <span className="line-mask"><span className="block">The Heat</span></span>
              <span className="line-mask"><span className="block text-hollow-accent">Collection</span></span>
            </h2>
          </div>
          <Magnetic strength={0.3}>
            <Link href="/shop" data-cursor="link" className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-mist hover:text-fog">
              <TextRoll text="View all" /> <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Magnetic>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
          {featured.map((p, i) => (
            <Link key={p.id} href={`/product/${p.id}`} data-cursor="view" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl panel-glass">
                <span aria-hidden className="absolute left-4 top-3 z-10 font-display text-6xl font-bold text-hollow opacity-30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {p.isNew && (
                  <span className="absolute right-4 top-4 z-10 rounded-full bg-neon px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white">New</span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images?.[0]} alt={p.name} loading="lazy" referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ghost">{p.category}</div>
                  <h3 className="mt-1 font-display text-lg font-medium text-fog transition-colors group-hover:text-plasma">{p.name}</h3>
                </div>
                <div className="font-mono text-sm text-fog">€{Number(p.price).toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ LIVE 3D SHOWCASE ============================ */}
      <div id="showcase">
        <Sneaker3DShowcase products={featured} />
      </div>

      {/* ============================ CTA ============================ */}
      <section className="relative overflow-hidden px-6 py-32 md:px-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[60vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
               style={{ background: 'radial-gradient(ellipse, #8a5cff, transparent 60%)' }} />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="font-display text-6xl font-semibold uppercase leading-[0.9] tracking-tight md:text-8xl" data-reveal>
            Move <span className="text-neon">different</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-mist" data-reveal data-reveal-delay="0.1">
            Join the drop list — early access to limited releases, restocks and members-only pricing.
          </p>
          <div className="mt-10 flex justify-center" data-reveal data-reveal-delay="0.2">
            <Magnetic strength={0.4}>
              <Link href="/shop" data-cursor="link" className="rounded-full bg-neon px-10 py-4 text-sm font-semibold text-white transition-[filter] hover:brightness-110">
                <TextRoll text="Enter the store" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
