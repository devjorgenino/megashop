"use client";

/**
 * Barra lateral de administración.
 * Sidebar oscuro con logo, items de navegación agrupados por sección, e info del usuario abajo.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { signOut } from "@/app/(store)/(auth)/actions";

const navItems = [
  {
    label: "Panel",
    href: ROUTES.admin,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Productos",
    href: ROUTES.adminProducts,
    icon: Package,
    exact: false,
  },
  {
    label: "Pedidos",
    href: ROUTES.adminOrders,
    icon: ShoppingBag,
    exact: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, profile } = useUser();

  // Cerrar sidebar móvil con la tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
        <Link href={ROUTES.admin} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <Store className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{APP_NAME}</p>
            <p className="text-[10px] font-medium text-blue-300 uppercase tracking-widest leading-tight">
              Admin
            </p>
          </div>
        </Link>
        {/* Botón cerrar — solo móvil */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="rounded-lg p-1 text-gray-400 hover:bg-white/10 lg:hidden"
          aria-label="Cerrar menú de administración"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Navegación de administración">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Menú
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                {item.label}
              </span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      {/* Volver a la tienda */}
      <div className="px-3 pb-2">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <Store className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          Volver a la Tienda
        </Link>
      </div>

      {/* Info del usuario */}
      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          {/* Iniciales del avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            {(profile?.full_name || user?.email || "A")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white leading-tight">
              {profile?.full_name || "Admin"}
            </p>
            <p className="truncate text-xs text-gray-400 leading-tight">
              {user?.email || ""}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón toggle móvil */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-gray-900 p-2 shadow-lg lg:hidden"
        aria-label="Abrir menú de administración"
        aria-expanded={isMobileOpen}
        aria-controls="admin-sidebar"
      >
        <Menu className="h-5 w-5 text-white" aria-hidden="true" />
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="Barra lateral de administración"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 transition-transform duration-200 lg:static lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
