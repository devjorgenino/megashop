/**
 * Supabase client for MIDDLEWARE.
 * Needs request/response to read and write cookies.
 * Used to refresh session tokens on every request.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // /admin/login is public — skip all admin checks for it
  const isAdminLogin = pathname === "/admin/login";

  // ── Store protected routes: redirect to /login ────────────────────────────
  const storeProtectedPaths = ["/checkout", "/account"];
  const isStoreProtected = storeProtectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isStoreProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin routes (except /admin/login): redirect to /admin/login ──────────
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<{ role: string }>();

    if (profile?.role !== "admin") {
      // Logged in but not admin → back to store home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}
