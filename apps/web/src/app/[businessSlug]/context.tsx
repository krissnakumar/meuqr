"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// A generic item type since SectionItem might not be exported perfectly yet
type CartItem = { item: any; qty: number; quality: string; selectedModifiers?: any[] };

interface PublicPageContextType {
  // Global Customer Details
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;

  // Cart & Order States
  orderItems: CartItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  showOrderDrawer: boolean;
  setShowOrderDrawer: (show: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  submittingOrder: boolean;
  setSubmittingOrder: (submitting: boolean) => void;
  orderSuccess: boolean;
  setOrderSuccess: (success: boolean) => void;

  // B2B Quotes States
  quoteItems: CartItem[];
  setQuoteItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  showQuoteDrawer: boolean;
  setShowQuoteDrawer: (show: boolean) => void;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  submittingQuote: boolean;
  setSubmittingQuote: (submitting: boolean) => void;
  quoteSuccess: boolean;
  setQuoteSuccess: (success: boolean) => void;

  // Modifiers Drawer States
  modifierItem: any | null;
  setModifierItem: (item: any | null) => void;
  activeModifiers: Record<string, any[]>;
  setActiveModifiers: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  modifierMode: "order" | "quote";
  setModifierMode: (mode: "order" | "quote") => void;

  // Donation States
  donationItem: any | null;
  setDonationItem: (item: any | null) => void;
  donationAmount: number | "";
  setDonationAmount: (amount: number | "") => void;

  // Lead Form States
  leadName: string;
  setLeadName: (name: string) => void;
  leadEmail: string;
  setLeadEmail: (email: string) => void;
  leadPhone: string;
  setLeadPhone: (phone: string) => void;
  leadMessage: string;
  setLeadMessage: (msg: string) => void;
  submittingLead: boolean;
  setSubmittingLead: (submitting: boolean) => void;
  leadSuccess: boolean;
  setLeadSuccess: (success: boolean) => void;

  // Booking Form States
  showBookingDrawer: boolean;
  setShowBookingDrawer: (show: boolean) => void;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingTime: string;
  setBookingTime: (time: string) => void;
  submittingBooking: boolean;
  setSubmittingBooking: (submitting: boolean) => void;
  bookingSuccess: boolean;
  setBookingSuccess: (success: boolean) => void;
  bookingCustomFields: Record<string, string>;
  setBookingCustomFields: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const PublicPageContext = createContext<PublicPageContextType | undefined>(undefined);

export function PublicPageProvider({ children }: { children: ReactNode }) {
  // Global Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Cart & Order
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [orderNotes, setOrderNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Quotes
  const [quoteItems, setQuoteItems] = useState<CartItem[]>([]);
  const [showQuoteDrawer, setShowQuoteDrawer] = useState(false);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Modifiers
  const [modifierItem, setModifierItem] = useState<any | null>(null);
  const [activeModifiers, setActiveModifiers] = useState<Record<string, any[]>>({});
  const [modifierMode, setModifierMode] = useState<"order" | "quote">("order");

  // Donations
  const [donationItem, setDonationItem] = useState<any | null>(null);
  const [donationAmount, setDonationAmount] = useState<number | "">("");

  // Leads
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Bookings
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCustomFields, setBookingCustomFields] = useState<Record<string, string>>({});

  return (
    <PublicPageContext.Provider
      value={{
        customerName, setCustomerName,
        customerPhone, setCustomerPhone,
        customerEmail, setCustomerEmail,
        
        orderItems, setOrderItems,
        showOrderDrawer, setShowOrderDrawer,
        paymentMethod, setPaymentMethod,
        orderNotes, setOrderNotes,
        submittingOrder, setSubmittingOrder,
        orderSuccess, setOrderSuccess,

        quoteItems, setQuoteItems,
        showQuoteDrawer, setShowQuoteDrawer,
        quoteNotes, setQuoteNotes,
        submittingQuote, setSubmittingQuote,
        quoteSuccess, setQuoteSuccess,

        modifierItem, setModifierItem,
        activeModifiers, setActiveModifiers,
        modifierMode, setModifierMode,

        donationItem, setDonationItem,
        donationAmount, setDonationAmount,

        leadName, setLeadName,
        leadEmail, setLeadEmail,
        leadPhone, setLeadPhone,
        leadMessage, setLeadMessage,
        submittingLead, setSubmittingLead,
        leadSuccess, setLeadSuccess,

        showBookingDrawer, setShowBookingDrawer,
        bookingDate, setBookingDate,
        bookingTime, setBookingTime,
        submittingBooking, setSubmittingBooking,
        bookingSuccess, setBookingSuccess,
        bookingCustomFields, setBookingCustomFields,
      }}
    >
      {children}
    </PublicPageContext.Provider>
  );
}

export function usePublicPage() {
  const context = useContext(PublicPageContext);
  if (!context) {
    throw new Error("usePublicPage must be used within a PublicPageProvider");
  }
  return context;
}
