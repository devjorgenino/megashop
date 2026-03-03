/**
 * Layout for the public store routes.
 * Wraps Header (via LayoutShell) + Footer around all store pages.
 * Footer is async Server Component — lives here, not in LayoutShell (client).
 */
import { LayoutShell } from "@/components/layout/layout-shell";
import { Footer } from "@/components/layout/footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-section-bg">
      <LayoutShell>
        <main id="main-content" className="flex-1">{children}</main>
      </LayoutShell>
      <Footer />
    </div>
  );
}
