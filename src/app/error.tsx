"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-6 py-20 text-center">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-500">
        This page hit an error — often a hiccup fetching the latest CFL data. Try again in a moment.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-bombers-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-bombers-gold"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
