/**
 * Página de detalle de producto — estilo Orchid Store.
 * Server Component con ISR (datos del producto + productos relacionados).
 */
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { formatPrice, formatPriceVES, discountPercentage } from "@/lib/utils";
import { ProductGrid } from "@/components/products/product-grid";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { QuantitySelector } from "@/components/products/quantity-selector";
import { ChevronRight, Shield, Truck, RotateCcw } from "lucide-react";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) ?? "",
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.price;

  const discount = hasDiscount
    ? discountPercentage(product.price, product.compare_at_price!)
    : 0;

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category_id
  );

  const mainImage = product.images?.[0] ?? "/placeholder-product.svg";

  return (
    <div className="bg-section-bg min-h-screen">
      {/* Barra de navegación */}
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/products"
              className="hover:text-white transition-colors"
            >
              Tienda
            </Link>
            {product.categories && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link
                  href={`/products?category=${product.categories.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {product.categories.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90 truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Producto */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-sm">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 rounded-md bg-sale px-3 py-1.5 text-sm font-bold text-white shadow">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Miniaturas */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - Imagen ${i + 1}`}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex flex-col">
            {/* Categoría */}
            {product.categories && (
              <Link
                href={`/products?category=${product.categories.slug}`}
                className="mb-2 inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                {product.categories.name}
              </Link>
            )}

            {/* Nombre */}
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            {/* Precio USD */}
            <div className="mt-4 flex items-baseline gap-3">
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
              <span
                className={`text-3xl font-bold ${hasDiscount ? "text-sale" : "text-gray-900"}`}
              >
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="rounded-full bg-sale/10 px-3 py-1 text-sm font-medium text-sale">
                  Ahorras {formatPrice(product.compare_at_price! - product.price)}
                </span>
              )}
            </div>

            {/* Precio VES */}
            <p className="mt-1 text-sm text-gray-500">
              {formatPriceVES(product.price)}
              {hasDiscount && (
                <span className="ml-2 text-gray-400 line-through">
                  {formatPriceVES(product.compare_at_price!)}
                </span>
              )}
            </p>

            {/* Stock */}
            <div className="mt-4">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    {product.stock > 10
                      ? "En stock"
                      : `Solo quedan ${product.stock}`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-900">
                  Descripción
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
              <QuantitySelector productId={product.id} stock={product.stock} />
              <AddToCartButton
                productId={product.id}
                stock={product.stock}
                size="lg"
                className="w-full"
              />
            </div>

            {/* Garantías */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-200 pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Envío Gratis
                  </p>
                  <p className="text-xs text-gray-500">En pedidos +$50</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                  <RotateCcw className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Devoluciones
                  </p>
                  <p className="text-xs text-gray-500">30 días de garantía</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Pago Seguro
                  </p>
                  <p className="text-xs text-gray-500">100% protegido</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Productos Relacionados
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
