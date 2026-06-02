# Pulpas Naturales RD - App de Venta de Pulpas

Esta es una aplicación completa de comercio electrónico para la venta de pulpas de frutas congeladas, optimizada para el mercado de República Dominicana.

## 🚀 Tecnologías

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Estilos**: TailwindCSS + shadcn/ui
- **Estado**: Zustand + React Query
- **IA**: Google Gemini (Recomendaciones nutricionales)
- **Despliegue**: Docker

## ✨ Características

- **Catálogo Dinámico**: Filtrado por categorías y stock en tiempo real.
- **Carrito Persistente**: Edición rápida y totalización automática.
- **Checkout Optimizado para RD**:
  - Pago contra entrega (Efectivo).
  - Transferencia bancaria.
  - Costo de envío dinámico por zonas (DN, SDE, SDW, SDN, Haina).
- **Asistente IA**: Recomendaciones inteligentes basadas en tus metas de salud.
- **Control de Inventario**: Reducción automática de stock tras cada compra.

## 🛠️ Configuración

1. Clona el repositorio.
2. Crea un archivo `.env.local` basado en `.env.example` con tus credenciales:
   - Supabase (URL y Anon Key)
   - Gemini API Key (Google AI Studio)

3. Ejecuta el esquema de base de datos en Supabase:
   - Copia el contenido de `supabase/schema.sql` en el SQL Editor de Supabase.
   - Ejecuta `supabase/seed.sql` para poblar los productos iniciales.

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

## 🏃 Cómo ejecutar

### Con Docker (Recomendado)

```bash
docker-compose up --build
```

### Local (Desarrollo)

```bash
npm install
npm run dev
```

## 🏗️ Arquitectura

El proyecto sigue una arquitectura **basada en funcionalidades (feature-based)**:

- `src/features`: Módulos aislados (products, cart, checkout, ai).
- `src/components`: UI genérica y layouts.
- `src/lib`: Configuraciones de clientes (Supabase, Utils).

## 🚚 Logística (RD)

Zonas configuradas con costos específicos:

- Distrito Nacional: RD$150
- Santo Domingo Este/Oeste: RD$200
- Santo Domingo Norte: RD$250
- Haina: RD$300

---

Desarrollado con ❤️ para el mercado dominicano.

# app_ventas_pulpa
