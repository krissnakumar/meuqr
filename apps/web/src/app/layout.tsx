import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-provider";

export const metadata: Metadata = {
  title: {
    default: "MeuQR - Páginas Inteligentes com QR Code",
    template: "%s | MeuQR",
  },
  description:
    "Crie páginas inteligentes com QR Code para seu negócio. Cardápios digitais, catálogos de produtos e muito mais.",
  keywords: [
    "QR Code",
    "cardápio digital",
    "catálogo online",
    "negócios",
    "Brasil",
    "MeuQR",
  ],
  openGraph: {
    title: "MeuQR - Páginas Inteligentes com QR Code",
    description:
      "Crie páginas inteligentes com QR Code para seu negócio.",
    type: "website",
    locale: "pt_BR",
    siteName: "MeuQR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
