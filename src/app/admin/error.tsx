/**
 * Página de error del panel de administración.
 */
"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <AlertTriangle
        className="mx-auto h-16 w-16 text-amber-500"
        aria-hidden="true"
      />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Error en el Panel
      </h1>
      <p className="mt-3 text-gray-500">
        Ocurrió un error inesperado. Por favor intenta de nuevo.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-gray-400 font-mono">
          Código: {error.digest}
        </p>
      )}
      <div className="mt-8">
        <Button onClick={reset} variant="primary">
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}
