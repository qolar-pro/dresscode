'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The single motion vocabulary for the whole storefront — every animation,
 * GSAP or CSS, draws from these curves and durations so the experience moves
 * as one system. (Ported from the Sneaker Air / Apex design language.)
 */

export const EASE_OUT = 'expo.out';
export const EASE_INOUT = 'power2.inOut';
export const CSS_EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const DUR = {
  xs: 0.3,
  sm: 0.6,
  md: 0.9,
  lg: 1.4,
  xl: 2.2,
} as const;

export const STAGGER = {
  tight: 0.045,
  base: 0.09,
  loose: 0.16,
} as const;

let registered = false;
export function registerGsap() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE_OUT, duration: DUR.md });
  registered = true;
}

export { gsap, ScrollTrigger };
