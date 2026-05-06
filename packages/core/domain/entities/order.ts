/**
 * Order Entity — Pure domain model for the checkout / ordering flow.
 * Zod schemas provide runtime validation; TypeScript types are derived.
 */

import { z } from 'zod';

// ─── Enums ─────────────────────────────────────────────────────

export const OrderStatusEnum = z.enum([
  'pending',
  'processing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

export const PaymentMethodEnum = z.enum([
  'cash_on_delivery',
  'bank_transfer',
]);

export const PaymentStatusEnum = z.enum([
  'awaiting_voucher',
  'pending_review',
  'verified',
  'pending_cash',
  'paid',
  'failed',
]);

// ─── Delivery Zones ────────────────────────────────────────────
// Cobertura nacional. Costos calibrados a partir del HQ en La Vega:
// Cibao Central (más cerca) = más barato; Sur profundo / frontera = más caro.

export const RegionEnum = z.enum([
  'cibao-central',
  'cibao-norte',
  'cibao-noroeste',
  'capital',
  'sur',
  'este',
]);

export type DeliveryRegion = z.infer<typeof RegionEnum>;

export const DeliveryZoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number().min(0),
  region: RegionEnum,
});

export const DELIVERY_ZONES: DeliveryZone[] = [
  // ── Cibao Central (HQ La Vega) ─────────────────────────────
  { id: 'la-vega',           name: 'La Vega',                    cost: 100, region: 'cibao-central' },
  { id: 'espaillat',         name: 'Espaillat (Moca)',           cost: 120, region: 'cibao-central' },
  { id: 'santiago',          name: 'Santiago',                   cost: 150, region: 'cibao-central' },
  { id: 'hermanas-mirabal',  name: 'Hermanas Mirabal (Salcedo)', cost: 150, region: 'cibao-central' },
  { id: 'monsenor-nouel',    name: 'Monseñor Nouel (Bonao)',     cost: 180, region: 'cibao-central' },
  { id: 'sanchez-ramirez',   name: 'Sánchez Ramírez (Cotuí)',    cost: 200, region: 'cibao-central' },
  { id: 'duarte',            name: 'Duarte (San Francisco)',     cost: 200, region: 'cibao-central' },

  // ── Cibao Norte ────────────────────────────────────────────
  { id: 'puerto-plata',      name: 'Puerto Plata',               cost: 250, region: 'cibao-norte' },
  { id: 'maria-trinidad-sanchez', name: 'María Trinidad Sánchez (Nagua)', cost: 280, region: 'cibao-norte' },
  { id: 'samana',            name: 'Samaná',                     cost: 320, region: 'cibao-norte' },

  // ── Cibao Noroeste ─────────────────────────────────────────
  { id: 'valverde',          name: 'Valverde (Mao)',             cost: 250, region: 'cibao-noroeste' },
  { id: 'santiago-rodriguez',name: 'Santiago Rodríguez',         cost: 300, region: 'cibao-noroeste' },
  { id: 'monte-cristi',      name: 'Monte Cristi',               cost: 300, region: 'cibao-noroeste' },
  { id: 'dajabon',           name: 'Dajabón',                    cost: 350, region: 'cibao-noroeste' },

  // ── Capital y alrededores ──────────────────────────────────
  { id: 'distrito-nacional', name: 'Distrito Nacional',          cost: 200, region: 'capital' },
  { id: 'santo-domingo',     name: 'Santo Domingo (Provincia)',  cost: 200, region: 'capital' },
  { id: 'monte-plata',       name: 'Monte Plata',                cost: 250, region: 'capital' },
  { id: 'san-cristobal',     name: 'San Cristóbal',              cost: 250, region: 'capital' },
  { id: 'peravia',           name: 'Peravia (Baní)',             cost: 280, region: 'capital' },

  // ── Sur ────────────────────────────────────────────────────
  { id: 'san-jose-de-ocoa',  name: 'San José de Ocoa',           cost: 320, region: 'sur' },
  { id: 'azua',              name: 'Azua',                       cost: 350, region: 'sur' },
  { id: 'san-juan',          name: 'San Juan de la Maguana',     cost: 400, region: 'sur' },
  { id: 'barahona',          name: 'Barahona',                   cost: 400, region: 'sur' },
  { id: 'bahoruco',          name: 'Bahoruco (Neiba)',           cost: 420, region: 'sur' },
  { id: 'elias-pina',        name: 'Elías Piña',                 cost: 450, region: 'sur' },
  { id: 'independencia',     name: 'Independencia (Jimaní)',     cost: 450, region: 'sur' },
  { id: 'pedernales',        name: 'Pedernales',                 cost: 500, region: 'sur' },

  // ── Este ───────────────────────────────────────────────────
  { id: 'san-pedro-de-macoris', name: 'San Pedro de Macorís',    cost: 300, region: 'este' },
  { id: 'hato-mayor',        name: 'Hato Mayor',                 cost: 320, region: 'este' },
  { id: 'el-seibo',          name: 'El Seibo',                   cost: 350, region: 'este' },
  { id: 'la-romana',         name: 'La Romana',                  cost: 350, region: 'este' },
  { id: 'la-altagracia',     name: 'La Altagracia (Higüey)',     cost: 400, region: 'este' },
];

export const REGION_LABELS: Record<DeliveryRegion, string> = {
  'cibao-central':  'Cibao Central',
  'cibao-norte':    'Cibao Norte',
  'cibao-noroeste': 'Cibao Noroeste',
  'capital':        'Capital y alrededores',
  'sur':            'Sur',
  'este':           'Este',
};

// ─── Order Schemas ─────────────────────────────────────────────

export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  total: z.number().positive(),
  status: OrderStatusEnum,
  payment_method: PaymentMethodEnum,
  delivery_address: z.string().min(10, 'Dirección detallada requerida'),
  zone: z.string().min(1, 'Zona de entrega requerida'),
  shipping_cost: z.number().min(0),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime({ offset: true }),
});

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

// ─── Checkout Form Schema (Input Validation) ───────────────────

export const CheckoutFormSchema = z.object({
  fullName: z.string().min(3, 'Nombre completo requerido').max(120),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .max(15)
    .regex(/^[\d\s\-+()]+$/, 'Formato de teléfono inválido'),
  address: z.string().min(10, 'Dirección detallada requerida').max(500),
  zone: z.string().min(1, 'Zona de entrega requerida'),
  paymentMethod: PaymentMethodEnum,
  notes: z.string().max(500).optional(),
});

// ─── TypeScript Types ──────────────────────────────────────────

export type OrderStatus = z.infer<typeof OrderStatusEnum>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type DeliveryZone = z.infer<typeof DeliveryZoneSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
