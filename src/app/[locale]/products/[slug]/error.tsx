'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product detail error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
          Unable to load product
        </h1>
        <p className="text-gray-600 mb-6">
          {error?.message || 'An unexpected error occurred while loading this product.'}
        </p>
        {error?.digest && (
          <p className="text-xs text-gray-400 mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
