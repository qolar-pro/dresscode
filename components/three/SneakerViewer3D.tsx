"use client";

import React, { Component, ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ModelVariant } from "@/lib/sneaker-models";

// Load the heavy R3F/three bundle only on the client, and only where this
// component is actually mounted (code-split away from the main bundle).
const SneakerViewer = dynamic(() => import("./SneakerViewer"), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

function ViewerSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="aura-blob aura-blob-b h-32 w-32 opacity-30" />
      <span className="relative font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
        Loading 3D…
      </span>
    </div>
  );
}

function FallbackImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-charcoal-800/40">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
          3D unavailable
        </span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-contain"
      referrerPolicy="no-referrer"
    />
  );
}

/** Falls back to the product image if anything in the 3D subtree throws. */
class ThreeErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.error("3D viewer error, falling back to image:", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export interface SneakerViewer3DProps {
  fallbackImage?: string;
  alt?: string;
  variant?: ModelVariant;
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
}

export default function SneakerViewer3D({
  fallbackImage,
  alt = "Sneaker Air 3D preview",
  variant = "midnight",
  autoRotate = true,
  interactive = true,
  className = "",
}: SneakerViewer3DProps) {
  // Decide on the client: WebGL absent (or a very small/low-power screen) => image.
  const [mode, setMode] = useState<"pending" | "3d" | "image">("pending");

  useEffect(() => {
    setMode(hasWebGL() ? "3d" : "image");
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {mode === "pending" && <ViewerSkeleton />}
      {mode === "image" && <FallbackImage src={fallbackImage} alt={alt} />}
      {mode === "3d" && (
        <ThreeErrorBoundary
          fallback={<FallbackImage src={fallbackImage} alt={alt} />}
        >
          <SneakerViewer
            variant={variant}
            autoRotate={autoRotate}
            interactive={interactive}
          />
        </ThreeErrorBoundary>
      )}
    </div>
  );
}
