/**
 * Página de login de administración — /admin/login
 * Diseño oscuro y minimalista. Sin header/footer público.
 * Redirige a /admin si ya está logueado como admin.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { Store, ShieldCheck } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { AdminLoginForm } from "./admin-login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Iniciar Sesión",
};

export default async function AdminLoginPage() {
  // ¿Ya es admin? Enviar al dashboard
  const profile = await getProfile();
  if (profile?.role === "admin") {
    redirect(ROUTES.admin);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <Store className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-gray-400">Panel de Administración</p>
        </div>

        {/* Tarjeta */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-300">
              Acceso restringido solo para administradores
            </p>
          </div>

          <AdminLoginForm />
        </div>

        {/* Volver a la tienda */}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link
            href={ROUTES.home}
            className="text-gray-400 underline-offset-4 hover:text-white hover:underline"
          >
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
