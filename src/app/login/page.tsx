import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AtSign, Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { BRAND } from "@/lib/brand";
import { getSiteJpegPaths } from "@/lib/site-images";

export const metadata = {
  title: "Iniciar sesión",
  description: `Accede a tu cuenta de ${BRAND.name}.`,
};

export default function LoginPage() {
  const paths = getSiteJpegPaths();
  const sideImage = paths[Math.min(5, paths.length - 1)] ?? paths[0];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <div className="mx-auto grid w-full max-w-6xl flex-1 md:grid-cols-2">
        <aside className="relative hidden min-h-[280px] md:block">
          {sideImage ? (
            <Image
              src={sideImage}
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
          ) : (
            <div className="h-full bg-linear-to-br from-primary/80 via-primary/40 to-background" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/10" />
          <div className="grain absolute inset-0" />
          <div className="absolute bottom-10 left-8 right-8">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {BRAND.name}
            </p>
            <p className="mt-3 text-xl font-black leading-snug text-foreground">
              {BRAND.tagline}
            </p>
          </div>
        </aside>
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10">
          <div className="mx-auto w-full max-w-sm space-y-8 rounded-3xl glass p-8 shadow-2xl shadow-primary/10">
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                Iniciar sesión
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Entra para ver tus pedidos y comprar más rápido.
              </p>
            </div>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando...</p>}>
              <LoginForm />
            </Suspense>
            <a
              href={BRAND.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary transition-luxury hover:underline"
            >
              <AtSign className="h-4 w-4" />
              {BRAND.instagram.handle}
            </a>
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/" className="hover:underline">
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
