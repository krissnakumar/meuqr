export interface AppointmentDTO {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceId: string;
  staffId: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDTO {
  id: string;
  businessId: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEventDTO {
  id: string;
  businessId: string;
  pageId: string | null;
  qrCodeId: string | null;
  eventType: string;
  metadata: Record<string, any>;
  visitorId: string | null;
  device: string | null;
  referrer: string | null;
  createdAt: string;
}
