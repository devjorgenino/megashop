"use client";

/**
 * Tabla de productos del admin con acciones inline.
 */
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { deleteProduct, toggleProductActive } from "./actions";
import type { ProductWithCategory } from "@/types";

interface ProductTableProps {
  products: ProductWithCategory[];
}

export function ProductTable({ products }: ProductTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`)) return;

    setLoadingId(productId);
    const result = await deleteProduct(productId);
    if (result.error) {
      alert(`Error: ${result.error}`);
    }
    setLoadingId(null);
  }

  async function handleToggleActive(productId: string, isActive: boolean) {
    setLoadingId(productId);
    const result = await toggleProductActive(productId, !isActive);
    if (result.error) {
      alert(`Error: ${result.error}`);
    }
    setLoadingId(null);
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">Aún no hay productos.</p>
        <Link
          href={`${ROUTES.adminProducts}/new`}
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          + Crea tu primer producto
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200" aria-label="Tabla de productos">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Producto
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 sm:table-cell">
              Categoría
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
              Precio
            </th>
            <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 md:table-cell">
              Stock
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
              Estado
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product) => {
            const isLoading = loadingId === product.id;
            const imageUrl = product.images?.[0];

            return (
              <tr
                key={product.id}
                className={isLoading ? "opacity-50" : "hover:bg-gray-50"}
              >
                {/* Info del producto */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="text-sm text-gray-600">
                    {product.categories?.name ?? "—"}
                  </span>
                </td>

                {/* Precio */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_at_price && (
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                </td>

                {/* Stock */}
                <td className="hidden px-4 py-3 text-right md:table-cell">
                  <span
                    className={`text-sm font-medium ${
                      product.stock <= 0
                        ? "text-red-600"
                        : product.stock <= 5
                          ? "text-orange-600"
                          : "text-gray-900"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() =>
                      handleToggleActive(product.id, product.is_active)
                    }
                    disabled={isLoading}
                    className="inline-flex items-center gap-1"
                    aria-label={
                      product.is_active
                        ? "Desactivar producto"
                        : "Activar producto"
                    }
                    title={
                      product.is_active
                        ? "Clic para ocultar de la tienda"
                        : "Clic para mostrar en la tienda"
                    }
                  >
                    {product.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <Eye className="h-3 w-3" aria-hidden="true" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        <EyeOff className="h-3 w-3" aria-hidden="true" /> Borrador
                      </span>
                    )}
                  </button>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`${ROUTES.adminProducts}/${product.id}/edit`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      aria-label="Editar producto"
                      title="Editar producto"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isLoading}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar producto"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
