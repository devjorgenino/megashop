/**
 * Página de listado de productos del admin.
 * Muestra todos los productos (activos e inactivos) en una tabla.
 */
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { ProductTable } from "./product-table";
import type { ProductWithCategory } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestionar Productos",
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // El admin ve TODOS los productos (activos e inactivos)
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  const count = (products ?? []).length;

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {count} {count !== 1 ? "productos" : "producto"} en total
          </p>
        </div>
        <Link
          href={`${ROUTES.adminProducts}/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Agregar Producto
        </Link>
      </div>

      {/* Tabla */}
      <div className="mt-6">
        <ProductTable
          products={(products as unknown as ProductWithCategory[]) ?? []}
        />
      </div>
    </div>
  );
}
