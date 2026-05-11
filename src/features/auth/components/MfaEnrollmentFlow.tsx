"use client";
// Force recompile: 3.0

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Copy, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { totpEnrollSchema, type TotpEnrollInput } from "@/features/auth/schemas";

type Factor = { id: string; status: "verified" | "unverified"; friendly_name?: string | null };

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export function MfaEnrollmentFlow() {
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<TotpEnrollInput>({
    resolver: zodResolver(totpEnrollSchema),
    mode: "onTouched",
    defaultValues: { code: "" },
  });

  const refresh = useCallback(() => {
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (error) {
        // Silently handle 403/422 — session may be expired or factors in bad state
        console.warn("MFA listFactors error:", error.message);
        setFactors([]);
        return;
      }
      setFactors((data?.totp ?? []) as Factor[]);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.warn("MFA listFactors error:", error.message);
        setFactors([]);
        return;
      }
      setFactors((data?.totp ?? []) as Factor[]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function startEnrollment() {
    setBusy(true);
    try {
      // 1. Limpieza automática de factores no verificados para evitar errores 422 y clutter
      const { data: currentFactors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        toast.error("No se pudo verificar el estado de seguridad. Intenta cerrar sesión y volver a entrar.");
        return;
      }
      const unverifiedFactors = (currentFactors?.totp as unknown as Factor[] | undefined)?.filter(f => f.status === "unverified") || [];
      
      for (const factor of unverifiedFactors) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      // 2. Iniciar nuevo enrolamiento con nombre único
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator ${new Date().toLocaleString()}`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setEnroll({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setTimeout(() => setFocus("code"), 50);
    } catch {
      toast.error("Error al iniciar el proceso de seguridad");
    } finally {
      setBusy(false);
    }
  }

  async function cancelEnrollment() {
    if (!enroll) return;
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId: enroll.factorId });
    setBusy(false);
    setEnroll(null);
    reset();
    void refresh();
  }

  async function verifyEnrollment(values: TotpEnrollInput) {
    if (!enroll) return;
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enroll.factorId,
    });
    if (challengeError) {
      toast.error(challengeError.message);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: challenge.id,
      code: values.code,
    });
    if (verifyError) {
      toast.error(verifyError.message);
      return;
    }
    toast.success("Autenticador activado");
    setEnroll(null);
    reset();
    void refresh();
  }

  async function removeFactor(id: string) {
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Autenticador removido");
    void refresh();
  }

  const verified = factors?.filter((f) => f.status === "verified") ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="text-base font-semibold">Autenticación de dos factores (TOTP)</p>
            <p className="text-sm text-muted-foreground">
              Añade una capa extra. Cada inicio de sesión te pedirá el código de tu app
              (Google Authenticator, 1Password, Authy, Raycast).
            </p>
          </div>
        </div>
      </div>

      {factors === null ? (
        <p className="text-sm text-muted-foreground">Cargando autenticadores...</p>
      ) : verified.length > 0 ? (
        <ul className="space-y-2">
          {verified.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">{f.friendly_name ?? "Autenticador"}</p>
                  <p className="text-xs text-muted-foreground">Activo</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFactor(f.id)}
                disabled={busy}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-500" aria-hidden />
          <p>Aún no tienes autenticador. Activa uno para proteger tu cuenta.</p>
        </div>
      )}

      {!enroll && (
        <Button onClick={startEnrollment} disabled={busy} size="lg" className="w-full sm:w-auto">
          Añadir autenticador
        </Button>
      )}

      {enroll && (
        <form
          onSubmit={handleSubmit(verifyEnrollment)}
          noValidate
          className="space-y-5 rounded-2xl border border-border/60 bg-card p-6"
        >
          <div>
            <h3 className="text-base font-semibold">Escanea el código QR</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Abre tu app autenticadora y escanea este código. Luego ingresa los 6 dígitos.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="rounded-2xl bg-white p-3 shadow-lg shadow-primary/10">
              <Image
                src={enroll.qrCode}
                alt="Código QR de autenticación"
                width={192}
                height={192}
                className="h-48 w-48"
                unoptimized
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="mfa-secret" className="text-xs uppercase tracking-wider">
                  Clave manual
                </Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <Input
                    id="mfa-secret"
                    readOnly
                    value={enroll.secret}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Copiar clave"
                    onClick={() => {
                      navigator.clipboard.writeText(enroll.secret);
                      toast.success("Clave copiada");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mfa-enroll-code">Código de 6 dígitos</Label>
            <Input
              id="mfa-enroll-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="text-center text-2xl font-bold tracking-[0.5em]"
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? "mfa-enroll-code-error" : undefined}
              {...register("code")}
            />
            {errors.code && (
              <p id="mfa-enroll-code-error" role="alert" className="text-sm text-destructive">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={cancelEnrollment} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || busy}>
              {isSubmitting ? "Verificando..." : "Activar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
