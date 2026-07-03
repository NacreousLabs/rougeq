export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 animate-pulse px-6 py-10">
      <div className="h-7 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
      <div className="mt-8 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 rounded bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
