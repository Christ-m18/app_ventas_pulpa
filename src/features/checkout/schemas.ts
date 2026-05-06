import * as z from "zod";

export const cartLineSchema = z.object({
  product_id: z.uuid(),
  quantity: z.number().int().positive().max(99),
});

export const checkoutPayloadSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  email: z.email(),
  phone: z
    .string()
    .trim()
    .min(10)
    .max(15)
    .regex(/^[\d\s\-+()]+$/, { error: "Formato de teléfono inválido" }),
  address: z.string().trim().min(10).max(500),
  zone: z.string().min(1),
  paymentMethod: z.enum(["cash_on_delivery", "bank_transfer"]),
  notes: z.string().max(500).optional(),
  items: z.array(cartLineSchema).min(1, { error: "El carrito está vacío" }),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
