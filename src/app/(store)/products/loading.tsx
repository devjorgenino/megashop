/**
 * Skeleton de carga para la página de productos.
 */
export default function ProductsLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-label="Cargando productos"
    >
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />

      {/* Title skeleton */}
      <div className="mt-6 h-8 w-64 animate-pulse rounded bg-gray-200" />

      {/* Filters skeleton */}
      <div className="mt-6 h-24 animate-pulse rounded-xl bg-gray-100" />

      {/* Grid skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="aspect-square animate-pulse bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Cargando productos, por favor espere...</span>
    </div>
  );
}
