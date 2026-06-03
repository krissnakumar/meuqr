"use client";

import type { ReactNode } from "react";
import {
  ChevronDown,
  Facebook,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { HeroSection } from "./sections/HeroSection";
import { ProductGridSection } from "./sections/ProductGridSection";
import { ServiceListSection } from "./sections/ServiceListSection";
import { WhatsAppCTASection } from "./sections/WhatsAppCTASection";
import { QuoteFormSection } from "./sections/QuoteFormSection";
import { AppointmentFormSection } from "./sections/AppointmentFormSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { BusinessHoursSection } from "./sections/BusinessHoursSection";

interface PublicPageRendererProps {
  business: any;
  sections: any[];
  onSelectItem?: (item: any) => void;
  isMobileLayout?: boolean;
}

interface CollapsibleSectionShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
}

function toDigits(value: string | null | undefined) {
  return (value || "").replace(/\D/g, "");
}

function getGoogleMapsLink(business: any) {
  const parts = [business?.address, business?.city, business?.state].filter(Boolean);
  const address = parts.join(" • ");
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function getInstagramLink(handle: string | null | undefined) {
  if (!handle) return null;
  const clean = handle.replace(/^@/, "").trim();
  if (!clean) return null;
  return clean.startsWith("http") ? clean : `https://instagram.com/${clean}`;
}

function getFacebookLink(value: string | null | undefined) {
  if (!value) return null;
  const clean = value.trim();
  if (!clean) return null;
  return clean.startsWith("http") ? clean : `https://facebook.com/${clean.replace(/^\//, "")}`;
}

function getWebsiteLink(value: string | null | undefined) {
  if (!value) return null;
  const clean = value.trim();
  if (!clean) return null;
  return clean.startsWith("http") ? clean : `https://${clean}`;
}

function CollapsibleSectionShell({
  title,
  subtitle,
  badge,
  children,
  defaultOpen = true,
  id,
}: CollapsibleSectionShellProps) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className="group scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 select-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-black text-[#0F172A]">
              {title}
            </span>
            {badge && (
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 text-slate-400 transition-transform group-open:text-slate-600">
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}

function StaticSectionShell({
  title,
  subtitle,
  badge,
  children,
  id,
}: CollapsibleSectionShellProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 select-none">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-black text-[#0F172A]">
              {title}
            </span>
            {badge && (
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">{children}</div>
    </section>
  );
}

function ContactAction({
  href,
  icon,
  label,
  className,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3.5 py-2 text-[11px] font-semibold text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white ${className || "hover:border-indigo-200 hover:text-indigo-600"}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function ContactInfoSection({ business }: { business: any }) {
  const mapsLink = getGoogleMapsLink(business);
  const whatsapp = toDigits(business?.whatsapp);
  const phone = toDigits(business?.phone);
  const instagram = getInstagramLink(business?.instagram);
  const facebook = getFacebookLink(business?.facebook);
  const website = getWebsiteLink(business?.website);
  const addressParts = [business?.address, business?.city, business?.state].filter(Boolean);
  const address = addressParts.join(" • ");

  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm">
      {address && mapsLink && (
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0F172A]">Endereço</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">{address}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Abrir no mapa
              </p>
            </div>
          </div>
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        {whatsapp && (
          <ContactAction
            href={`https://wa.me/${whatsapp}`}
            icon={<MessageCircle className="h-4 w-4 text-emerald-600" />}
            label="WhatsApp"
            className="border-emerald-100 hover:border-emerald-200 hover:text-emerald-700"
          />
        )}
        {phone && (
          <ContactAction
            href={`tel:${phone}`}
            icon={<Phone className="h-4 w-4 text-slate-600" />}
            label="Telefone"
            className="border-slate-200 hover:border-slate-300 hover:text-slate-800"
          />
        )}
        {instagram && (
          <ContactAction
            href={instagram}
            icon={<Instagram className="h-4 w-4 text-pink-600" />}
            label="Instagram"
            className="border-pink-100 hover:border-pink-200 hover:text-pink-600"
          />
        )}
        {facebook && (
          <ContactAction
            href={facebook}
            icon={<Facebook className="h-4 w-4 text-blue-600" />}
            label="Facebook"
            className="border-blue-100 hover:border-blue-200 hover:text-blue-600"
          />
        )}
        {website && (
          <ContactAction
            href={website}
            icon={<Globe className="h-4 w-4 text-indigo-600" />}
            label="Website"
            className="border-indigo-100 hover:border-indigo-200 hover:text-indigo-600"
          />
        )}
      </div>
    </div>
  );
}

function GallerySection({ section }: { section: any }) {
  const items = section?.items || [];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm">
        <p className="text-xs leading-relaxed text-[#64748B]">
          {section?.description || "Conteúdo em breve."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item: any) => (
        <figure key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="aspect-[4/3] bg-slate-50">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name || "Imagem"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Sem imagem
              </div>
            )}
          </div>
          {(item.name || item.description) && (
            <figcaption className="p-3">
              {item.name && <p className="text-xs font-bold text-[#0F172A]">{item.name}</p>}
              {item.description && <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#64748B]">{item.description}</p>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function renderGenericSection(
  section: any,
  businessPhone: string | null = null,
  businessName = "",
  onSelectItem?: (item: any) => void,
  compact = false
) {
  const items = section?.items || [];

  if (items.length > 0) {
    const usesServices = items.some((item: any) => item?.item_type === "service");

    return usesServices ? (
      <ServiceListSection
        title={section?.name || "Serviços"}
        items={items}
        businessPhone={businessPhone}
        businessName={businessName}
        hideTitle={compact}
      />
    ) : (
      <ProductGridSection
        title={section?.name || "Catálogo"}
        items={items}
        businessPhone={businessPhone}
        businessName={businessName}
        onSelectItem={onSelectItem}
        hideTitle={compact}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm">
      {compact ? (
        <p className="text-xs leading-relaxed text-[#64748B]">
          {section?.description || "Conteúdo em breve."}
        </p>
      ) : (
        <>
          <h2 className="border-l-4 border-indigo-600 pl-2.5 text-lg font-black text-[#0F172A]">
            {section?.name || "Seção"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
            {section?.description || "Conteúdo em breve."}
          </p>
        </>
      )}
    </div>
  );
}

function renderSectionCard(
  section: any,
  children: ReactNode,
  options: {
    title?: string;
    subtitle?: string;
    badge?: string;
    defaultOpen?: boolean;
    id?: string;
    mobileStatic?: boolean;
  } = {}
) {
  return (
    <div
      id={options.id || section.id}
      key={section.id}
      className="scroll-mt-28 md:animate-fade-in"
    >
      {options.mobileStatic ? (
        <StaticSectionShell
          id={options.id || section.id}
          title={options.title || section?.name || "Seção"}
          subtitle={options.subtitle}
          badge={options.badge}
        >
          {children}
        </StaticSectionShell>
      ) : (
        <CollapsibleSectionShell
          id={options.id || section.id}
          title={options.title || section?.name || "Seção"}
          subtitle={options.subtitle}
          badge={options.badge}
          defaultOpen={options.defaultOpen ?? true}
        >
          {children}
        </CollapsibleSectionShell>
      )}
    </div>
  );
}

function renderStandaloneSection(
  section: any,
  children: ReactNode,
  mobileStatic = false
) {
  return (
    <div
      id={section.id}
      key={section.id}
      className={`scroll-mt-28 ${mobileStatic ? "" : "md:animate-fade-in"}`}
    >
      {children}
    </div>
  );
}

export function PublicPageRenderer({
  business,
  sections,
  onSelectItem,
  isMobileLayout = false,
}: PublicPageRendererProps) {
  const openAndScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;

    const details = element.closest("details");
    if (details && details instanceof HTMLDetailsElement) {
      details.open = true;
    }

    element.scrollIntoView({
      behavior: isMobileLayout ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleBookService = (_service: any) => {
    openAndScrollTo("appointment-booking-section");
  };

  const renderFallbackCatalogSection = (section: any) => {
    const items = section?.items || [];
    const title = section?.name || "Catálogo";

    if (items.length === 0) {
      return renderSectionCard(
        section,
        renderGenericSection(section, business.whatsapp, business.name, onSelectItem, true),
        {
          title,
          subtitle: section?.description || "Toque para expandir",
          mobileStatic: isMobileLayout,
        }
      );
    }

    return renderSectionCard(
      section,
      <ProductGridSection
        title={title}
        items={items}
        businessPhone={business.whatsapp}
        businessName={business.name}
        onSelectItem={onSelectItem}
        hideTitle
      />,
      {
        title,
        badge: `${items.length} ${items.length === 1 ? "item" : "itens"}`,
        subtitle: section?.description || "Toque para expandir ou recolher",
        mobileStatic: isMobileLayout,
      }
    );
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <HeroSection business={business} />
        <WhatsAppCTASection
          businessPhone={business.whatsapp}
          businessName={business.name}
        />
        <BusinessHoursSection hours={business.opening_hours} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {sections.map((section) => {
        const items = section?.items || [];
        const sectionType = (section?.section_type || "").toLowerCase();
        const sectionTitle = section?.name || "Seção";
        const sectionBadge = items.length > 0 ? `${items.length} ${items.length === 1 ? "item" : "itens"}` : undefined;
        const sectionSubtitle = section?.description || "Toque para expandir ou recolher";

        switch (sectionType) {
          case "hero":
            return renderStandaloneSection(
              section,
              <HeroSection business={business} heroItem={items[0] || null} />,
              isMobileLayout
            );

          case "product_grid":
          case "menu_list":
          case "menu":
          case "product_catalog":
          case "products":
          case "order_form":
          case "promotions":
            return renderFallbackCatalogSection(section);

          case "gallery":
            return renderSectionCard(
              section,
              <GallerySection section={section} />,
              {
                title: sectionTitle,
                badge: sectionBadge,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          case "contact":
          case "map_contact":
            return renderSectionCard(
              section,
              <ContactInfoSection business={business} />,
              {
                title: sectionTitle,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          case "service_list":
          case "services":
          case "service":
            return renderSectionCard(
              section,
              <ServiceListSection
                title={sectionTitle}
                items={items}
                businessPhone={business.whatsapp}
                businessName={business.name}
                onBookService={handleBookService}
                hideTitle
              />,
              {
                title: sectionTitle,
                badge: sectionBadge,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          case "whatsapp_cta":
          case "whatsapp":
            return renderSectionCard(
              section,
              <WhatsAppCTASection
                businessPhone={business.whatsapp}
                businessName={business.name}
              />,
              {
                title: sectionTitle,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          case "quote_form":
          case "quote":
          case "quote_request":
            return renderSectionCard(
              section,
              <QuoteFormSection
                businessId={business.id}
                pageId={section?.page_id || null}
                businessName={business.name}
              />,
              {
                title: sectionTitle,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          case "appointment_form":
          case "booking":
          case "appointment":
          case "appointment_booking":
          case "bookings":
            return renderSectionCard(
              section,
              <div id="appointment-booking-section">
                <AppointmentFormSection
                  businessId={business.id}
                  services={items}
                  businessName={business.name}
                />
              </div>,
              {
                title: sectionTitle,
                badge: sectionBadge,
                subtitle: sectionSubtitle,
                id: section.id,
                mobileStatic: isMobileLayout,
              }
            );

          case "reviews":
            return renderSectionCard(
              section,
              <ReviewsSection reviews={items} />,
              {
                title: sectionTitle,
                badge: sectionBadge,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          case "business_hours":
          case "hours":
          case "opening_hours":
            return renderSectionCard(
              section,
              <BusinessHoursSection hours={business.opening_hours} />,
              {
                title: sectionTitle,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          case "info":
          case "text":
          case "schedule":
          case "events":
          case "faq":
            return renderSectionCard(
              section,
              renderGenericSection(section, business.whatsapp, business.name, onSelectItem, true),
              {
                title: sectionTitle,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );

          default: {
            const usesServices = items.some((item: any) => item?.item_type === "service");

            if (items.length > 0) {
              return usesServices ? renderSectionCard(
                section,
                <ServiceListSection
                  title={sectionTitle}
                  items={items}
                  businessPhone={business.whatsapp}
                  businessName={business.name}
                  onBookService={handleBookService}
                  hideTitle
                />,
                {
                  title: sectionTitle,
                  badge: sectionBadge,
                  subtitle: sectionSubtitle,
                  mobileStatic: isMobileLayout,
                }
              ) : renderSectionCard(
                section,
                <ProductGridSection
                  title={sectionTitle}
                  items={items}
                  businessPhone={business.whatsapp}
                  businessName={business.name}
                  onSelectItem={onSelectItem}
                  hideTitle
                />,
                {
                  title: sectionTitle,
                  badge: sectionBadge,
                  subtitle: sectionSubtitle,
                  mobileStatic: isMobileLayout,
                }
              );
            }

            return renderSectionCard(
              section,
              renderGenericSection(section, business.whatsapp, business.name, onSelectItem, true),
              {
                title: sectionTitle,
                subtitle: sectionSubtitle,
                mobileStatic: isMobileLayout,
              }
            );
          }
        }
      })}
    </div>
  );
}
