"use client";

import { useMemo, useState } from "react";
import SneakerViewer3D from "@/components/three/SneakerViewer3D";
import { products as staticProducts } from "@/data/products";
import { variantForColorwayIndex } from "@/lib/sneaker-models";
import type { Product } from "@/types";

/**
 * The signature "pick a sneaker, see it live in 3D" section. Selecting a
 * product swaps the live spinning model; selecting a colorway swaps its
 * material variant. Drag to rotate, scroll to zoom.
 */
export default function Sneaker3DShowcase({
  products,
}: {
  products?: Product[];
}) {
  const list = useMemo(
    () => (products && products.length ? products : staticProducts).slice(0, 6),
    [products]
  );
  const [selectedId, setSelectedId] = useState<number>(list[0]?.id ?? 1);
  const [colorwayIndex, setColorwayIndex] = useState(0);

  const selected = list.find((p) => p.id === selectedId) ?? list[0];
  const variant = variantForColorwayIndex(colorwayIndex);
  const fallbackImage = selected?.images?.[0];

  return (
    <section className="relative overflow-hidden bg-charcoal-900 py-24 text-pearl-50">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="aura-blob aura-blob-a left-[10%] top-[20%] h-72 w-72" />
        <div className="aura-blob aura-blob-c right-[8%] bottom-[10%] h-80 w-80" />
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="absolute inset-0 noise-overlay" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-12">
        <div className="order-2 md:order-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-pearl-50/50">
            Live 3D · Drag to rotate
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-6xl">
            See every
            <br />
            <span className="aura-text">angle</span>
          </h2>
          <p className="mt-6 max-w-md text-pearl-50/60">
            Spin it, zoom it, switch the colorway. Pick a silhouette and preview
            it in real time before it hits your rotation.
          </p>

          {/* product picker */}
          <div className="mt-8 flex flex-wrap gap-2">
            {list.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setColorwayIndex(0);
                  }}
                  className={`btn-glow rounded-full px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? "aura-gradient text-white"
                      : "aura-glass text-pearl-50/80"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* colorway picker */}
          {selected?.colors?.length ? (
            <div className="mt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-pearl-50/40">
                Colorway
              </span>
              <div className="mt-3 flex gap-3">
                {selected.colors.map((c, i) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setColorwayIndex(i)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      colorwayIndex === i
                        ? "scale-110 border-white"
                        : "border-white/20"
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex items-baseline gap-4">
            <span className="font-display text-3xl font-extrabold">
              €{selected?.price?.toFixed(2)}
            </span>
            <a
              href={`/product/${selected?.id}`}
              className="btn-glow aura-gradient rounded-full px-6 py-3 text-sm font-bold text-white"
            >
              Shop this
            </a>
          </div>
        </div>

        {/* the live 3D stage */}
        <div className="order-1 md:order-2">
          <div className="aura-border relative mx-auto aspect-square w-full max-w-lg rounded-[2rem]">
            <SneakerViewer3D
              key={selected?.id}
              variant={variant}
              autoRotate
              interactive
              fallbackImage={fallbackImage}
              alt={selected?.name ?? "Sneaker Air"}
              className="h-full w-full rounded-[2rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
