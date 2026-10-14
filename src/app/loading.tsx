export default function Loading() {
  return (
    <div className="container-x py-16">
      <div aria-label="Loading products" aria-busy="true">
        <div className="h-6 w-40 animate-pulse bg-cream-200" />
        <div className="mt-4 h-12 w-2/3 max-w-xl animate-pulse bg-cream-200" />
        <div className="mt-3 h-5 w-1/2 max-w-md animate-pulse bg-cream-200" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="overflow-hidden border border-cream-300 bg-surface">
              <div className="aspect-[4/5] animate-pulse bg-cream-200" />
              <div className="space-y-3 p-3">
                <div className="h-4 w-4/5 animate-pulse bg-cream-200" />
                <div className="h-3 w-2/3 animate-pulse bg-cream-200" />
                <div className="h-5 w-1/2 animate-pulse bg-cream-200" />
                <div className="h-10 animate-pulse bg-cream-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
