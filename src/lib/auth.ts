/**
 * Authentication helpers for the server.
 * Used in Server Components, Server Actions, and Route Handlers.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types/database";
import type { Profile } from "@/types";

/**
 * Returns the currently authenticated user.
 * Returns null if there is no session.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the authenticated user's profile (includes role).
 * Returns null if there is no session or no profile found.
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data) return null;

  // Safe cast: the query returns profile columns
  return data as unknown as Profile;
}

/**
 * Requires the user to be authenticated.
 * Redirects to /login if there is no session.
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect(ROUTES.login);
  }
  return user;
}

/**
 * Requires the user to be an admin.
 * Redirects to / if the user is not an admin.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    redirect(ROUTES.home);
  }
  return profile;
}

/**
 * Checks whether the user has a specific role.
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const profile = await getProfile();
  return profile?.role === role;
}
