import { z } from "zod";

// Phone validation pattern for Brazilian numbers (DD) 9XXXX-XXXX or (DD) XXXX-XXXX
const phoneRegex = /^(?:(?:\+|00)?55)?\s?(?:\(?([1-9][1-9])\)?)\s?(?:((?:9\d|[2-9])\d{3})\s?-?\s?(\d{4}))$/;

export const orderSchema = z.object({
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
        id: z.string().optional(),
        name: z.string().min(1, "Nome do item obrigatório").max(100),
        quantity: z.number().int().min(1, "Quantidade mínima é 1").max(50, "Quantidade máxima por item é 50"),
        price: z.number().min(0, "Preço inválido"),
      })
    )
    .min(1, "O pedido deve ter pelo menos 1 item")
    .max(30, "O pedido não pode ter mais de 30 itens diferentes"),
  total: z.number().min(0, "Total inválido"),
  paymentMethod: z.string().max(30).optional(),
  honeypot: z.string().max(0, "Spam detectado").optional(), // Spam prevention field
});

export type OrderInput = z.infer<typeof orderSchema>;
