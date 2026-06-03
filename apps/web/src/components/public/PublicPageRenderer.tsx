"use client";

import { getPublicSectionsForVertical } from "@meuqr/shared";
import { HeroSection } from "./sections/HeroSection";
import { ProductGridSection } from "./sections/ProductGridSection";
import { ServiceListSection } from "./sections/ServiceListSection";
import { WhatsAppCTASection } from "./sections/WhatsAppCTASection";
import { QuoteFormSection } from "./sections/QuoteFormSection";
import { AppointmentFormSection } from "./sections/AppointmentFormSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { BusinessHoursSection } from "./sections/BusinessHoursSection";
import { useState } from "react";

interface PublicPageRendererProps {
  business: any;
  sections: any[];
  onSelectItem?: (item: any) => void;
}

export function PublicPageRenderer({
  business,
  sections,
  onSelectItem,
}: PublicPageRendererProps) {
  const [selectedService, setSelectedService] = useState<any>(null);

  // Determine sections based on vertical configuration
  const verticalCategory = business.category || "retail";
  const enabledSections = getPublicSectionsForVertical(verticalCategory);

  // Helper to extract items for a specific section type
  const getSectionData = (type: string) => {
    // Try to find a section that matches the type in section_type or slug
    return sections.find(
      (s) => s.section_type === type || s.slug === type
    );
  };

  const handleBookService = (service: any) => {
    setSelectedService(service);
    // Scroll to appointment form smoothly
    const element = document.getElementById("appointment-booking-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Section is always rendered first */}
      <HeroSection business={business} />

      {/* Render sections dynamically in vertical order */}
      {enabledSections.map((secType) => {
        const section = getSectionData(secType);
        const items = section?.items || [];

        switch (secType) {
          case "product_grid":
            return (
              <div key={secType} className="animate-fade-in">
                <ProductGridSection
                  title={section?.name || "Nossos Produtos"}
                  items={items}
                  businessPhone={business.whatsapp}
                  businessName={business.name}
                  onSelectItem={onSelectItem}
                />
              </div>
            );

          case "menu_list":
            return (
              <div key={secType} className="animate-fade-in">
                {/* For food & beverage, render menu items */}
                <ProductGridSection
                  title={section?.name || "Cardápio"}
                  items={items}
                  businessPhone={business.whatsapp}
                  businessName={business.name}
                  onSelectItem={onSelectItem}
                />
              </div>
            );

          case "service_list":
            const allServices = items.length > 0 ? items : (getSectionData("services")?.items || []);
            return (
              <div key={secType} className="animate-fade-in">
                <ServiceListSection
                  title={section?.name || "Serviços & Procedimentos"}
                  items={allServices}
                  businessPhone={business.whatsapp}
                  businessName={business.name}
                  onBookService={handleBookService}
                />
              </div>
            );

          case "whatsapp_cta":
            return (
              <div key={secType} className="animate-fade-in">
                <WhatsAppCTASection
                  businessPhone={business.whatsapp}
                  businessName={business.name}
                />
              </div>
            );

          case "quote_form":
            return (
              <div key={secType} className="animate-fade-in">
                <QuoteFormSection
                  businessId={business.id}
                  pageId={section?.page_id || null}
                  businessName={business.name}
                />
              </div>
            );

          case "appointment_form":
            const servicesForBooking = getSectionData("service_list")?.items || getSectionData("services")?.items || [];
            return (
              <div id="appointment-booking-section" key={secType} className="animate-fade-in">
                <AppointmentFormSection
                  businessId={business.id}
                  services={servicesForBooking}
                  businessName={business.name}
                />
              </div>
            );

          case "reviews":
            return (
              <div key={secType} className="animate-fade-in">
                <ReviewsSection reviews={[]} />
              </div>
            );

          case "business_hours":
            return (
              <div key={secType} className="animate-fade-in">
                <BusinessHoursSection hours={business.opening_hours} />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
