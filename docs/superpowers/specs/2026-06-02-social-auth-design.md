# Social Auth — Google + Facebook

**Fecha:** 2026-06-02  
**Estado:** Aprobado  
**Alcance:** Agregar login/registro con Google y Facebook a las páginas `/login` y `/registro`. Instagram excluido (ver nota al final).

---

## Arquitectura

Se usa el flujo **OAuth PKCE** nativo de Supabase, que es el mismo que ya maneja el callback de confirmación de email.

```
Click en botón social
  → supabase.auth.signInWithOAuth({ provider, redirectTo: origin + '/api/auth/callback' })
  → Redirige al proveedor (Google / Facebook)
  → Proveedor devuelve a /api/auth/callback?code=...
  → exchangeCodeForSession(code)          ← ya existe, sin cambios de firma
  → Consultar profiles.phone del usuario
  → phone IS NULL  → redirigir a /completar-perfil
  → phone NOT NULL → redirigir a /tienda (o ?next=)
```

El trigger `handle_new_user` de Supabase crea el registro en `profiles` (con `phone = null`) antes de que el callback ejecute la consulta, por lo que la fila siempre existe.

---

## Componentes

### `SocialAuthButtons` (`src/features/auth/components/SocialAuthButtons.tsx`)

- Client component compartido entre `LoginForm` y `RegisterForm`.
- Renderiza dos botones: **Continuar con Google** y **Continuar con Facebook**.
- Íconos SVG inline (sin dependencia extra).
- Estado de `loading` individual por proveedor (mientras el browser redirige).
- Llama a `supabase.auth.signInWithOAuth` con `redirectTo` dinámico basado en `window.location.origin`.
- Accesible: `aria-label` en cada botón, `role="separator"` en el divisor.
- En caso de error del SDK, muestra un toast con `sonner`.

### `CompleteProfileForm` (`src/features/auth/components/CompleteProfileForm.tsx`)

- Client component. Formulario con un campo: teléfono.
- Reutiliza `PhoneInput` existente y `zod` para validación (misma regla que `registerSchema`).
- Al submit: `supabase.from('profiles').update({ phone }).eq('id', user.id)`.
- Éxito → `router.push('/tienda')`.
- Si el usuario ya tiene teléfono (navegó manualmente) → redirect a `/tienda` en `useEffect`.

### `/completar-perfil` (`src/app/completar-perfil/page.tsx`)

- Server component que renderiza `CompleteProfileForm`.
- Si el usuario no está autenticado, redirigir a `/login` (via `requireUser` del DAL).
- Layout visual igual al de `/login` y `/registro` (imagen lateral, tarjeta `glass`).

---

## Cambios en archivos existentes

### `src/app/api/auth/callback/route.ts`

Después de `exchangeCodeForSession`, consultar el perfil del usuario recién autenticado:

```ts
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('phone')
  .eq('id', user!.id)
  .maybeSingle();

const redirectPath = profile?.phone ? next : '/completar-perfil';
```

El `next` ya viene del query param con fallback a `/tienda`.

### `LoginForm` y `RegisterForm`

Agregar `<SocialAuthButtons />` seguido de un separador `— o continúa con correo —` antes del contenido actual del formulario. El layout existente no se mueve.

---

## Manejo de errores

| Escenario | Comportamiento |
|---|---|
| Usuario cancela popup del proveedor | Regresa al login sin error visible |
| Error devuelto por el proveedor | Callback redirige a `/login?error=Invalid_confirmation_link` (ya manejado) |
| Email ya registrado con contraseña | Supabase vincula automáticamente si el email coincide (identity linking) |
| Fallo al guardar teléfono | Toast de error, formulario permite reintentar sin salir de la página |
| Usuario sin sesión navega a `/completar-perfil` | `requireUser` redirige a `/login` |

---

## Variables de entorno

No se requieren nuevas variables de entorno en la app. Los `Client ID` y `Client Secret` de Google y Facebook **se configuran únicamente en el Dashboard de Supabase** (Authentication → Providers), nunca en el `.env` del proyecto Next.js.

Se documentan los pasos en el `README.md`.

---

## Configuración requerida en Supabase Dashboard

1. **Google**: crear proyecto en Google Cloud Console → activar OAuth 2.0 → copiar Client ID y Secret → pegar en Supabase → agregar Redirect URI: `https://<proyecto>.supabase.co/auth/v1/callback`
2. **Facebook**: crear app en Meta for Developers → producto "Facebook Login" → copiar App ID y Secret → pegar en Supabase → misma Redirect URI

---

## Por qué Instagram no se incluyó

La **Instagram Basic Display API** fue deprecada por Meta en diciembre de 2024. Hoy no existe un flujo OAuth standalone para Instagram que sea compatible con `supabase.auth.signInWithOAuth`. El único "Login con Instagram" disponible pasa por el ecosistema de Facebook Business (que requiere revisión de app Meta y es funcionalmente equivalente a "Login con Facebook"). Por eso se eligió ofrecer Facebook directamente, que cubre el ecosistema Meta de forma oficial y sin restricciones adicionales.
