import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/system/ServiceWorkerRegistrar";
import { CartSyncProvider } from "@/features/cart/components/CartSyncProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700", "900"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} | Pulpas naturales en RD`,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.tagline} Tienda en línea y novedades en ${BRAND.instagram.handle}.`,
  manifest: "/manifest.json",
  metadataBase: new URL("https://richardpulpas.com"),
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: BRAND.name,
    title: BRAND.name,
    description: BRAND.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1a1410" },
    { media: "(prefers-color-scheme: light)", color: "#fff7ed" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <div className="mx-auto flex min-h-screen w-full max-w-full flex-col overflow-x-hidden md:max-w-5xl md:px-6 lg:max-w-6xl lg:px-8 xl:max-w-7xl 2xl:px-10">
          <QueryProvider>
            <CartSyncProvider>{children}</CartSyncProvider>
            <Toaster position="top-center" richColors />
          </QueryProvider>
          <ServiceWorkerRegistrar />
        </div>
      </body>
    </html>
  );
}
