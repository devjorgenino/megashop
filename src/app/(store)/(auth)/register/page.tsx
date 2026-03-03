/**
 * Página de registro.
 */
import { RegisterForm } from "../register-form";
import { APP_NAME } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta",
};

export default async function RegisterPage() {
  // Ya autenticado — redirigir
  const user = await getUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-section-bg">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Crea tu cuenta en {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Únete y comienza a comprar hoy.
          </p>
        </div>

        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
