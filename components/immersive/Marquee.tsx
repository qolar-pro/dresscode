"use client";

/**
 * Infinite marquee band. Duplicates its items so the loop is seamless.
 * Animation pauses under prefers-reduced-motion (see globals.css).
 */
export default function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={`relative flex overflow-hidden border-y border-white/10 py-4 ${className}`}
      aria-hidden
    >
      <div className="marquee-track gap-8">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-display text-sm font-extrabold uppercase tracking-[0.2em]"
          >
            {item}
            <span className="aura-text text-lg">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
