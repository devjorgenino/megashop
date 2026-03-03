/**
 * Grid responsivo para mostrar lista de productos.
 * Accesibilidad: role="list" semántico con article children.
 */
import { ShoppingBag } from "lucide-react";
import { ProductCard } from "./product-card";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No se encontraron productos.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
        <ShoppingBag
          className="mx-auto h-12 w-12 text-gray-300"
          aria-hidden="true"
        />
        <p className="mt-4 text-gray-500">{emptyMessage}</p>
        <p className="mt-1 text-sm text-gray-400">
          Intenta ajustar los filtros o buscar otro término.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="list"
      aria-label="Lista de productos"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
