/**
 * Página del catálogo de productos — estilo Orchid Store.
 * Server Component: datos obtenidos del servidor, filtros vía searchParams.
 */
import { Suspense } from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/products";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Pagination } from "@/components/products/pagination";
import { ChevronRight } from "lucide-react";
import type { ProductFilters as ProductFiltersType } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explora nuestro catálogo completo de productos",
};

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const filters: ProductFiltersType = {
    search: params.search,
    category: params.category,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    sortBy: (params.sortBy as ProductFiltersType["sortBy"]) ?? "newest",
    page: params.page ? parseInt(params.page) : 1,
  };

  const [productsResponse, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  const pageTitle = filters.category
    ? categories.find((c) => c.slug === filters.category)?.name ?? "Productos"
    : filters.search
      ? `Resultados para "${filters.search}"`
      : "Todos los Productos";

  return (
    <div className="bg-section-bg min-h-screen">
      {/* Barra de navegación */}
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
          <nav className="mt-2 flex items-center gap-1 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Tienda</span>
            {filters.category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/90">{pageTitle}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="mb-8">
          <Suspense fallback={null}>
            <ProductFilters categories={categories} />
          </Suspense>
        </div>

        {/* Cantidad de productos */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-medium text-gray-700">
              {productsResponse.count}
            </span>{" "}
            productos
          </p>
        </div>

        {/* Cuadrícula de productos */}
        <ProductGrid
          products={productsResponse.data}
          emptyMessage={
            filters.search
              ? `No se encontraron productos para "${filters.search}". Intenta con otro término.`
              : "No hay productos disponibles en esta categoría."
          }
        />

        {/* Paginación */}
        <div className="mt-8">
          <Suspense fallback={null}>
            <Pagination
              currentPage={productsResponse.page}
              totalPages={productsResponse.totalPages}
              totalItems={productsResponse.count}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
