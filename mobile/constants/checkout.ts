import * as z from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Nombre completo requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  address: z.string().min(10, 'Dirección detallada requerida'),
  zone: z.string().min(1, 'Zona de entrega requerida'),
  paymentMethod: z.enum(['cash_on_delivery', 'bank_transfer', 'stripe', 'paypal']),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const ZONES = [
  { id: 'distrito-nacional', name: 'Distrito Nacional', cost: 150 },
  { id: 'santo-domingo-este', name: 'Santo Domingo Este', cost: 200 },
  { id: 'santo-domingo-oeste', name: 'Santo Domingo Oeste', cost: 200 },
  { id: 'santo-domingo-norte', name: 'Santo Domingo Norte', cost: 250 },
  { id: 'haina', name: 'Haina', cost: 300 },
] as const;
