"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/features/profile/schemas";

type Props = {
  email: string;
  initial: { fullName: string; phone: string };
};

export function ProfileForm({ email, initial }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    mode: "onTouched",
    defaultValues: { fullName: initial.fullName, phone: initial.phone },
  });

  async function onSubmit(values: ProfileUpdateInput) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = typeof json?.error === "string" ? json.error : "No se pudo guardar";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Perfil actualizado");
      router.refresh();
    } catch {
      const msg = "No pudimos contactar el servidor.";
      setSubmitError(msg);
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="profile-email">Correo</Label>
        <Input id="profile-email" value={email} disabled readOnly />
        <p className="text-xs text-muted-foreground">
          El correo se gestiona desde la sección de seguridad.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-name">Nombre completo</Label>
        <Input
          id="profile-name"
          autoComplete="name"
          pattern="[a-zA-ZÀ-ÿ\s'.\\-]+"
          maxLength={80}
          placeholder="Tu nombre completo"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "profile-name-error" : undefined}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p id="profile-name-error" role="alert" className="text-sm text-destructive">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-phone">Teléfono (WhatsApp)</Label>
        <PhoneInput
          id="profile-phone"
          maxLength={20}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "profile-phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p id="profile-phone-error" role="alert" className="text-sm text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          size="lg"
          className="bg-brand-orange text-white hover:bg-brand-orange/90"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" aria-hidden />
              Guardar cambios
            </>
          )}
        </Button>
        {isDirty && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => reset()}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
