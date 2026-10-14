"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Hitilafu</p>
      <h1 className="heading-display mt-2">Something went wrong</h1>
      <p className="mt-4 max-w-md text-ink-500">
          Something went wrong. Please try again or go back.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-8">
        Jaribu Tena
      </button>
    </div>
  );
}
