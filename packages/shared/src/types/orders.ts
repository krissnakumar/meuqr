export interface OrderItemDTO {
  id?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderDTO {
  id: string;
  businessId: string;
  pageId: string | null;
  clientId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  items: OrderItemDTO[];
  total: number;
  paymentMethod: string | null;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItemDTO {
  name: string;
  quantity: number;
}

export interface QuoteRequestDTO {
  id: string;
  businessId: string;
  pageId: string | null;
  clientId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  items: QuoteItemDTO[];
  message: string | null;
  createdAt: string;
}
