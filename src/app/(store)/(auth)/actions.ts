"use server";

/**
 * Server Actions de autenticación.
 * Invocadas desde Client Components (formularios).
 *
 * NOTA: signIn fue eliminado intencionalmente — el login ahora se maneja
 * completamente en el cliente en LoginForm usando supabase.auth.signInWithPassword(),
 * que dispara onAuthStateChange y actualiza el Header sin recargar la página.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

// Tipo de respuesta para acciones de autenticación
export type AuthResult = {
  error?: string;
  success?: boolean;
};

/**
 * Registro con email y contraseña.
 */
export async function signUp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    return { error: "El correo electrónico y la contraseña son obligatorios" };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
      // URL de redirección para confirmación de email
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase puede requerir confirmación de email
  return {
    success: true,
  };
}

/**
 * Login OAuth (Google, GitHub, etc.).
 * No es un form action estándar — devuelve la URL de redirección.
 */
export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "No se pudo iniciar el login con OAuth" };
}

/**
 * Cerrar sesión.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.home);
}
