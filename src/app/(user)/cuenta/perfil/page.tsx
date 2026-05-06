import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { getCurrentProfile, requireUser } from "@/infrastructure/auth/dal";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mi perfil",
  description: "Edita tu información personal.",
};

export default async function PerfilEditPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      <Link
        href="/cuenta"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-3 gap-2")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al panel
      </Link>

      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Mi perfil</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Mantén tus datos al día para que tus pedidos lleguen sin problemas.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-md">
        <ProfileForm
          email={user.email ?? ""}
          initial={{
            fullName: profile?.full_name ?? "",
            phone: profile?.phone ?? "",
          }}
        />
      </div>
    </div>
  );
}
