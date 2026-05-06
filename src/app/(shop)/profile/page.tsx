import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { OrderHistory } from "@/features/profile/components/OrderHistory";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "Mi Perfil",
  description: `Gestiona tu cuenta y pedidos en ${BRAND.name}.`,
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 sm:px-6 md:py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Gestiona tu información personal y revisa tu historial de compras.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Datos Personales</h2>
            <ProfileForm 
              email={user.email || ""} 
              initial={{ 
                fullName: profile?.full_name || "", 
                phone: profile?.phone || "" 
              }} 
            />
          </div>
        </div>

        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <h2 className="text-lg font-semibold">Historial de Pedidos</h2>
          <OrderHistory />
        </div>
      </div>
    </div>
  );
}
