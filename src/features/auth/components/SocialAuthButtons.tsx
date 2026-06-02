"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type Provider = "google" | "facebook";

export function SocialAuthButtons() {
  const [loading, setLoading] = useState<Provider | null>(null);

  async function handleSocialLogin(provider: Provider) {
    setLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
        setLoading(null);
      }
      // If no error the browser redirects — loading stays true intentionally.
    } catch {
      toast.error("No se pudo conectar con el proveedor.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        size="lg"
        onClick={() => handleSocialLogin("google")}
        disabled={loading !== null}
        aria-busy={loading === "google"}
        aria-label="Continuar con Google"
      >
        <GoogleIcon />
        {loading === "google" ? "Redirigiendo..." : "Continuar con Google"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        size="lg"
        onClick={() => handleSocialLogin("facebook")}
        disabled={loading !== null}
        aria-busy={loading === "facebook"}
        aria-label="Continuar con Facebook"
      >
        <FacebookIcon />
        {loading === "facebook" ? "Redirigiendo..." : "Continuar con Facebook"}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">
            o continúa con correo
          </span>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.5 30.1 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6c1.8-5.4 6.9-9.8 13.5-9.8z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8-6z"/>
      <path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.4 2.2-6.6 0-12.1-4.4-14.1-10.3l-8 6.1C6.6 42.5 14.7 48 24 48z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}
