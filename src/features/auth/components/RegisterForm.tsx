"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";

export function RegisterForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", phone: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setSubmitError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName, phone: values.phone },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/api/auth/callback`
              : undefined,
        },
      });

      if (error) {
        setSubmitError(error.message);
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Cuenta creada");
        router.push("/tienda");
        router.refresh();
        return;
      }

      toast.success("Revisa tu correo para confirmar la cuenta.");
      router.push("/login");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No pudimos contactar el servidor. Revisa tu conexión.";
      setSubmitError(msg);
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-name">Nombre</Label>
        <Input
          id="reg-name"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "reg-name-error" : undefined}
          placeholder="Tu nombre"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p id="reg-name-error" role="alert" className="text-sm text-destructive">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-phone">Teléfono</Label>
        <Input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "reg-phone-error" : undefined}
          placeholder="Tu número de teléfono"
          {...register("phone")}
        />
        {errors.phone && (
          <p id="reg-phone-error" role="alert" className="text-sm text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Correo</Label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "reg-email-error" : undefined}
          placeholder="tu@correo.com"
          {...register("email")}
        />
        {errors.email && (
          <p id="reg-email-error" role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Contraseña</Label>
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "reg-password-error" : "reg-password-help"}
          {...register("password")}
        />
        {errors.password ? (
          <p id="reg-password-error" role="alert" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        ) : (
          <p id="reg-password-help" className="text-xs text-muted-foreground">
            Mínimo 8 caracteres, con letras y números.
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
