import { Suspense } from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MfaChallengeForm } from "@/features/auth/components/MfaChallengeForm";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "Verificación en dos pasos",
  description: `Verifica tu identidad para acceder a ${BRAND.name}.`,
};

export default function MfaChallengePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8 rounded-3xl glass p-8 shadow-2xl shadow-primary/10">
          <header className="space-y-2 text-center">
            <h1 className="text-2xl font-black tracking-tight">Verificación</h1>
            <p className="text-sm text-muted-foreground">
              Tu cuenta tiene autenticación en dos pasos activa.
            </p>
          </header>

          <Suspense
            fallback={<p className="text-center text-sm text-muted-foreground">Cargando...</p>}
          >
            <MfaChallengeForm />
          </Suspense>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="/login" className="hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
