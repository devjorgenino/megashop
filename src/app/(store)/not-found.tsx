/**
 * Página 404 personalizada para la tienda.
 */
import Link from "next/link";
import { SearchX } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function StoreNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <SearchX className="mx-auto h-16 w-16 text-gray-300" aria-hidden="true" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Página no encontrada
      </h1>
      <p className="mt-3 text-gray-500">
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Ir al Inicio
        </Link>
        <Link
          href={ROUTES.products}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Ver Productos
        </Link>
      </div>
    </div>
  );
}
