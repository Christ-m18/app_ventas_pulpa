import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { CompleteProfileForm } from "@/features/auth/components/CompleteProfileForm";
import { BRAND } from "@/lib/brand";
import { requireUser } from "@/infrastructure/auth/dal";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const metadata = {
  title: "Completa tu perfil",
  description: "Agrega tu teléfono para finalizar el registro.",
};

export default async function CompletarPerfilPage() {
  const user = await requireUser();

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.phone) {
    redirect("/tienda");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8 rounded-3xl glass p-8 shadow-2xl shadow-primary/10">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {BRAND.name}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight">
              Un último paso
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Necesitamos tu teléfono para coordinar entregas.
            </p>
          </div>

          <CompleteProfileForm />
        </div>
      </div>
    </div>
  );
}
