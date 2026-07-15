'use client';

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, registerGsap } from '@/lib/motion';
import { useQuality } from '@/lib/quality';

/**
 * Lenis ↔ GSAP bridge. Lenis produces the scroll, GSAP's ticker drives it, and
 * ScrollTrigger listens to it so all scroll reveals stay in lockstep. Disabled
 * under reduced motion (native scrolling takes over).
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const { reducedMotion } = useQuality();

  useEffect(() => {
    if (reducedMotion) return;
    registerGsap();

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 });

    lenis.on('scroll', () => ScrollTrigger.update());

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
