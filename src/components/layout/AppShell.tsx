"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { BrandFooter } from "@/components/layout/BrandFooter";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { SearchBar } from "@/components/layout/SearchBar";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { cn } from "@/lib/utils";

const desktopLinks = [
  { href: "/tienda", label: "Inicio", icon: Home },
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/carrito", label: "Carrito", icon: ShoppingBag },
  { href: "/cuenta", label: "Cuenta", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <header className="hidden md:block sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-backdrop-filter:bg-background/70">
        <div className="flex flex-wrap items-center gap-4 py-3 md:py-4">
          <Link href="/tienda" className="shrink-0 transition-luxury hover:opacity-80">
            <BrandWordmark size="md" inline />
          </Link>

          <Suspense fallback={null}>
            <SearchBar className="mx-2 max-w-xl flex-1" />
          </Suspense>

          <nav
            className="flex items-center gap-1 sm:gap-2"
            aria-label="Principal"
          >
            {desktopLinks.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/tienda"
                  ? pathname === "/tienda"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-luxury",
                    active
                      ? "bg-brand-orange/15 text-brand-orange"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Mobile-only top bar with search */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/tienda" className="shrink-0">
            <BrandWordmark size="sm" inline />
          </Link>
          <CartDrawer />
        </div>
        <Suspense fallback={null}>
          <SearchBar className="mt-2.5" />
        </Suspense>
      </header>

      <main className="flex min-h-0 flex-1 flex-col pb-20 md:pb-8">{children}</main>

      <BrandFooter />

      <BottomNav />
    </>
  );
}
