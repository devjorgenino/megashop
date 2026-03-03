"use client";

/**
 * Formulario de login de administración — tema oscuro.
 */
import { useActionState } from "react";
import { signInAdmin, type AdminLoginResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState<AdminLoginResult, FormData>(
    signInAdmin,
    {}
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="[&_label]:text-gray-300">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Correo electrónico"
          placeholder="admin@ejemplo.com"
          className="border-white/10 bg-white/5 text-white placeholder-gray-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
        />
      </div>

      <div className="[&_label]:text-gray-300">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          label="Contraseña"
          placeholder="••••••••"
          className="border-white/10 bg-white/5 text-white placeholder-gray-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
        />
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        className="w-full gap-2 bg-blue-600 hover:bg-blue-500"
      >
        {!isPending && <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
        {isPending ? "Iniciando sesión..." : "Entrar como Administrador"}
      </Button>
    </form>
  );
}
