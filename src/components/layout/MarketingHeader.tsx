import Link from "next/link";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="transition-luxury hover:opacity-80">
          <BrandWordmark size="sm" inline />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link
            href="/tienda"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Tienda
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/25",
            )}
          >
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  );
}
