'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/motion';
import { useQuality } from '@/lib/quality';

export type CursorState = 'default' | 'link' | 'view' | 'text';

/**
 * Custom cursor with contextual states, driven by [data-cursor] attributes:
 *   data-cursor="link"  — ring expands, tints plasma
 *   data-cursor="view"  — becomes a labeled disc over media
 *   data-cursor="text"  — thin beam for copy-selection zones
 * Renders nothing on coarse pointers. Squash-and-stretch on fast moves.
 */
export default function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { isTouch } = useQuality();

  useEffect(() => {
    if (isTouch) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.body.dataset.customCursor = 'true';

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    let shown = false;
    let state: CursorState = 'default';

    const applyState = (next: CursorState) => {
      if (next === state) return;
      state = next;
      if (wrapRef.current) wrapRef.current.style.mixBlendMode = next === 'view' ? 'normal' : 'difference';
      if (next === 'view') gsap.to(ring, { rotation: 0, scaleX: 1, scaleY: 1, duration: 0.3, ease: 'power3.out' });
      const cfg = {
        default: { size: 36, borderColor: 'rgba(242,242,247,0.4)', bg: 'rgba(242,242,247,0)', labelOp: 0, dotScale: 1 },
        link: { size: 56, borderColor: 'rgba(138,92,255,0.9)', bg: 'rgba(138,92,255,0.08)', labelOp: 0, dotScale: 0.5 },
        view: { size: 92, borderColor: 'rgba(255,79,216,0.9)', bg: 'rgba(3,3,9,0.55)', labelOp: 1, dotScale: 0 },
        text: { size: 20, borderColor: 'rgba(242,242,247,0.6)', bg: 'rgba(242,242,247,0.05)', labelOp: 0, dotScale: 0.4 },
      }[next];
      gsap.to(ring, {
        width: cfg.size,
        height: cfg.size,
        borderColor: cfg.borderColor,
        backgroundColor: cfg.bg,
        duration: 0.4,
        ease: 'expo.out',
      });
      gsap.to(label, { opacity: cfg.labelOp, duration: 0.25, ease: 'power2.out' });
      gsap.to(dot, { scale: cfg.dotScale, duration: 0.3, ease: 'expo.out' });
    };

    let lastX = 0;
    let lastY = 0;
    let relaxTimer: ReturnType<typeof setTimeout> | undefined;

    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        lastX = e.clientX;
        lastY = e.clientY;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      if (state !== 'view') {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const speed = Math.hypot(dx, dy);
        if (speed > 2) {
          const stretch = Math.min(speed * 0.012, 0.45);
          gsap.set(ring, { rotation: (Math.atan2(dy, dx) * 180) / Math.PI });
          gsap.to(ring, { scaleX: 1 + stretch, scaleY: 1 - stretch * 0.55, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
        }
        clearTimeout(relaxTimer);
        relaxTimer = setTimeout(() => {
          gsap.to(ring, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'power3.out' });
        }, 90);
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      applyState((target?.dataset.cursor as CursorState) ?? 'default');
    };

    const onDown = () => gsap.to(dot, { scale: 1.8, duration: 0.2, ease: 'power2.out' });
    const onUp = () => gsap.to(dot, { scale: state === 'default' ? 1 : 0.5, duration: 0.35, ease: 'expo.out' });
    const onLeave = () => {
      shown = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      delete document.body.dataset.customCursor;
      clearTimeout(relaxTimer);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none fixed inset-0 z-[200]" style={{ mixBlendMode: 'difference' }}>
      <div ref={dotRef} className="absolute -top-[3px] -left-[3px] h-1.5 w-1.5 rounded-full bg-fog opacity-0" />
      <div
        ref={ringRef}
        className="absolute flex items-center justify-center rounded-full border opacity-0"
        style={{ width: 36, height: 36, top: 0, left: 0, borderColor: 'rgba(242,242,247,0.4)', translate: '-50% -50%' }}
      >
        <span ref={labelRef} className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-fog opacity-0">
          View
        </span>
      </div>
    </div>
  );
}
