"use client";

/**
 * Componente de paginación.
 * Usa searchParams en la URL para SEO.
 *
 * Accesibilidad: aria-current="page", aria-label en cada enlace de página,
 * aria-disabled en botones deshabilitados, aria-hidden en iconos.
 */
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  function buildPageUrl(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-500" aria-live="polite">
        {totalItems} producto{totalItems !== 1 ? "s" : ""} encontrado
        {totalItems !== 1 ? "s" : ""}
      </p>

      <nav className="flex items-center gap-1" aria-label="Paginación">
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="inline-flex items-center rounded-lg px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span
            className="inline-flex items-center rounded-lg px-2 py-2 text-sm text-gray-300"
            aria-disabled="true"
            aria-label="Página anterior (no disponible)"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </span>
        )}

        {pages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`dots-${idx}`}
              className="px-2 py-2 text-sm text-gray-400"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageUrl(page)}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          )
        )}

        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="inline-flex items-center rounded-lg px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span
            className="inline-flex items-center rounded-lg px-2 py-2 text-sm text-gray-300"
            aria-disabled="true"
            aria-label="Página siguiente (no disponible)"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </nav>
    </div>
  );
}
