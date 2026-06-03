import { z } from "zod";

const phoneRegex = /^(?:(?:\+|00)?55)?\s?(?:\(?([1-9][1-9])\)?)\s?(?:((?:9\d|[2-9])\d{3})\s?-?\s?(\d{4}))$/;

export const quoteSchema = z.object({
  customerName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(80, "Nome muito longo (máximo 80 caracteres)"),
  customerPhone: z
    .string()
    .regex(phoneRegex, "Telefone inválido. Use um formato brasileiro com DDD (Ex: 11999999999)"),
  customerEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .max(30, "Máximo de 30 itens por orçamento")
    .optional(),
  message: z
    .string()
    .min(10, "Por favor, especifique o que precisa (mínimo 10 caracteres)")
    .max(500, "Mensagem muito longa (máximo 500 caracteres)"),
  honeypot: z.string().max(0, "Spam detectado").optional(), // Spam prevention field
});

export type QuoteInput = z.infer<typeof quoteSchema>;
