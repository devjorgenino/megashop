"use client";

/**
 * Formulario de registro con email/password.
 */
import { useActionState } from "react";
import { signUp, signInWithOAuth, type AuthResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
    signUp,
    {}
  );

  // Si el registro fue exitoso, mostrar mensaje de confirmación
  if (state.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800">
          ¡Revisa tu correo!
        </h3>
        <p className="mt-2 text-sm text-green-700">
          Te enviamos un enlace de confirmación. Por favor revisa tu bandeja de
          entrada y haz clic en el enlace para activar tu cuenta.
        </p>
        <Link
          href={ROUTES.login}
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Volver a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botones OAuth */}
      <div className="space-y-3">
        <form
          action={async () => {
            await signInWithOAuth("google");
          }}
        >
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="w-full"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </Button>
        </form>
      </div>

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">
            o regístrate con email
          </span>
        </div>
      </div>

      {/* Formulario Email/Password */}
      <form action={formAction} className="space-y-4">
        {/* Mensaje de error */}
        {state.error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <Input
          id="fullName"
          name="fullName"
          type="text"
          label="Nombre completo"
          placeholder="Juan Pérez"
          autoComplete="name"
          required
        />

        <Input
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@ejemplo.com"
          autoComplete="email"
          required
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          minLength={6}
          required
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
        >
          Crear Cuenta
        </Button>
      </form>

      {/* Enlace a login */}
      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
