"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Truck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections: Array<{
  label: string;
  items: Array<{ href: string; label: string; icon: React.ElementType }>;
}> = [
  {
    label: "General",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operación",
    items: [
      { href: "/admin/orders", label: "Órdenes", icon: ClipboardList },
      { href: "/admin/payments", label: "Pagos", icon: Wallet },
      { href: "/admin/deliveries", label: "Entregas", icon: Truck },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/products", label: "Productos", icon: Boxes },
      { href: "/admin/billing", label: "Facturación", icon: Receipt },
    ],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/nav relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-luxury",
        active
          ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
          : "text-muted-foreground hover:bg-brand-orange/10 hover:text-brand-orange",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
      {active && (
        <span
          className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-md"
          aria-hidden
        />
      )}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden border-r border-border/60 bg-sidebar/95 backdrop-blur-xl lg:flex lg:w-64 lg:flex-col">
      <div className="border-b border-border/60 px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-lg shadow-brand-orange/30">
            <BadgeDollarSign className="h-5 w-5" aria-hidden />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              D&apos;Richard
            </p>
            <p className="text-sm font-black tracking-tight text-foreground">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/80">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Versión
        </p>
        <p className="text-sm font-bold">Admin · v1.0</p>
      </div>
    </aside>
  );
}
