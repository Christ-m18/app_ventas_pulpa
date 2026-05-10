import * as z from "zod";

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Nombre demasiado corto." })
    .max(80, { error: "Nombre demasiado largo." })
    .regex(/^[a-zA-ZÀ-ÿ\s'.-]+$/, { error: "Nombre solo puede contener letras y espacios." }),
  phone: z
    .string()
    .trim()
    .max(20, { error: "Teléfono demasiado largo." })
    .regex(/^[\d\s\-+()]*$/, { error: "Formato inválido (ej: 809-000-0000)." })
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
