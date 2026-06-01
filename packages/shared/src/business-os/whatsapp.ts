// ============================================
// MeuQR Business OS — WhatsApp Action Generator
// ============================================

import type { WhatsAppActionType, WhatsAppActionParams } from './types';

// WhatsApp message templates per action type (in pt-BR)
const WHATSAPP_MESSAGES: Record<WhatsAppActionType, (params: WhatsAppActionParams) => string> = {
  contact: () => 'Olá! Gostaria de mais informações sobre seus serviços.',

  product_inquiry: (params) =>
    `Olá, tenho interesse no produto: ${params.productName || 'um item do seu catálogo'}. Pode me passar mais informações?`,

  quote_request: (params) =>
    `Olá, gostaria de solicitar um orçamento${params.productName ? ` para: ${params.productName}` : ''}. Pode me enviar mais detalhes?`,

  book_appointment: (params) =>
    `Olá, gostaria de agendar ${params.serviceName ? `uma consulta de ${params.serviceName}` : 'um horário'}${params.customerName ? `. Meu nome é ${params.customerName}` : ''}.`,

  confirm_appointment: (params) =>
    `Olá${params.customerName ? ` ${params.customerName}` : ''}! Gostaria de confirmar meu agendamento${params.serviceName ? ` para ${params.serviceName}` : ''}.`,

  send_reminder: (params) =>
    `Olá${params.customerName ? ` ${params.customerName}` : ''}! Lembrete: você tem um agendamento conosco em breve. Confirme sua presença?`,

  ask_review: (params) =>
    `Olá${params.customerName ? ` ${params.customerName}` : ''}! Agradecemos pela preferência. Poderia avaliar nosso serviço? Sua opinião é muito importante para nós.`,

  ask_availability: (params) =>
    `Olá! Gostaria de saber se há disponibilidade${params.serviceName ? ` para ${params.serviceName}` : ''}${params.customerName ? `. Meu nome é ${params.customerName}` : ''}.`,
};

/**
 * Generate a WhatsApp link with a pre-filled message and tracking parameter.
 * 
 * @param params - The parameters for the WhatsApp action
 * @param trackingRef - Optional tracking reference (e.g., 'qr_main', 'page_menu', 'product_123')
 * @returns A WhatsApp deep link URL with tracking
 * 
 * @example
 * ```ts
 * const link = generateWhatsAppLink({
 *   businessPhone: '5511999998888',
 *   actionType: 'product_inquiry',
 *   productName: 'Cimento CP-II 50kg',
 * }, 'product_abc123');
 * ```
 */
export function generateWhatsAppLink(
  params: WhatsAppActionParams,
  trackingRef?: string
): { url: string; message: string; actionType: WhatsAppActionType } {
  const { businessPhone, actionType, customMessage } = params;

  // Clean the phone number
  const cleanPhone = businessPhone.replace(/\D/g, '');

  // Get the message template
  const message = customMessage || WHATSAPP_MESSAGES[actionType](params);

  // Add tracking suffix to message for analytics attribution
  const trackedMessage = trackingRef
    ? `${message} [ref: ${trackingRef}]`
    : message;

  // Encode for URL
  const encodedMessage = encodeURIComponent(trackedMessage);

  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return { url, message: trackedMessage, actionType };
}

/**
 * Get the WhatsApp message template for a given action type.
 * Useful for previewing or customizing before generating the link.
 */
export function getWhatsAppTemplate(
  actionType: WhatsAppActionType,
  params: Partial<WhatsAppActionParams> = {}
): string {
  return WHATSAPP_MESSAGES[actionType]({
    businessPhone: params.businessPhone || '',
    actionType,
    customerName: params.customerName,
    productName: params.productName,
    serviceName: params.serviceName,
    pageTitle: params.pageTitle,
  });
}

/**
 * Generate a WhatsApp link for a QR code scan.
 * Automatically includes the QR code ID as a tracking reference.
 */
export function generateWhatsAppLinkForQR(
  params: WhatsAppActionParams,
  qrCodeId: string
): { url: string; message: string; actionType: WhatsAppActionType } {
  return generateWhatsAppLink(params, `qr_${qrCodeId}`);
}

/**
 * Generate a WhatsApp link for a specific page.
 * Includes the page slug for analytics attribution.
 */
export function generateWhatsAppLinkForPage(
  params: WhatsAppActionParams,
  pageSlug: string
): { url: string; message: string; actionType: WhatsAppActionType } {
  return generateWhatsAppLink(params, `page_${pageSlug}`);
}

/**
 * Returns contextual WhatsApp action types based on business vertical.
 */
export function getVerticalWhatsAppActions(verticalSlug: string): WhatsAppActionType[] {
  switch (verticalSlug) {
    case 'health':
    case 'beauty_wellness':
      return ['book_appointment', 'confirm_appointment', 'send_reminder', 'ask_review', 'contact'];

    case 'food_beverage':
      return ['contact', 'product_inquiry', 'ask_availability', 'ask_review'];

    case 'construction':
    case 'automotive':
      return ['quote_request', 'contact', 'ask_availability', 'ask_review'];

    case 'retail':
      return ['product_inquiry', 'contact', 'ask_review'];

    case 'real_estate':
      return ['contact', 'ask_availability', 'ask_review'];

    case 'hotels_tourism':
      return ['contact', 'book_appointment', 'ask_review'];

    case 'education':
    case 'professional_services':
      return ['book_appointment', 'contact', 'ask_review'];

    case 'events':
      return ['quote_request', 'contact', 'ask_review'];

    default:
      return ['contact', 'ask_review'];
  }
}
