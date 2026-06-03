import { z } from "zod";

const phoneRegex = /^(?:(?:\+|00)?55)?\s?(?:\(?([1-9][1-9])\)?)\s?(?:((?:9\d|[2-9])\d{3})\s?-?\s?(\d{4}))$/;

export const appointmentSchema = z.object({
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
  serviceId: z.string().min(1, "O serviço selecionado é inválido"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário de início inválido (use HH:MM)"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário de término inválido (use HH:MM)")
    .optional(),
  notes: z.string().max(200, "Notas devem ter no máximo 200 caracteres").optional(),
  honeypot: z.string().max(0, "Spam detectado").optional(), // Spam prevention field
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
