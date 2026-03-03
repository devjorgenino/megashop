"use server";

/**
 * Server Action para login de administración.
 * Valida credenciales y verifica que el usuario tenga role = 'admin'.
 * Si el usuario existe pero no es admin, cierra su sesión y devuelve un error.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

export type AdminLoginResult = {
  error?: string;
};

export async function signInAdmin(
  _prevState: AdminLoginResult,
  formData: FormData
): Promise<AdminLoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "El correo electrónico y la contraseña son obligatorios" };
  }

  const supabase = await createClient();

  // Autenticar
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: "Credenciales inválidas" };
  }

  // Verificar que el usuario sea admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Error de autenticación" };
  }

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // No es admin — cerrar sesión inmediatamente
    await supabase.auth.signOut();
    return { error: "Acceso denegado. Se requieren privilegios de administrador." };
  }

  redirect(ROUTES.admin);
}
