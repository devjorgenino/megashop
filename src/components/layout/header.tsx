"use client";

/**
 * Main application header — Orchid Store style.
 * 3 rows: top bar, main header (logo + search + cart), navigation bar.
 *
 * Accesibilidad:
 * - Dropdowns con soporte de teclado (Enter, Escape, flechas)
 * - Mobile menu con focus trap y Escape para cerrar
 * - aria-expanded, aria-haspopup, aria-label en todos los controles
 * - aria-hidden en iconos decorativos
 * - Navegación con aria-label para distinguir desktop/mobile
 */
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Heart,
  Phone,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/hooks/use-user";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { CartBadge } from "@/components/cart/cart-badge";

// Categorías compartidas entre desktop y mobile
const CATEGORIES = [
  { slug: "electronics", label: "Electrónica" },
  { slug: "clothing", label: "Ropa y Moda" },
  { slug: "furniture", label: "Muebles" },
  { slug: "sports", label: "Deportes y Fitness" },
  { slug: "beauty", label: "Belleza y Salud" },
  { slug: "food", label: "Alimentos y Bebidas" },
] as const;

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const { user, profile, isLoading } = useUser();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDeptOpen(false);
      }
      if (
        catDropdownRef.current &&
        !catDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Escape key handler for dropdowns and mobile menu ─────────────────────
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          mobileToggleRef.current?.focus();
        }
        if (isDeptOpen) setIsDeptOpen(false);
        if (isCatOpen) setIsCatOpen(false);
        if (isSearchOpen) setIsSearchOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen, isDeptOpen, isCatOpen, isSearchOpen]);

  // ── Focus trap for mobile menu ───────────────────────────────────────────
  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return;

    const menu = mobileMenuRef.current;
    const focusableEls = menu.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    // Focus first element when menu opens
    firstEl?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    }

    menu.addEventListener("keydown", handleTab);
    return () => menu.removeEventListener("keydown", handleTab);
  }, [isMobileMenuOpen]);

  // ── Prevent body scroll when mobile menu is open ─────────────────────────
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50" role="banner">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-9 items-center justify-between">
            {/* Left: Auth links */}
            <div className="flex items-center gap-4">
              {user ? (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" aria-hidden="true" />
                  Bienvenido/a, {profile?.full_name || "Usuario"}
                </span>
              ) : (
                <Link
                  href={ROUTES.login}
                  className="hover:text-accent transition-colors"
                >
                  Iniciar Sesión / Registrarse
                </Link>
              )}
              <Link
                href={ROUTES.products}
                className="hidden sm:inline-flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Heart className="h-3 w-3" aria-hidden="true" />
                Favoritos
              </Link>
            </div>

            {/* Right: Contact info */}
            <div className="hidden md:flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden="true" />
                +58 (212) 555-0199
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                Ubicar Tienda
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[70px] items-center justify-between gap-6">
            {/* Logo */}
            <Link href={ROUTES.home} className="flex-shrink-0">
              <span className="text-2xl font-bold tracking-tight text-white">
                {APP_NAME}
              </span>
            </Link>

            {/* Search bar (desktop) */}
            <div className="hidden flex-1 max-w-2xl md:block">
              <form
                action={ROUTES.products}
                method="GET"
                role="search"
                aria-label="Buscar productos"
              >
                <div className="relative">
                  <label htmlFor="desktop-search" className="sr-only">
                    Buscar productos
                  </label>
                  <input
                    id="desktop-search"
                    type="search"
                    name="search"
                    placeholder="Buscar productos..."
                    className="w-full rounded-full bg-white py-2.5 pl-5 pr-12 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-accent hover:bg-accent-dark transition-colors p-2"
                    aria-label="Buscar"
                  >
                    <Search className="h-4 w-4 text-gray-800" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Search trigger (mobile) */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden rounded-lg p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={isSearchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
                aria-expanded={isSearchOpen}
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Cart */}
              <Link
                href={ROUTES.cart}
                className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Carrito de compras"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                <CartBadge />
                <span className="hidden lg:inline text-sm" aria-hidden="true">
                  Carrito
                </span>
              </Link>

              {/* Auth */}
              {isLoading ? (
                <div
                  className="h-8 w-8 animate-pulse rounded-full bg-white/20"
                  aria-hidden="true"
                />
              ) : user && profile ? (
                <UserNav profile={profile} email={user.email || ""} />
              ) : (
                <Link
                  href={ROUTES.login}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full bg-accent hover:bg-accent-dark transition-colors px-5 py-2 text-sm font-medium text-gray-900"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  Ingresar
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                ref={mobileToggleRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden rounded-lg p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={
                  isMobileMenuOpen
                    ? "Cerrar menú de navegación"
                    : "Abrir menú de navegación"
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-3">
            <form
              action={ROUTES.products}
              method="GET"
              role="search"
              aria-label="Buscar productos"
            >
              <div className="relative">
                <label htmlFor="mobile-search" className="sr-only">
                  Buscar productos
                </label>
                <input
                  id="mobile-search"
                  type="search"
                  name="search"
                  placeholder="Buscar productos..."
                  className="w-full rounded-full bg-white py-2.5 pl-5 pr-12 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-accent p-2"
                  aria-label="Buscar"
                >
                  <Search
                    className="h-4 w-4 text-gray-800"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Navigation Bar (desktop) */}
      <nav
        className="hidden lg:block bg-white border-b border-gray-200 shadow-sm"
        aria-label="Navegación principal"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Departments dropdown */}
            <div className="relative" ref={deptDropdownRef}>
              <button
                onClick={() => {
                  setIsDeptOpen(!isDeptOpen);
                  setIsCatOpen(false);
                }}
                className="flex items-center gap-2 bg-accent hover:bg-accent-dark transition-colors px-5 py-3.5 text-sm font-semibold text-gray-900"
                aria-expanded={isDeptOpen}
                aria-haspopup="true"
                aria-controls="dept-menu"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                Todos los Departamentos
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 ml-4 transition-transform",
                    isDeptOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
              {isDeptOpen && (
                <ul
                  id="dept-menu"
                  role="menu"
                  className="absolute top-full left-0 z-50 w-64 rounded-lg bg-white border border-gray-200 shadow-xl ring-1 ring-black/5 animate-dropdown-enter overflow-hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <li key={cat.slug} role="none">
                      <Link
                        href={`${ROUTES.products}?category=${cat.slug}`}
                        role="menuitem"
                        className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => setIsDeptOpen(false)}
                      >
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Main nav links */}
            <div className="flex items-center gap-0">
              <Link
                href={ROUTES.home}
                className="px-4 py-3.5 text-sm font-medium text-gray-800 hover:text-primary transition-colors uppercase tracking-wide"
              >
                Inicio
              </Link>
              <Link
                href={ROUTES.products}
                className="px-4 py-3.5 text-sm font-medium text-gray-800 hover:text-primary transition-colors uppercase tracking-wide"
              >
                Tienda
              </Link>

              {/* Categories dropdown */}
              <div className="relative" ref={catDropdownRef}>
                <button
                  onClick={() => {
                    setIsCatOpen(!isCatOpen);
                    setIsDeptOpen(false);
                  }}
                  className="flex items-center gap-1 px-4 py-3.5 text-sm font-medium text-gray-800 hover:text-primary transition-colors uppercase tracking-wide"
                  aria-expanded={isCatOpen}
                  aria-haspopup="true"
                  aria-controls="cat-menu"
                >
                  Categorías
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isCatOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isCatOpen && (
                  <ul
                    id="cat-menu"
                    role="menu"
                    className="absolute top-full left-0 z-50 w-48 rounded-lg bg-white border border-gray-200 shadow-xl ring-1 ring-black/5 animate-dropdown-enter overflow-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <li key={cat.slug} role="none">
                        <Link
                          href={`${ROUTES.products}?category=${cat.slug}`}
                          role="menuitem"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors border-b border-gray-100 last:border-b-0"
                          onClick={() => setIsCatOpen(false)}
                        >
                          {cat.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link
                href={ROUTES.products}
                className="px-4 py-3.5 text-sm font-medium text-gray-800 hover:text-primary transition-colors uppercase tracking-wide"
              >
                Novedades
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[999] lg:hidden transition-opacity",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className={cn(
            "absolute top-0 right-0 w-[320px] max-w-[85vw] h-full bg-white overflow-y-auto transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Close button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-lg font-bold text-primary">{APP_NAME}</span>
            <button
              onClick={closeMobileMenu}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              aria-label="Cerrar menú de navegación"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="px-5 py-3" aria-label="Navegación móvil">
            <Link
              href={ROUTES.home}
              className="block py-3 text-sm font-medium text-gray-800 border-b border-gray-100"
              onClick={closeMobileMenu}
            >
              Inicio
            </Link>
            <Link
              href={ROUTES.products}
              className="block py-3 text-sm font-medium text-gray-800 border-b border-gray-100"
              onClick={closeMobileMenu}
            >
              Tienda
            </Link>

            {/* Category links */}
            <p className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Categorías
            </p>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`${ROUTES.products}?category=${cat.slug}`}
                className="block py-3 text-sm text-gray-600 border-b border-gray-100 pl-3"
                onClick={closeMobileMenu}
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Auth section */}
          <div className="px-5 py-4 border-t border-gray-100">
            {user && profile ? (
              <>
                <Link
                  href={ROUTES.account}
                  className="block py-2 text-sm text-gray-700 hover:text-primary transition-colors"
                  onClick={closeMobileMenu}
                >
                  Mi Cuenta
                </Link>
                <Link
                  href={ROUTES.accountOrders}
                  className="block py-2 text-sm text-gray-700 hover:text-primary transition-colors"
                  onClick={closeMobileMenu}
                >
                  Mis Pedidos
                </Link>
                {profile.role === "admin" && (
                  <Link
                    href={ROUTES.admin}
                    className="block py-2 text-sm text-gray-700 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Panel Admin
                  </Link>
                )}
              </>
            ) : (
              <Link
                href={ROUTES.login}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                onClick={closeMobileMenu}
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
