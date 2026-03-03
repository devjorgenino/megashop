/**
 * Página de cuenta del usuario.
 * Muestra información del perfil y permite editar el nombre.
 */
import { requireAuth, getProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import Link from "next/link";
import { Package, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Cuenta",
};

export default async function AccountPage() {
  const user = await requireAuth();
  const profile = await getProfile();

  if (!profile) {
    redirect(ROUTES.login);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>

      {/* Enlaces rápidos */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.accountOrders}
          className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
        >
          <Package className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-gray-900">Mis Pedidos</p>
            <p className="text-xs text-gray-500">Ver tu historial de pedidos</p>
          </div>
        </Link>
        {profile.role === "admin" && (
          <Link
            href={ROUTES.admin}
            className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100"
          >
            <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-blue-900">Panel de Admin</p>
              <p className="text-xs text-blue-700">Gestionar productos y pedidos</p>
            </div>
          </Link>
        )}
      </div>

      {/* Formulario del perfil */}
      <div className="mt-8 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Información del Perfil
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Actualiza los datos de tu cuenta.
        </p>
        <div className="mt-6">
          <ProfileForm profile={profile} email={user.email || ""} />
        </div>
      </div>
    </div>
  );
}
