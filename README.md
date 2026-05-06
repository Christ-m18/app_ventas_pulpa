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
