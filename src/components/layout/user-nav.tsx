"use client";

/**
 * Navegación del usuario autenticado.
 * Avatar/nombre + dropdown menu.
 *
 * Accesibilidad: aria-haspopup, aria-expanded, role=menu, role=menuitem,
 * Escape key, aria-hidden en iconos decorativos.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { User, LogOut, Package, Shield, ChevronDown } from "lucide-react";
import { signOut } from "@/app/(store)/(auth)/actions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface UserNavProps {
  profile: Profile;
  email: string;
}

export function UserNav({ profile, email }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key to close
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="user-menu"
        aria-label={`Menú de ${profile.full_name || email}`}
      >
        {/* Avatar */}
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-7 w-7 rounded-full object-cover ring-2 ring-white/30"
            onError={(e) => {
              // Fallback to initials on image load error
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-gray-900",
            profile.avatar_url && "hidden"
          )}
          aria-hidden="true"
        >
          {initials}
        </div>
        <span className="hidden max-w-[120px] truncate lg:inline">
          {profile.full_name || email.split("@")[0]}
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 transition-transform lg:block",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="user-menu"
          role="menu"
          aria-label="Menú de usuario"
          className="absolute right-0 mt-2 w-56 z-50 rounded-lg border border-gray-200 bg-white py-1 shadow-xl ring-1 ring-black/5 animate-dropdown-enter"
        >
          {/* User info */}
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-medium text-gray-900">
              {profile.full_name || "Usuario"}
            </p>
            <p className="truncate text-xs text-gray-500">{email}</p>
            {profile.role === "admin" && (
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Administrador
              </span>
            )}
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href={ROUTES.account}
              onClick={closeMenu}
              role="menuitem"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              Mi Cuenta
            </Link>
            <Link
              href={ROUTES.accountOrders}
              onClick={closeMenu}
              role="menuitem"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              Mis Pedidos
            </Link>

            {/* Admin link */}
            {profile.role === "admin" && (
              <Link
                href={ROUTES.admin}
                onClick={closeMenu}
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                Panel Admin
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 py-1">
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
