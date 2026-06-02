# Social Auth — Google + Facebook

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar botones de "Continuar con Google" y "Continuar con Facebook" en las páginas de login y registro, con redirección a completar el teléfono en el primer login OAuth.

**Architecture:** Se usa el flujo PKCE nativo de Supabase (`signInWithOAuth`). El callback `/api/auth/callback` ya existe y maneja `exchangeCodeForSession`; se extiende para consultar si el perfil tiene teléfono y redirigir a `/completar-perfil` si no. Los botones sociales se encapsulan en un componente compartido `SocialAuthButtons`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth (`@supabase/ssr`), Zod v4, react-hook-form, shadcn/ui, sonner, Vitest + Testing Library

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Crear | `src/features/auth/components/SocialAuthButtons.tsx` |
| Crear | `src/features/auth/components/SocialAuthButtons.test.tsx` |
| Crear | `src/features/auth/components/CompleteProfileForm.tsx` |
| Crear | `src/features/auth/components/CompleteProfileForm.test.tsx` |
| Crear | `src/app/completar-perfil/page.tsx` |
| Modificar | `src/features/auth/schemas.ts` |
| Modificar | `src/features/auth/components/LoginForm.tsx` |
| Modificar | `src/features/auth/components/RegisterForm.tsx` |
| Modificar | `src/app/api/auth/callback/route.ts` |
| Crear | `.env.example` |
| Modificar | `README.md` |

---

## Task 1: Agregar `completeProfileSchema` a schemas.ts

**Files:**
- Modify: `src/features/auth/schemas.ts`

- [ ] **Step 1: Agregar el schema y su tipo exportado**

En `src/features/auth/schemas.ts`, añadir al final del archivo (después de `TotpEnrollInput`):

```ts
export const completeProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, { error: "Teléfono debe tener al menos 10 dígitos." })
    .max(20, { error: "Teléfono demasiado largo." })
    .regex(/^[\d\s\-+()]+$/, { error: "Formato inválido." }),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/schemas.ts
git commit -m "feat(auth): agregar completeProfileSchema para teléfono OAuth"
```

---

## Task 2: Crear componente `SocialAuthButtons`

**Files:**
- Create: `src/features/auth/components/SocialAuthButtons.tsx`
- Create: `src/features/auth/components/SocialAuthButtons.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/features/auth/components/SocialAuthButtons.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SocialAuthButtons } from "./SocialAuthButtons";

const mockSignInWithOAuth = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  },
}));

describe("SocialAuthButtons", () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockReset();
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  it("renders Google and Facebook buttons", () => {
    render(<SocialAuthButtons />);
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /facebook/i })).toBeInTheDocument();
  });

  it("calls signInWithOAuth with google when Google button is clicked", async () => {
    render(<SocialAuthButtons />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      );
    });
  });

  it("calls signInWithOAuth with facebook when Facebook button is clicked", async () => {
    render(<SocialAuthButtons />);
    fireEvent.click(screen.getByRole("button", { name: /facebook/i }));
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "facebook" })
      );
    });
  });

  it("disables both buttons while a provider is loading", async () => {
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<SocialAuthButtons />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /facebook/i })).toBeDisabled();
    });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

```bash
npm test -- SocialAuthButtons.test
```

Expected: FAIL — "Cannot find module './SocialAuthButtons'"

- [ ] **Step 3: Implementar `SocialAuthButtons`**

Crear `src/features/auth/components/SocialAuthButtons.tsx`:

```tsx
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
      // Si no hay error el browser redirige; loading permanece activo.
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
```

- [ ] **Step 4: Correr los tests**

```bash
npm test -- SocialAuthButtons.test
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/SocialAuthButtons.tsx src/features/auth/components/SocialAuthButtons.test.tsx
git commit -m "feat(auth): agregar componente SocialAuthButtons con Google y Facebook"
```

---

## Task 3: Integrar `SocialAuthButtons` en `LoginForm`

**Files:**
- Modify: `src/features/auth/components/LoginForm.tsx`

- [ ] **Step 1: Agregar `SocialAuthButtons` al inicio del formulario**

En `src/features/auth/components/LoginForm.tsx`, añadir el import y el componente al inicio del `<form>`:

```tsx
// Añadir este import junto a los demás
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";
```

Dentro del `return`, **reemplazar** `<form onSubmit={...} noValidate className="space-y-4">` y su contenido por:

```tsx
  return (
    <div className="space-y-4">
      <SocialAuthButtons />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Correo</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            placeholder="tu@correo.com"
            {...register("email")}
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Contraseña</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="login-password-error" role="alert" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {submitError && (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Entrando..." : "Iniciar sesión"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-primary hover:underline">
            Registrarse
          </Link>
        </p>
      </form>
    </div>
  );
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/components/LoginForm.tsx
git commit -m "feat(auth): agregar botones sociales en LoginForm"
```

---

## Task 4: Integrar `SocialAuthButtons` en `RegisterForm`

**Files:**
- Modify: `src/features/auth/components/RegisterForm.tsx`

- [ ] **Step 1: Agregar import y componente**

En `src/features/auth/components/RegisterForm.tsx`, añadir el import:

```tsx
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";
```

Dentro del `return`, **reemplazar** `<form onSubmit={...} noValidate className="space-y-4">` y su contenido por:

```tsx
  return (
    <div className="space-y-4">
      <SocialAuthButtons />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-name">Nombre</Label>
          <Input
            id="reg-name"
            autoComplete="name"
            pattern="[a-zA-ZÀ-ÿ\s'.\\-]+"
            maxLength={80}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "reg-name-error" : undefined}
            placeholder="Tu nombre completo"
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
          <PhoneInput
            id="reg-phone"
            maxLength={20}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "reg-phone-error" : undefined}
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
            inputMode="email"
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
    </div>
  );
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/components/RegisterForm.tsx
git commit -m "feat(auth): agregar botones sociales en RegisterForm"
```

---

## Task 5: Modificar el callback para redirigir según teléfono

**Files:**
- Modify: `src/app/api/auth/callback/route.ts`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

El archivo actual maneja el code exchange. Reemplazar `src/app/api/auth/callback/route.ts` con:

```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/tienda";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let redirectPath = next;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.phone) {
          redirectPath = "/completar-perfil";
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Invalid_confirmation_link`);
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/callback/route.ts
git commit -m "feat(auth): redirigir a /completar-perfil si el perfil OAuth no tiene teléfono"
```

---

## Task 6: Crear `CompleteProfileForm`

**Files:**
- Create: `src/features/auth/components/CompleteProfileForm.tsx`
- Create: `src/features/auth/components/CompleteProfileForm.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/features/auth/components/CompleteProfileForm.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CompleteProfileForm } from "./CompleteProfileForm";

const mockUpdate = vi.fn();
const mockGetUser = vi.fn();
const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: () => ({
      update: () => ({
        eq: mockUpdate,
      }),
    }),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    refresh: mockRouterRefresh,
  }),
}));

describe("CompleteProfileForm", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    mockUpdate.mockResolvedValue({ error: null });
    mockRouterPush.mockReset();
    mockRouterRefresh.mockReset();
  });

  it("renders the phone input and submit button", () => {
    render(<CompleteProfileForm />);
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
  });

  it("shows validation error for empty phone on submit", async () => {
    render(<CompleteProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("calls supabase update and redirects on valid phone", async () => {
    render(<CompleteProfileForm />);
    const phoneInput = screen.getByLabelText(/teléfono/i);
    fireEvent.change(phoneInput, { target: { value: "+1 (809) 555-1234" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/tienda");
    });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

```bash
npm test -- CompleteProfileForm.test
```

Expected: FAIL — "Cannot find module './CompleteProfileForm'"

- [ ] **Step 3: Implementar `CompleteProfileForm`**

Crear `src/features/auth/components/CompleteProfileForm.tsx`:

```tsx
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
```

- [ ] **Step 4: Correr los tests**

```bash
npm test -- CompleteProfileForm.test
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/CompleteProfileForm.tsx src/features/auth/components/CompleteProfileForm.test.tsx
git commit -m "feat(auth): agregar CompleteProfileForm para completar teléfono en primer login OAuth"
```

---

## Task 7: Crear la página `/completar-perfil`

**Files:**
- Create: `src/app/completar-perfil/page.tsx`

- [ ] **Step 1: Crear la página**

Crear `src/app/completar-perfil/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/app/completar-perfil/page.tsx
git commit -m "feat(auth): agregar página /completar-perfil para usuarios OAuth"
```

---

## Task 8: Crear `.env.example` y actualizar `README.md`

**Files:**
- Create: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Crear `.env.example`**

Crear `.env.example` en la raíz del proyecto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>

# Pagos (opcional en desarrollo)
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-pub-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# IA
GEMINI_API_KEY=your-gemini-api-key

# Nota: Las credenciales de Google y Facebook para OAuth NO van aquí.
# Se configuran directamente en el Dashboard de Supabase:
# Authentication → Providers → Google / Facebook
```

- [ ] **Step 2: Agregar sección de Auth Social al `README.md`**

Añadir la siguiente sección al `README.md` después de la sección `## 🛠️ Configuración`:

```markdown
## 🔐 Autenticación Social (Google y Facebook)

Los botones de "Continuar con Google" y "Continuar con Facebook" en las páginas
`/login` y `/registro` usan el proveedor OAuth nativo de Supabase.
**No requieren variables de entorno adicionales en `.env.local`.**

### Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Crea un **OAuth 2.0 Client ID** (tipo: Web application).
3. En "Authorized redirect URIs" agrega:
   `https://<tu-proyecto>.supabase.co/auth/v1/callback`
4. Copia el **Client ID** y el **Client Secret**.
5. En Supabase Dashboard → Authentication → Providers → Google:
   - Pega el Client ID y Client Secret.
   - Activa el proveedor y guarda.

### Configurar Facebook OAuth

1. Ve a [Meta for Developers](https://developers.facebook.com/) → My Apps → Create App.
2. Agrega el producto **Facebook Login**.
3. En Settings → Basic, copia el **App ID** y el **App Secret**.
4. En Facebook Login → Settings agrega el Redirect URI:
   `https://<tu-proyecto>.supabase.co/auth/v1/callback`
5. En Supabase Dashboard → Authentication → Providers → Facebook:
   - Pega el App ID y App Secret.
   - Activa el proveedor y guarda.

### ¿Por qué no Instagram?

La Instagram Basic Display API fue **deprecada por Meta en diciembre 2024** y ya no
acepta nuevas integraciones. No existe un flujo OAuth standalone para Instagram compatible
con Supabase. "Login con Facebook" cubre el ecosistema Meta de forma oficial.
```

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: agregar instrucciones de configuración OAuth y .env.example"
```

---

## Task 9: Verificación final

- [ ] **Step 1: Correr todos los tests**

```bash
npm test
```

Expected: todos los tests existentes + los nuevos pasan.

- [ ] **Step 2: Build de producción**

```bash
npm run build
```

Expected: build exitoso sin errores de TypeScript o ESLint.

- [ ] **Step 3: Smoke test manual en dev**

```bash
npm run dev
```

Verificar:
- `/login` muestra los botones de Google y Facebook arriba del formulario de correo.
- `/registro` muestra los botones de Google y Facebook arriba del formulario.
- Hacer click en "Continuar con Google" redirige al popup/página de Google.
- Después de autenticarse con Google por primera vez, redirige a `/completar-perfil`.
- Completar el teléfono y hacer click en "Continuar" redirige a `/tienda`.
- En el segundo login con Google (teléfono ya guardado), redirige directamente a `/tienda`.
