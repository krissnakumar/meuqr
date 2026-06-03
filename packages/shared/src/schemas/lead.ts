import { z } from "zod";

const phoneRegex = /^(?:(?:\+|00)?55)?\s?(?:\(?([1-9][1-9])\)?)\s?(?:((?:9\d|[2-9])\d{3})\s?-?\s?(\d{4}))$/;

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(80, "Nome muito longo (máximo 80 caracteres)"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(phoneRegex, "Telefone inválido. Use um formato brasileiro com DDD (Ex: 11999999999)")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(500, "Mensagem muito longa (máximo 500 caracteres)")
    .optional(),
  honeypot: z.string().max(0, "Spam detectado").optional(), // Spam prevention field
});

export type LeadInput = z.infer<typeof leadSchema>;
