/**
 * Página para editar un producto existente.
 */
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/products";
import { ProductForm } from "../../product-form";
import type { Product } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Producto",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // El admin puede ver cualquier producto (incluso inactivos)
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
      <p className="mt-1 text-sm text-gray-500">
        Actualiza los detalles del producto a continuación.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <ProductForm
          product={product as unknown as Product}
          categories={categories}
        />
      </div>
    </div>
  );
}
