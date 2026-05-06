import Link from "next/link";
import { CloudOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Sin conexión",
  description: "Estás sin conexión. Vuelve a conectarte para seguir comprando.",
};

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl glass">
        <CloudOff className="h-8 w-8 text-primary" aria-hidden />
      </div>
      <h1 className="mt-6 text-3xl font-black tracking-tight md:text-4xl">Sin conexión</h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground md:text-base">
        No pudimos contactar el servidor. Revisa tu internet y vuelve a intentarlo.
        Mientras tanto, sigues teniendo acceso al contenido cacheado de {BRAND.name}.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-8 rounded-2xl px-8")}
      >
        Reintentar
      </Link>
    </main>
  );
}
