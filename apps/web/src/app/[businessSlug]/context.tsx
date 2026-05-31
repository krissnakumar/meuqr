"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SectionItem } from "@meuqr/shared"; // adjust import

interface PublicPageContextType {
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
  setBookingCustomFields: (fields: Record<string, string>) => void;
}

const PublicPageContext = createContext<PublicPageContextType | undefined>(undefined);

export function PublicPageProvider({ children }: { children: ReactNode }) {
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCustomFields, setBookingCustomFields] = useState<Record<string, string>>({});

  return (
    <PublicPageContext.Provider
      value={{
        showBookingDrawer,
        setShowBookingDrawer,
        bookingDate,
        setBookingDate,
        bookingTime,
        setBookingTime,
        submittingBooking,
        setSubmittingBooking,
        bookingSuccess,
        setBookingSuccess,
        bookingCustomFields,
        setBookingCustomFields,
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
