import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} antialiased`}>
        {/* Skip to content — WCAG 2.4.1 Bypass Blocks */}
        <a href="#main-content" className="skip-to-content">
          Saltar al contenido principal
        </a>

        {/* Global aria-live region for announcements */}
        <div
          id="announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {children}
      </body>
    </html>
  );
}
