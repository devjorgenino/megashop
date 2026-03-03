/**
 * Página para crear un nuevo producto.
 */
import { getCategories } from "@/lib/products";
import { ProductForm } from "../product-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuevo Producto",
};

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
      <p className="mt-1 text-sm text-gray-500">
        Completa los detalles para crear un nuevo producto.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
