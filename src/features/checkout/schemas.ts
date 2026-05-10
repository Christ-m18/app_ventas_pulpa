import * as z from "zod";

export const cartLineSchema = z.object({
  product_id: z.uuid(),
  quantity: z.number().int().positive().max(99),
});

export const checkoutPayloadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { error: "Nombre debe tener al menos 3 caracteres" })
    .max(120, { error: "Nombre demasiado largo" })
    .regex(/^[a-zA-ZÀ-ÿ\s'.-]+$/, { error: "Nombre solo puede contener letras y espacios" }),
  email: z.email({ error: "Ingresa un correo electrónico válido (ej: usuario@correo.com)" }),
  phone: z
    .string()
    .trim()
    .min(10, { error: "Teléfono debe tener al menos 10 dígitos" })
    .max(20, { error: "Teléfono demasiado largo" })
    .regex(/^[\d\s\-+()]+$/, { error: "Formato de teléfono inválido" }),
  address: z.string().trim().min(10, { error: "Dirección demasiado corta" }).max(500),
  zone: z.string().min(1, { error: "Selecciona una zona de entrega" }),
  paymentMethod: z.enum(["cash_on_delivery", "bank_transfer"]),
  notes: z.string().max(500).optional(),
  items: z.array(cartLineSchema).min(1, { error: "El carrito está vacío" }),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
