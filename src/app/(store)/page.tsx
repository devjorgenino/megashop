/**
 * Home page — Orchid Store inspired e-commerce landing.
 * Server Component: fetches featured products and categories.
 */
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { getFeaturedProducts, getCategories } from "@/lib/products";
import { ProductGrid } from "@/components/products/product-grid";
import { getUser } from "@/lib/auth";
import { formatPriceVES } from "@/lib/utils";
import {
  ShoppingBag,
  Truck,
  Headphones,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  const [featuredProducts, categories, user] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getUser(),
  ]);

  // Get products with sale prices for the deals section
  const saleProducts = featuredProducts.filter(
    (p) => p.compare_at_price !== null && p.compare_at_price > p.price
  );

  return (
    <div className="bg-section-bg">
      {/* ===================== HERO SLIDER ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#1a3a8f]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-xl animate-fade-in">
            <span className="inline-block mb-4 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-900">
              Nueva Colección 2026
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              ¡Obtén 60% de descuento en artículos de regalo!
            </h1>
            <p className="mt-5 text-base text-white/70 max-w-md">
              Descubre nuestra colección exclusiva de productos premium. Compra las últimas tendencias a precios inmejorables.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={ROUTES.products}
                className="inline-flex items-center gap-2 rounded-full bg-accent hover:bg-accent-dark transition-colors px-7 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-accent/25"
              >
                Comprar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link
                  href={ROUTES.register}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Crear Cuenta
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PROMOTIONAL BANNERS ===================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 p-8 text-white group cursor-pointer">
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Oferta Limitada</p>
              <h3 className="mt-2 text-xl font-bold">40% de descuento en lentes de sol para mujer</h3>
              <Link
                href={ROUTES.products}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white underline underline-offset-4 hover:no-underline"
              >
                Aprovecha ahora <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 transform skew-x-[-12deg] translate-x-10 group-hover:translate-x-6 transition-transform"></div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 p-8 text-white group cursor-pointer">
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Oferta de Verano</p>
              <h3 className="mt-2 text-xl font-bold">Ropa de verano con 40% de descuento</h3>
              <Link
                href={ROUTES.products}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white underline underline-offset-4 hover:no-underline"
              >
                Comprar ahora <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 transform skew-x-[-12deg] translate-x-10 group-hover:translate-x-6 transition-transform"></div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED CATEGORIES ===================== */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Compra por Categoría</h2>
            <p className="mt-2 text-sm text-gray-500">Explora nuestras categorías populares</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(categories.length > 0 ? categories : defaultCategories).map(
              (cat, idx) => (
                <Link
                  key={cat.slug || idx}
                  href={`${ROUTES.products}?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <span className="text-2xl">{categoryIcons[idx % categoryIcons.length]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {cat.name}
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Productos Destacados</h2>
              <p className="mt-1 text-sm text-gray-500">Seleccionados para ti</p>
            </div>
            <Link
              href={ROUTES.products}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Ver Todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid
            products={featuredProducts.slice(0, 8)}
            emptyMessage="Productos próximamente. ¡Vuelve pronto!"
          />
        </div>
      </section>

      {/* ===================== SERVICES BAR ===================== */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/5">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Productos Originales
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Siempre vendemos productos auténticos y originales a nuestros clientes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/5">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Envío Express
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Recibe tus pedidos al día siguiente de realizar tu compra
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/5">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Soporte 24/7
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Nuestro equipo de soporte está listo para ayudarte en todo momento
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA BANNER ===================== */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-14 sm:px-16 text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider">Temporada de Ofertas</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
                Hasta 70% de descuento
              </h2>
              <p className="mt-3 text-sm text-gray-400 max-w-md mx-auto">
                Oferta por tiempo limitado. Compra ahora y ahorra en miles de productos en todas las categorías.
              </p>
              <Link
                href={ROUTES.products}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent hover:bg-accent-dark transition-colors px-8 py-3 text-sm font-semibold text-gray-900 shadow-lg"
              >
                Compra hoy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MORE PRODUCTS ===================== */}
      {featuredProducts.length > 4 && (
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Novedades</h2>
                <p className="mt-1 text-sm text-gray-500">Descubre nuestros productos más recientes</p>
              </div>
              <Link
                href={`${ROUTES.products}?sortBy=newest`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Ver Todo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductGrid
              products={featuredProducts.slice(0, 4)}
              emptyMessage="¡Nuevos productos próximamente!"
            />
          </div>
        </section>
      )}
    </div>
  );
}

// Fallback categories when DB is empty
const defaultCategories = [
  { name: "Electrónica", slug: "electronics" },
  { name: "Ropa", slug: "clothing" },
  { name: "Muebles", slug: "furniture" },
  { name: "Deportes", slug: "sports" },
  { name: "Belleza", slug: "beauty" },
  { name: "Alimentos", slug: "food" },
];

const categoryIcons = ["📱", "👗", "🪑", "⚽", "💄", "🍕"];
