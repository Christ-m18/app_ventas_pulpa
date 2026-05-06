import * as z from "zod";

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Nombre demasiado corto." })
    .max(80, { error: "Nombre demasiado largo." }),
  phone: z
    .string()
    .trim()
    .max(20, { error: "Teléfono demasiado largo." })
    .regex(/^[\d\s\-+()]*$/, { error: "Formato de teléfono inválido." })
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
