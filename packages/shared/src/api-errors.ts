/**
 * API Error & Success Messages
 *
 * Shared constants used across all API routes.
 * Centralising these avoids hardcoded Portuguese strings in route handlers
 * and makes it possible to add locale support in the future.
 */

export const ERR = {
  // ── 401 Unauthorized ────────────────────────────────────────────────
  UNAUTHORIZED: "Não autorizado.",
  NOT_AUTHENTICATED: "Não autenticado",

  // ── 400 Bad Request ─────────────────────────────────────────────────
  MISSING_BUSINESS_ID: "Parâmetro businessId é obrigatório.",
  MISSING_BUSINESS_ID_ALT: "O parâmetro businessId é obrigatório.",
  MISSING_REQUIRED_FIELDS: "Campos obrigatórios faltando.",
  MISSING_REQUIRED_DATA: "Dados obrigatórios faltando.",
  MISSING_LEAD_DATA: "Dados obrigatórios faltando (businessId e name são necessários).",
  MISSING_ORDER_DATA: "Dados obrigatórios faltando ou inválidos.",
  MISSING_APPOINTMENT_DATA: "Dados incompletos para agendamento",
  MISSING_QUOTE_DATA: "Dados obrigatórios faltando ou lista de itens vazia.",
  MISSING_PUSH_TOKEN_DATA: "Parâmetros expoPushToken e platform são obrigatórios.",
  MISSING_PUSH_TOKEN: "Parâmetro expoPushToken é obrigatório.",
  NO_FILE: "Nenhum arquivo enviado",
  MISSING_SLUG_OR_SHORTCODE: "Provide either slug or shortCode parameter",

  // ── 403 Forbidden ───────────────────────────────────────────────────
  ACCESS_DENIED: "Acesso negado para este negócio.",
  BUSINESS_NOT_FOUND_OR_NO_PERMISSION: "Negócio não encontrado ou sem permissão",

  // ── 404 Not Found ───────────────────────────────────────────────────
  BUSINESS_NOT_FOUND: "Negócio não encontrado.",
  NOTIFICATION_NOT_FOUND: "Notificação não encontrada.",
  QR_CODE_NOT_FOUND: "QR code not found",
  BUSINESS_NOT_FOUND_EN: "Business not found",

  // ── 429 Rate Limit ──────────────────────────────────────────────────
  TOO_MANY_REQUESTS: "Muitas requisições. Tente novamente mais tarde.",
  TOO_MANY_SOLICITATIONS: "Muitas solicitações. Tente novamente mais tarde.",

  // ── 500 Internal Server ─────────────────────────────────────────────
  INTERNAL_SERVER_ERROR: "Erro interno do servidor.",
  INTERNAL_SERVER_ERROR_EN: "Internal server error",
  FETCH_NOTIFICATIONS_ERROR: "Erro ao obter notificações.",
  CREATE_LEAD_ERROR: "Erro ao registrar lead.",
  CREATE_ORDER_ERROR: "Erro ao criar pedido.",
  CREATE_QUOTE_ERROR: "Erro ao criar solicitação de orçamento.",
  REGISTER_PUSH_TOKEN_ERROR: "Erro ao registrar token de push.",
  UNREGISTER_PUSH_TOKEN_ERROR: "Erro ao desativar token de push.",
  UPDATE_NOTIFICATIONS_ERROR: "Erro ao atualizar notificações.",
  UPDATE_NOTIFICATION_ERROR: "Erro ao atualizar notificação.",
  ARCHIVE_NOTIFICATION_ERROR: "Erro ao arquivar notificação.",
  UPLOAD_ERROR: "Erro ao fazer upload",
  TRACK_SCAN_ERROR: "Failed to track scan",
  TRACK_CLICK_ERROR: "Failed to track click",
  INVALID_INPUT: "Invalid input",
} as const;

export const API_SUCCESS = {
  NOTIFICATIONS_MARKED_READ: "Todas as notificações marcadas como lidas.",
  PUSH_TOKEN_DISABLED: "Token de push desativado com sucesso.",
  UPLOAD_WARNING: "Arquivo enviado, mas metadados não foram salvos.",
} as const;
