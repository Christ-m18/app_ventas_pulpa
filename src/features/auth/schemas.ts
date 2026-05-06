import * as z from "zod";

const emailSchema = z
  .email({ error: "Correo inválido." })
  .trim()
  .max(254, { error: "Correo demasiado largo." });

const passwordSchema = z
  .string()
  .min(8, { error: "Mínimo 8 caracteres." })
  .max(72, { error: "Máximo 72 caracteres." })
  .regex(/[a-zA-Z]/, { error: "Debe incluir al menos una letra." })
  .regex(/[0-9]/, { error: "Debe incluir al menos un número." });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Contraseña requerida." }).max(72),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Nombre demasiado corto." })
    .max(80, { error: "Nombre demasiado largo." }),
  phone: z
    .string()
    .trim()
    .min(10, { error: "Teléfono demasiado corto." })
    .max(20, { error: "Teléfono demasiado largo." }),
  email: emailSchema,
  password: passwordSchema,
});

export const totpEnrollSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Código de 6 dígitos." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TotpEnrollInput = z.infer<typeof totpEnrollSchema>;
