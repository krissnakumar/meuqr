"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  MapPin,
  Clock,
  Instagram,
  Share2,
  QrCode,
  ChevronDown,
  ShoppingCart,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

async function trackClick(clickType: string, pageId?: string) {
  try {
    await fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clickType,
        pageId: pageId || undefined,
      }),
    });
  } catch {
    // Silent fail for tracking
  }
}

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  pix_key: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  instagram: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
}

interface SectionItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  item_type: string;
  is_available: boolean;
  sort_order: number;
}

interface PageSection {
  id: string;
  name: string;
  slug: string;
  section_type: string | null;
  sort_order: number;
  is_visible: boolean;
  items: SectionItem[];
}

import { Button } from "@meuqr/ui";

export function PublicBusinessPageClient({
  business,
  page,
  pages = [],
  sections,
}: {
  business: BusinessData;
  page: { id: string; title: string; slug: string };
  pages?: { id: string; title: string; slug: string }[];
  sections: PageSection[];
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [orderItems, setOrderItems] = useState<{ item: SectionItem; qty: number }[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    // Expand first section by default
    if (sections.length > 0) {
      setExpandedSections({ [sections[0].id]: true });
    }
  }, [sections]);

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function addToOrder(item: SectionItem) {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  }

  function removeFromOrder(itemId: string) {
    setOrderItems((prev) => prev.filter((i) => i.item.id !== itemId));
  }

  function updateQty(itemId: string, qty: number) {
    if (qty <= 0) {
      removeFromOrder(itemId);
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, qty } : i))
    );
  }

  const totalOrder = orderItems.reduce(
    (sum, i) => sum + (i.item.price || 0) * i.qty,
    0
  );

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: business.name, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleWhatsApp() {
    if (!business.whatsapp) return;
    trackClick("whatsapp", page.id);
    const text = `Olá! Vim pelo MeuQR e gostaria de mais informações.`;
    window.open(
      `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function getWhatsAppLink(extraText?: string): string {
    if (!business.whatsapp) return "#";
    const msg = extraText
      ? `Olá! Gostaria de pedir: ${extraText}`
      : `Olá! Vim pelo MeuQR e gostaria de mais informações.`;
    return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  function handleWhatsAppLinkClick() {
    trackClick("whatsapp", page.id);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] max-w-lg mx-auto pb-24">
      {/* Cover Image */}
      {business.cover_url && (
        <div className="h-48 bg-gray-200">
          <img
            src={business.cover_url}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start gap-4">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#111827] flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-white">
                {business.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#111827]">
              {business.name}
            </h1>
            {business.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {business.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {business.whatsapp && (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppLinkClick}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00C853] text-white rounded-xl py-3 font-medium text-sm hover:bg-[#00B34A] transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          )}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-[#111827] text-white rounded-xl py-3 px-4 font-medium text-sm hover:bg-[#1f2937] transition-colors shadow-sm"
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            {copied ? "Copiado!" : "Compartilhar"}
          </button>
        </div>

        {/* Info Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {business.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                business.address + (business.city ? `, ${business.city}` : "")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {business.city || business.address?.split(",")[0]}
            </a>
          )}
          {business.instagram && (
            <a
              href={`https://instagram.com/${business.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              {business.instagram}
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Site
            </a>
          )}
        </div>
      </div>

      {/* Page Navigation Tabs */}
      {pages.length > 1 && (
        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {pages.map((p) => {
              const isActive = p.id === page.id;
              return (
                <a
                  key={p.id}
                  href={`/${business.slug}?p=${p.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-[#111827] text-white border-[#111827] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {p.title}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections with Items */}
      <div className="px-4 space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-[#111827]">
                {section.name}
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedSections[section.id] ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Section Items */}
            {expandedSections[section.id] && (
              <div className="px-4 pb-4 space-y-2">
                {section.items.length === 0 ? (
                  <div className="text-center py-4">
                    {section.section_type === "whatsapp" && (
                      <button
                        onClick={handleWhatsApp}
                        className="w-full flex items-center justify-center gap-2 bg-[#00C853] text-white rounded-xl py-3 font-medium"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Fale conosco no WhatsApp
                      </button>
                    )}
                    {section.section_type === "booking" && (
                      <button
                        onClick={handleWhatsApp}
                        className="w-full flex items-center justify-center gap-2 bg-[#111827] text-white rounded-xl py-3 font-medium"
                      >
                        Agendar via WhatsApp
                      </button>
                    )}
                    {section.section_type === "rsvp" && (
                      <button
                        onClick={handleWhatsApp}
                        className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-white rounded-xl py-3 font-medium"
                      >
                        Confirmar Presença
                      </button>
                    )}
                    {!section.section_type && (
                      <p className="text-sm text-gray-400">
                        Em breve
                      </p>
                    )}
                  </div>
                ) : (
                  section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-xl ${
                        item.price ? "bg-gray-50" : ""
                      } ${!item.is_available ? "opacity-50" : ""}`}
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[#111827]">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {item.price !== null && item.price > 0 && (
                          <div>
                            <p className="text-sm font-bold text-[#111827]">
                              R$ {item.price.toFixed(2)}
                            </p>
                            {item.original_price && item.original_price > item.price && (
                              <p className="text-xs text-gray-400 line-through">
                                R$ {item.original_price.toFixed(2)}
                              </p>
                            )}
                          </div>
                        )}
                        {item.price !== null && business.whatsapp && item.price > 0 && (
                          <a
                            href={getWhatsAppLink(
                              `${item.name} - R$ ${item.price.toFixed(2)}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleWhatsAppLinkClick}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-[#00C853] font-medium"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Pedir
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed Bottom Bar - WhatsApp */}
      {business.whatsapp && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t border-gray-100 shadow-lg">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppLinkClick}
            className="flex items-center justify-center gap-2 bg-[#00C853] text-white rounded-xl py-3.5 font-medium text-sm hover:bg-[#00B34A] transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Fale conosco no WhatsApp
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-6 mt-8">
        <a
          href="https://meuqr.com.br"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
        >
          <QrCode className="w-3 h-3" />
          Powered by MeuQR
        </a>
      </div>
    </div>
  );
}
