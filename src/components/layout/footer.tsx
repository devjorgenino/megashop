/**
 * Application footer — Orchid Store style.
 * Dark footer with multiple columns: About, Quick Links, Account, Categories.
 * Server Component — reads the user to show conditional links.
 *
 * Accesibilidad: semantic HTML, accessible social links, proper heading levels,
 * payment methods as labeled list.
 */
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { getUser } from "@/lib/auth";

export async function Footer() {
  const user = await getUser();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-footer-bg text-footer-text" role="contentinfo">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <p className="text-lg font-bold text-white mb-4">{APP_NAME}</p>
            <p className="text-sm leading-relaxed text-gray-400">
              Tu tienda en línea de moda, electrónica, muebles, deportes y más.
              Entregamos productos de calidad a precios inmejorables.
            </p>

            {/* Contact info */}
            <ul className="mt-6 space-y-3" aria-label="Información de contacto">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>Av. Libertador, Caracas, Venezuela</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                <span>+58 (212) 555-0199</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                <span>soporte@megashop.com</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                <span>Lun - Vie: 9AM - 9PM</span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="mt-6 flex gap-3" role="list" aria-label="Redes sociales">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                aria-label="Facebook"
                rel="noopener noreferrer"
              >
                <Facebook className="h-4 w-4 text-white" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                aria-label="Twitter"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4 text-white" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                aria-label="Instagram"
                rel="noopener noreferrer"
              >
                <Instagram className="h-4 w-4 text-white" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                aria-label="YouTube"
                rel="noopener noreferrer"
              >
                <Youtube className="h-4 w-4 text-white" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Enlaces Rápidos
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href={ROUTES.home}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.products}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  href={`${ROUTES.products}?sortBy=newest`}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Novedades
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.cart}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Carrito
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.products}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Más Vendidos
                </Link>
              </li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Mi Cuenta
            </p>
            <ul className="space-y-3">
              {user ? (
                <>
                  <li>
                    <Link
                      href={ROUTES.account}
                      className="text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.accountOrders}
                      className="text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                      Historial de Pedidos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.cart}
                      className="text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                      Carrito de Compras
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href={ROUTES.login}
                      className="text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.register}
                      className="text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                      Registrarse
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.cart}
                      className="text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                      Carrito de Compras
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Categorías
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`${ROUTES.products}?category=electronics`}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Electrónica
                </Link>
              </li>
              <li>
                <Link
                  href={`${ROUTES.products}?category=clothing`}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Ropa y Moda
                </Link>
              </li>
              <li>
                <Link
                  href={`${ROUTES.products}?category=furniture`}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Muebles
                </Link>
              </li>
              <li>
                <Link
                  href={`${ROUTES.products}?category=sports`}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Deportes y Fitness
                </Link>
              </li>
              <li>
                <Link
                  href={`${ROUTES.products}?category=beauty`}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Belleza y Salud
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {currentYear} {APP_NAME}. Todos los derechos reservados.
            </p>
            {/* Payment methods */}
            <ul className="flex items-center gap-3" aria-label="Métodos de pago aceptados">
              {["VISA", "MasterCard", "Pago Móvil", "Zelle"].map((method) => (
                <li key={method}>
                  <span className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-400">
                    {method}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
