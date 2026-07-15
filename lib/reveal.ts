'use client';

import { useEffect, type RefObject } from 'react';
import { gsap, registerGsap, DUR, STAGGER } from '@/lib/motion';

/**
 * Declarative scroll reveals, one vocabulary site-wide:
 *   [data-reveal]        — rises and fades in when scrolled into view
 *   [data-reveal-group]  — children stagger in as one block
 *   .line-mask > *       — masked line wipes upward (for display type)
 * Everything is disabled under prefers-reduced-motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    registerGsap();
    const el = scope.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node) => {
          gsap.from(node, {
            y: 48,
            opacity: 0,
            duration: DUR.lg,
            delay: parseFloat(node.dataset.revealDelay ?? '0'),
            scrollTrigger: { trigger: node, start: 'top 82%', once: true },
          });
        });

        el.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
          gsap.from(Array.from(group.children), {
            y: 40,
            opacity: 0,
            duration: DUR.md,
            stagger: STAGGER.base,
            scrollTrigger: { trigger: group, start: 'top 82%', once: true },
          });
        });

        el.querySelectorAll<HTMLElement>('.line-mask > *').forEach((line) => {
          gsap.fromTo(
            line,
            { y: 0, yPercent: 115 },
            {
              y: 0,
              yPercent: 0,
              duration: DUR.lg,
              ease: 'expo.out',
              scrollTrigger: { trigger: line.parentElement, start: 'top 85%', once: true },
            },
          );
        });
      }, el);

      return () => ctx.revert();
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
