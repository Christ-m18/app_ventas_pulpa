import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export function AdminTopbar({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl supports-backdrop-filter:bg-background/70 lg:px-8">
      <Link
        href="/tienda"
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-luxury hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver a la tienda
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden text-right leading-tight md:block">
          <p className="text-sm font-bold">{displayName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-lime/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-lime">
          <ShieldCheck className="h-3 w-3" aria-hidden />
          Admin
        </span>
        <LogoutButton variant="outline" />
      </div>
    </header>
  );
}
