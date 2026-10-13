export default function Loading() {
  return (
    <div className="container-x py-16">
      <div className="h-6 w-40 animate-pulse rounded bg-cream-200" />
      <div className="mt-4 h-12 w-2/3 max-w-xl animate-pulse rounded-lg bg-cream-200" />
      <div className="mt-3 h-5 w-1/2 max-w-md animate-pulse rounded bg-cream-200" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-sm bg-cream-200"
          />
        ))}
      </div>
    </div>
  );
}
