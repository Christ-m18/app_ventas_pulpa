"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Truck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Órdenes", icon: ClipboardList },
  { href: "/admin/payments", label: "Pagos", icon: Wallet },
  { href: "/admin/deliveries", label: "Entregas", icon: Truck },
  { href: "/admin/products", label: "Productos", icon: Boxes },
  { href: "/admin/billing", label: "Reportes", icon: Receipt },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="sticky bottom-0 z-30 flex items-stretch gap-1 overflow-x-auto border-t border-border/60 bg-background/95 px-2 py-2 backdrop-blur-xl scrollbar-hide lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-w-fit flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-luxury",
              active
                ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
