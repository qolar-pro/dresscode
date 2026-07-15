'use client';

/**
 * Character-roll hover: each glyph carries a twin below it; when a `.roll-trigger`
 * ancestor is hovered, the pair rolls upward with a per-character delay.
 * Pure CSS transitions (see globals.css) — disabled under prefers-reduced-motion.
 */
export default function TextRoll({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`textroll ${className}`} aria-label={text} role="text">
      {Array.from(text).map((ch, i) => (
        <span key={i} className="textroll-char" style={{ transitionDelay: `${i * 18}ms` }} aria-hidden>
          <span className="textroll-glyph">{ch === ' ' ? ' ' : ch}</span>
          <span className="textroll-glyph textroll-twin">{ch === ' ' ? ' ' : ch}</span>
        </span>
      ))}
    </span>
  );
}
