/**
 * Página de error global para la tienda.
 * Se muestra cuando un Server Component o Client Component falla.
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Store error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <AlertTriangle className="mx-auto h-16 w-16 text-amber-500" aria-hidden="true" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Algo salió mal
      </h1>
      <p className="mt-3 text-gray-500">
        Ocurrió un error inesperado. Por favor intenta de nuevo o vuelve a la
        página principal.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-gray-400 font-mono">
          Código: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={reset} variant="primary">
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Intentar de nuevo
        </Button>
        <Link
          href={ROUTES.home}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
}
