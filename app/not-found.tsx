import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-display text-8xl text-pearl-50 mb-4">404</h1>
        <p className="text-neutral-400 text-xl mb-8">Page Not Found</p>
        <p className="text-neutral-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-pearl-50 text-charcoal-900 px-6 py-3 rounded-lg font-medium hover:bg-pearl-100 transition-colors"
        >
          Back to Store
        </Link>
      </div>
    </div>
  );
}
