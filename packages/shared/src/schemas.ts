import { z } from "zod";

// ===== Auth Schemas =====

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

// ===== Business Schemas =====

export const businessCategorySchema = z.enum([
  "restaurant",
  "construction_materials",
  "salon",
  "pet_shop",
  "hotel",
  "real_estate",
  "event",
  "clinic",
  "gym",
  "mechanic",
  "freelancer",
  "church",
  "product_shelf",
  "other",
]);

export const createBusinessSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  slug: z
    .string()
    .min(2, "Slug deve ter no mínimo 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  category: businessCategorySchema,
  description: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

// ===== Section Schemas =====

export const createSectionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  sectionType: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ===== Item Schemas =====

export const createItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  itemType: z.enum(["product", "service", "combo"]).default("product"),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateItemSchema = createItemSchema.partial();

// ===== QR Code Schemas =====

export const createQRSchema = z.object({
  businessId: z.string().uuid(),
  pageId: z.string().uuid().optional(),
  title: z.string().min(1, "Título é obrigatório"),
});

export const qrStyleSchema = z.object({
  dotStyle: z.enum(["square", "rounded", "classy", "dots", "extra-rounded"]).default("rounded"),
  cornerStyle: z.enum(["square", "extra-rounded", "rounded", "circle"]).default("rounded"),
  foregroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#111827"),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#FFFFFF"),
  gradient: z.boolean().default(false),
  gradientColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  margin: z.number().int().min(0).max(50).default(10),
  errorCorrectionLevel: z.enum(["L", "M", "Q", "H"]).default("M"),
});

// ===== Public Page Schemas =====

export const leadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const quoteRequestSchema = z.object({
  customerName: z.string().min(1, "Nome é obrigatório"),
  customerPhone: z.string().min(1, "Telefone é obrigatório"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().min(1),
    })
  ),
  message: z.string().optional(),
});

export const orderSchema = z.object({
  customerName: z.string().min(1, "Nome é obrigatório"),
  customerPhone: z.string().min(1, "Telefone é obrigatório"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
    })
  ),
  total: z.number().min(0),
  paymentMethod: z.string().optional(),
});

// ===== Scan/Click Schemas =====

export const trackScanSchema = z.object({
  qrCodeId: z.string().uuid(),
  pageId: z.string().uuid().optional(),
  referrer: z.string().optional(),
});

export const trackClickSchema = z.object({
  scanId: z.string().uuid().optional(),
  qrCodeId: z.string().uuid().optional(),
  pageId: z.string().uuid().optional(),
  clickType: z.enum(["whatsapp", "pix", "phone", "instagram", "website", "maps", "share", "quote", "order"]),
});

// ===== Profile Schemas =====

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
});
