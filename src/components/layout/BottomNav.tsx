"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/tienda", label: "Inicio", icon: Home },
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/carrito", label: "Carrito", icon: ShoppingBag },
  { href: "/cuenta", label: "Cuenta", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-xl pb-safe md:hidden"
      aria-label="Navegación inferior"
    >
      <div className="mx-auto flex h-17 max-w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/tienda"
              ? pathname === "/tienda"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center space-y-1 px-2 py-1"
            >
              <div
                className={cn(
                  "p-1.5 rounded-full transition-luxury",
                  isActive
                    ? "bg-brand-orange/15 text-brand-orange"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-luxury",
                  isActive ? "text-brand-orange opacity-100" : "text-muted-foreground opacity-70",
                )}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="absolute top-0 w-12 h-1 bg-brand-orange rounded-b-full animate-in fade-in zoom-in-75 duration-300" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
