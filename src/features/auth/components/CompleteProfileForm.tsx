"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  completeProfileSchema,
  type CompleteProfileInput,
} from "@/features/auth/schemas";

export function CompleteProfileForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    mode: "onTouched",
    defaultValues: { phone: "" },
  });

  async function onSubmit(values: CompleteProfileInput) {
    setSubmitError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ phone: values.phone })
        .eq("id", user.id);

      if (error) {
        setSubmitError(error.message);
        toast.error(error.message);
        return;
      }

      toast.success("Perfil completado");
      router.push("/tienda");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al guardar. Intenta de nuevo.";
      setSubmitError(msg);
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="complete-phone">Teléfono</Label>
        <PhoneInput
          id="complete-phone"
          maxLength={20}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "complete-phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p id="complete-phone-error" role="alert" className="text-sm text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Guardando..." : "Continuar"}
      </Button>
    </form>
  );
}
