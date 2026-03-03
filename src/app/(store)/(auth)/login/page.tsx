/**
 * Página de inicio de sesión.
 * Server Component que renderiza el formulario de login.
 */
import { LoginForm } from "../login-form";
import { APP_NAME } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  // Ya autenticado — redirigir
  const user = await getUser();
  if (user) {
    redirect("/");
  }

  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-section-bg">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Iniciar sesión en {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            ¡Bienvenido de vuelta! Inicia sesión para continuar comprando.
          </p>
        </div>

        <div className="mt-8">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
