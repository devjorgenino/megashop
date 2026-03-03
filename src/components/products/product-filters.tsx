"use client";

/**
 * Filtros del catálogo de productos — estilo Orchid Store.
 * Usa searchParams en la URL para que los filtros sean SEO-friendly y compartibles.
 *
 * Accesibilidad: aria-label en todos los inputs/selects, role="search",
 * aria-hidden en iconos decorativos.
 */
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const currentSort = searchParams.get("sortBy") ?? "newest";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasActiveFilters =
    currentCategory || currentSearch || currentMinPrice || currentMaxPrice;

  return (
    <section
      className="rounded-xl bg-white p-5 shadow-sm space-y-4"
      aria-label="Filtros de productos"
    >
      {/* Búsqueda */}
      <div className="relative" role="search">
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <label htmlFor="product-search" className="sr-only">
          Buscar productos
        </label>
        <input
          id="product-search"
          type="search"
          placeholder="Buscar productos..."
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("search", e.currentTarget.value);
            }
          }}
          className="w-full rounded-full border border-gray-200 py-2.5 pl-11 pr-4 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none transition-colors"
        />
      </div>

      {/* Fila de filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="h-4 w-4 text-gray-400" aria-hidden="true" />

        {/* Categoría */}
        <div>
          <label htmlFor="filter-category" className="sr-only">
            Categoría
          </label>
          <select
            id="filter-category"
            value={currentCategory}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none bg-white transition-colors"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Precio mínimo */}
        <div>
          <label htmlFor="filter-min-price" className="sr-only">
            Precio mínimo en dólares
          </label>
          <input
            id="filter-min-price"
            type="number"
            placeholder="Mín $"
            defaultValue={currentMinPrice}
            min="0"
            step="1"
            onBlur={(e) => {
              const val = e.target.value
                ? String(Math.round(parseFloat(e.target.value) * 100))
                : "";
              updateFilter("minPrice", val);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = e.currentTarget.value
                  ? String(Math.round(parseFloat(e.currentTarget.value) * 100))
                  : "";
                updateFilter("minPrice", val);
              }
            }}
            className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none transition-colors"
          />
        </div>

        {/* Precio máximo */}
        <div>
          <label htmlFor="filter-max-price" className="sr-only">
            Precio máximo en dólares
          </label>
          <input
            id="filter-max-price"
            type="number"
            placeholder="Máx $"
            defaultValue={currentMaxPrice}
            min="0"
            step="1"
            onBlur={(e) => {
              const val = e.target.value
                ? String(Math.round(parseFloat(e.target.value) * 100))
                : "";
              updateFilter("maxPrice", val);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = e.currentTarget.value
                  ? String(Math.round(parseFloat(e.currentTarget.value) * 100))
                  : "";
                updateFilter("maxPrice", val);
              }
            }}
            className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none transition-colors"
          />
        </div>

        {/* Ordenar */}
        <div>
          <label htmlFor="filter-sort" className="sr-only">
            Ordenar por
          </label>
          <select
            id="filter-sort"
            value={currentSort}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none bg-white transition-colors"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name">Nombre: A-Z</option>
          </select>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 rounded-full bg-sale/10 px-3 py-2 text-sm font-medium text-sale hover:bg-sale/20 transition-colors"
            aria-label="Limpiar todos los filtros"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Limpiar
          </button>
        )}
      </div>
    </section>
  );
}
