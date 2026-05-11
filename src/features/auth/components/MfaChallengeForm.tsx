"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { totpEnrollSchema, type TotpEnrollInput } from "@/features/auth/schemas";

const SAFE_NEXT = /^\/(?!\/)[^?#]*$/;

export function MfaChallengeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const safeNext = next && SAFE_NEXT.test(next) ? next : "/tienda";

  const [factorId, setFactorId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<TotpEnrollInput>({
    resolver: zodResolver(totpEnrollSchema),
    mode: "onTouched",
    defaultValues: { code: "" },
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Wait for session to be available
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        // Session not ready yet — listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, sess) => {
            if (cancelled) return;
            if (sess) {
              subscription.unsubscribe();
              const { data, error } = await supabase.auth.mfa.listFactors();
              if (cancelled) return;
              if (error) { setLoadError(error.message); return; }
              const verified = data?.totp?.find((f) => f.status === "verified");
              if (!verified) { setLoadError("No tienes un autenticador TOTP verificado."); return; }
              setFactorId(verified.id);
              setFocus("code");
            }
          }
        );
        return;
      }

      const { data, error } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (error) { setLoadError(error.message); return; }
      const verified = data?.totp?.find((f) => f.status === "verified");
      if (!verified) { setLoadError("No tienes un autenticador TOTP verificado."); return; }
      setFactorId(verified.id);
      setFocus("code");
    }

    void init();
    return () => { cancelled = true; };
  }, [setFocus]);

  async function onSubmit(values: TotpEnrollInput) {
    if (!factorId) return;
    setSubmitError(null);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setSubmitError(challengeError.message);
      toast.error(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: values.code,
    });

    if (verifyError) {
      setSubmitError(verifyError.message);
      toast.error(verifyError.message);
      return;
    }

    toast.success("Identidad verificada");
    router.replace(safeNext);
    router.refresh();
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl glass p-4">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Ingresa el código de 6 dígitos de tu app autenticadora.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mfa-code">Código</Label>
        <Input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? "mfa-code-error" : undefined}
          className="text-center text-2xl font-bold tracking-[0.5em]"
          {...register("code")}
        />
        {errors.code && (
          <p id="mfa-code-error" role="alert" className="text-sm text-destructive">
            {errors.code.message}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !factorId}>
        {isSubmitting ? "Verificando..." : "Verificar"}
      </Button>
    </form>
  );
}
