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
  Plus,
  Minus,
  Trash2,
  X,
  Send,
  Loader2,
  FileText,
  User,
  Mail,
  MessageSquare,
  Heart,
} from "lucide-react";
import { Button, Badge } from "@meuqr/ui";
import { usePublicPage } from "./context";

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

function sanitizeWhatsApp(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 11 || digits.length === 10) {
    return `55${digits}`; // Prepend Brazilian country code
  }
  return digits;
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
  instagram: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
  category?: string | null;
  notification_settings?: any;
  form_schema?: any;
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
  metadata?: any;
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

export function PublicBusinessPageClient({
  business,
  page,
  pages = [],
  sections,
  nearbyBusinesses = [],
}: {
  business: BusinessData;
  page: { id: string; title: string; slug: string };
  pages?: { id: string; title: string; slug: string }[];
  sections: PageSection[];
  nearbyBusinesses?: any[];
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  
  const {
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
  } = usePublicPage();

  useEffect(() => {
    // Expand first section by default
    if (sections.length > 0) {
      setExpandedSections({ [sections[0].id]: true });
    }
  }, [sections]);

  // Check page template types to pre-hook styles
  const isQuotePage = sections.some((s) => s.section_type === "quote");

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // === Shopping Cart Functions ===
  function addToOrder(item: SectionItem) {
    if (item.metadata?.modifiers?.length > 0) {
      setModifierItem(item);
      setModifierMode("order");
      setActiveModifiers({});
      return;
    }
    
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { item, qty: item.metadata?.min_quantity || 1, quality: getDefaultQuality(item.name) }];
    });
  }

  function decrementQty(item: SectionItem) {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (!existing) return prev;
      if (existing.qty <= 1) {
        return prev.filter((i) => i.item.id !== item.id);
      }
      return prev.map((i) =>
        i.item.id === item.id ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }

  function setOrderQty(item: SectionItem, qty: number) {
    setOrderItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.item.id !== item.id);
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) => (i.item.id === item.id ? { ...i, qty } : i));
      }
      return [...prev, { item, qty: Math.max(qty, item.metadata?.min_quantity || 1), quality: getDefaultQuality(item.name) }];
    });
  }

  function removeFromOrder(itemId: string) {
    setOrderItems((prev) => prev.filter((i) => i.item.id !== itemId));
  }

  const totalOrder = orderItems.reduce(
    (sum, i) => {
      let itemTotal = (i.item.price || 0) * i.qty;
      if (i.selectedModifiers) {
        i.selectedModifiers.forEach(modOpt => {
          itemTotal += (modOpt.price || 0) * i.qty;
        });
      }
      return sum + itemTotal;
    },
    0
  );

  function confirmModifiers() {
    if (!modifierItem) return;

    // Convert activeModifiers (Record of mod.name -> selected option names) 
    // into an array of full option objects with prices
    const selectedOptions: any[] = [];
    const itemMods = modifierItem.metadata?.modifiers || [];
    
    // Validation: Check required modifiers
    for (const mod of itemMods) {
      if (mod.required && (!activeModifiers[mod.name] || activeModifiers[mod.name].length === 0)) {
        alert(`Por favor, selecione uma opção para: ${mod.name}`);
        return;
      }
      
      const selectedNames = activeModifiers[mod.name] || [];
      selectedNames.forEach(optName => {
        const optionDetails = mod.options.find((o: any) => o.name === optName);
        if (optionDetails) {
          selectedOptions.push({ modifierName: mod.name, ...optionDetails });
        }
      });
    }

    if (modifierMode === "order") {
      setOrderItems((prev) => [
        ...prev,
        { item: modifierItem, qty: modifierItem.metadata?.min_quantity || 1, quality: getDefaultQuality(modifierItem.name), selectedModifiers: selectedOptions },
      ]);
    } else {
      setQuoteItems((prev) => [
        ...prev,
        { item: modifierItem, qty: modifierItem.metadata?.min_quantity || 1, quality: getDefaultQuality(modifierItem.name), selectedModifiers: selectedOptions },
      ]);
    }

    setModifierItem(null);
    setActiveModifiers({});
  }

  function confirmDonation() {
    if (!donationItem || !donationAmount || Number(donationAmount) <= 0) return;
    
    // We add it to the cart as a normal item, but we override its price!
    const customItem = { ...donationItem, price: Number(donationAmount) };
    
    setOrderItems((prev) => [
      ...prev,
      { item: customItem, qty: 1, quality: "Padrão" },
    ]);
    
    setDonationItem(null);
    setDonationAmount("");
  }

  // === Quote List Functions ===
  function addToQuote(item: SectionItem) {
    if (item.metadata?.modifiers?.length > 0) {
      setModifierItem(item);
      setModifierMode("quote");
      setActiveModifiers({});
      return;
    }

    setQuoteItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { item, qty: item.metadata?.min_quantity || 1, quality: getDefaultQuality(item.name) }];
    });
  }

  function decrementQuoteQty(item: SectionItem) {
    setQuoteItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (!existing) return prev;
      if (existing.qty <= 1) {
        return prev.filter((i) => i.item.id !== item.id);
      }
      return prev.map((i) =>
        i.item.id === item.id ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }

  function setQuoteQty(item: SectionItem, qty: number) {
    setQuoteItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.item.id !== item.id);
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) => (i.item.id === item.id ? { ...i, qty } : i));
      }
      return [...prev, { item, qty, quality: getDefaultQuality(item.name) }];
    });
  }

  function removeFromQuote(itemId: string) {
    setQuoteItems((prev) => prev.filter((i) => i.item.id !== itemId));
  }

  function getDefaultQuality(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("areia") || n.includes("brita") || n.includes("pedra") || n.includes("sand") || n.includes("gravel")) {
      return "Média (Medium)";
    }
    if (n.includes("cimento") || n.includes("argamassa") || n.includes("cement")) {
      return "CPII (Standard)";
    }
    if (n.includes("tijolo") || n.includes("bloco") || n.includes("brick")) {
      return "Classe A (Estrutural)";
    }
    return "Padrão (Standard)";
  }

  function getQualityOptions(name: string): string[] {
    const n = name.toLowerCase();
    if (n.includes("areia") || n.includes("brita") || n.includes("pedra") || n.includes("sand") || n.includes("gravel")) {
      return ["Fina (Fine)", "Média (Medium)", "Grossa (Coarse)"];
    }
    if (n.includes("cimento") || n.includes("argamassa") || n.includes("cement")) {
      return ["CPII (Standard)", "CPIII (Especial)", "CPV (Alta Resistência)"];
    }
    if (n.includes("tijolo") || n.includes("bloco") || n.includes("brick")) {
      return ["Classe A (Estrutural)", "Classe B (Vedação)", "Classe C (Comercial)"];
    }
    return ["Padrão (Standard)", "Premium (Tipo A)", "Econômica (Tipo B)"];
  }

  function updateOrderQuality(itemId: string, quality: string) {
    setOrderItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, quality } : i))
    );
  }

  function updateQuoteQuality(itemId: string, quality: string) {
    setQuoteItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, quality } : i))
    );
  }

  // === Share Helper ===
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

  // === WhatsApp Redirect Helper ===
  function handleWhatsAppRedirect(messageText: string) {
    if (!business.whatsapp) return;
    const cleanPhone = sanitizeWhatsApp(business.whatsapp);
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`,
      "_blank"
    );
  }

  function getWhatsAppLink(extraText?: string): string {
    if (!business.whatsapp) return "#";
    const cleanPhone = sanitizeWhatsApp(business.whatsapp);
    const msg = extraText
      ? `Olá! Gostaria de pedir: ${extraText}`
      : `Olá! Vim pelo MeuQR e gostaria de mais informações.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setSubmittingOrder(true);
    trackClick("order", page.id);

    try {
      const payload = {
        businessId: business.id,
        pageId: page.id,
        customerName,
        customerPhone,
        customerEmail,
        items: orderItems.map((oi) => ({
          id: oi.item.id,
          name: oi.item.name,
          qty: oi.qty,
          price: oi.item.price,
          quality: oi.quality,
        })),
        total: totalOrder,
        paymentMethod,
        notes: orderNotes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao processar pedido.");

      const itemsList = orderItems.map((oi) => `• ${oi.qty}x ${oi.item.name} - R$ ${(oi.item.price! * oi.qty).toFixed(2)}`).join("\n");
      const waMsg = `*Novo Pedido - ${business.name}*\n` +
        `---------------------------------\n` +
        `👤 *Cliente:* ${customerName}\n` +
        `📞 *Telefone:* ${customerPhone}\n` +
        `💳 *Pagamento:* ${paymentMethod}\n` +
        (orderNotes ? `📝 *Observações:* ${orderNotes}\n` : "") +
        `---------------------------------\n` +
        `🛒 *Itens do pedido:*\n${itemsList}\n` +
        `---------------------------------\n` +
        `💰 *Total:* R$ ${totalOrder.toFixed(2)}`;

      setTimeout(() => {
        handleWhatsAppRedirect(waMsg);
        setOrderItems([]);
        setShowOrderDrawer(false);
        setOrderSuccess(false);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setOrderNotes("");
      }, 3000);

    } catch (err) {
      alert("Houve um problema ao finalizar o pedido. Tente novamente.");
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setSubmittingQuote(true);
    trackClick("quote", page.id);

    try {
      const payload = {
        businessId: business.id,
        pageId: page.id,
        customerName,
        customerPhone,
        customerEmail,
        items: quoteItems.map((qi) => ({
          id: qi.item.id,
          name: qi.item.name,
          qty: qi.qty,
          quality: qi.quality,
        })),
        message: quoteNotes,
      };

      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar cotação.");

      setQuoteSuccess(true);

      const itemsList = quoteItems.map((qi) => `• ${qi.qty}x ${qi.item.name} (${qi.quality})`).join("\n");
      const waMsg = `*Solicitação de Orçamento - ${business.name}*\n` +
        `---------------------------------\n` +
        `👤 *Cliente:* ${customerName}\n` +
        `📞 *Telefone:* ${customerPhone}\n` +
        (customerEmail ? `✉️ *E-mail:* ${customerEmail}\n` : "") +
        (quoteNotes ? `📝 *Mensagem:* ${quoteNotes}\n` : "") +
        `---------------------------------\n` +
        `📋 *Itens solicitados:*\n${itemsList}\n` +
        `---------------------------------\n` +
        `Aguardando retorno com preços. Obrigado!`;

      setTimeout(() => {
        handleWhatsAppRedirect(waMsg);
        setQuoteItems([]);
        setShowQuoteDrawer(false);
        setQuoteSuccess(false);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setQuoteNotes("");
      }, 2000);

    } catch (err) {
      alert("Houve um problema ao salvar seu orçamento. Tente novamente.");
    } finally {
      setSubmittingQuote(false);
    }
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    setSubmittingLead(true);
    trackClick("lead", page.id);

    try {
      const payload = {
        businessId: business.id,
        pageId: page.id,
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        message: leadMessage,
        source: "public_page",
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar contato.");

      setLeadSuccess(true);
      
      const waMsg = `*Novo Contato - ${business.name}*\n` +
        `Olá! Acabo de enviar uma mensagem pelo formulário de contato:\n\n` +
        `👤 *Nome:* ${leadName}\n` +
        `📞 *WhatsApp:* ${leadPhone}\n` +
        (leadEmail ? `✉️ *E-mail:* ${leadEmail}\n` : "") +
        (leadMessage ? `📝 *Mensagem:* ${leadMessage}` : "");

      setTimeout(() => {
        handleWhatsAppRedirect(waMsg);
        setLeadName("");
        setLeadEmail("");
        setLeadPhone("");
        setLeadMessage("");
        setLeadSuccess(false);
      }, 2000);

    } catch (err) {
      alert("Erro ao enviar contato. Tente novamente.");
    } finally {
      setSubmittingLead(false);
    }
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !customerPhone || !bookingDate || !bookingTime) return;

    setSubmittingBooking(true);
    trackClick("booking", page.id);

    try {
      let finalNotes = quoteNotes;
      let waCustomFields = "";

      if (Object.keys(bookingCustomFields).length > 0) {
        finalNotes += "\n\nCustom Fields:\n" + Object.entries(bookingCustomFields)
          .map(([key, val]) => `${key}: ${val}`)
          .join("\n");
        
        waCustomFields = Object.entries(bookingCustomFields)
          .map(([key, val]) => `*${key}:* ${val}`)
          .join("\n") + "\n";
      }

      const payload = {
        businessId: business.id,
        customerName,
        customerPhone,
        customerEmail,
        appointmentDate: bookingDate,
        appointmentTime: bookingTime + ":00", // pad seconds
        notes: quoteNotes,
        customFields: bookingCustomFields,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar agendamento.");

      setBookingSuccess(true);
      
      const waMsg = `*Novo Agendamento*\n\n` +
        `👤 *Cliente:* ${customerName}\n` +
        `📞 *Telefone:* ${customerPhone}\n` +
        `📅 *Data:* ${bookingDate.split('-').reverse().join('/')}\n` +
        `⏰ *Horário:* ${bookingTime}\n` +
        waCustomFields +
        `Gostaria de confirmar minha solicitação.`;

      setTimeout(() => {
        handleWhatsAppRedirect(waMsg);
        setShowBookingDrawer(false);
        setBookingSuccess(false);
        setCustomerName("");
        setCustomerPhone("");
        setBookingDate("");
        setBookingTime("");
        setBookingCustomFields({});
        setQuoteNotes("");
      }, 2000);

    } catch (err) {
      alert("Erro ao enviar agendamento. Tente novamente.");
    } finally {
      setSubmittingBooking(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] max-w-lg mx-auto pb-24 relative shadow-md">
      {/* Cover Image & Banner */}
      <div className="h-56 relative w-full overflow-hidden bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500">
        {/* Floating gradient blobs for ultimate dynamic aesthetics */}
        <div className="absolute top-6 left-12 w-28 h-28 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 right-10 w-24 h-24 bg-emerald-400/20 rounded-full blur-lg" />
        
        {business.cover_url ? (
          <img
            src={business.cover_url}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <QrCode className="w-16 h-16 text-white/20 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Floating Profile Info Overlap */}
      <div className="px-6 relative -mt-12 z-10 flex flex-col items-start">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            className="w-24 h-24 rounded-3xl object-cover shadow-xl border-4 border-white bg-white"
          />
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-[#111827] flex items-center justify-center shadow-xl border-4 border-white text-white">
            <span className="text-3xl font-black">{business.name.charAt(0)}</span>
          </div>
        )}

        <div className="mt-4 w-full">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              {business.name}
            </h1>
            {business.category && (
              <Badge variant="accent" className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                {business.category.replace("_", " ")}
              </Badge>
            )}
          </div>

          {business.description && (
            <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
              {business.description}
            </p>
          )}
        </div>
      </div>

      {/* Minimalistic & Compact Header Actions */}
      <div className="px-6 flex items-center gap-2.5 mt-4">
        {business.whatsapp && (
          <button
            onClick={() => handleWhatsAppRedirect("Olá! Vim pelo MeuQR e gostaria de mais informações.")}
            className="w-9 h-9 rounded-full bg-[#00C853]/10 hover:bg-[#00C853]/20 text-[#00C853] flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
            title="WhatsApp"
          >
            <MessageCircle className="w-4.5 h-4.5" />
          </button>
        )}

        {business.instagram && (
          <a
            href={`https://instagram.com/${business.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
            title="Instagram"
          >
            <Instagram className="w-4.5 h-4.5" />
          </a>
        )}

        <button
          onClick={handleShare}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
          title="Compartilhar"
        >
          {copied ? (
            <Check className="w-4.5 h-4.5 text-emerald-600" />
          ) : (
            <Share2 className="w-4.5 h-4.5" />
          )}
        </button>
      </div>

      {/* Modern Floating Info Chips */}
      <div className="px-6 py-4 flex flex-wrap gap-2">
        {business.address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              business.address + (business.city ? `, ${business.city}` : "")
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-600 border border-gray-200/80 hover:border-gray-300 shadow-sm transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            {business.city || business.address?.split(",")[0]}
          </a>
        )}
        {business.website && (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-600 border border-gray-200/80 hover:border-gray-300 shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            Site
          </a>
        )}
      </div>

      {/* Premium Sticky Glassmorphic Page Navigation Tabs */}
      {pages.length > 1 && (
        <div className="sticky top-0 z-30 backdrop-blur-md bg-[#F9FAFB]/90 border-b border-gray-200/50 py-3 mb-6 transition-all">
          <div className="px-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {pages.map((p) => {
                const isActive = p.id === page.id;
                // Generate path based on current window location prefix
                let href = `/${business.slug}?p=${p.slug}`;
                if (typeof window !== "undefined" && window.location.pathname.includes("/b/")) {
                  href = `/b/${business.slug}/${p.slug}`;
                }
                const activeColor = (business as any).brand_color || "#4F46E5";

                return (
                  <a
                    key={p.id}
                    href={href}
                    style={{
                      borderColor: isActive ? activeColor : "transparent",
                      backgroundColor: isActive ? `${activeColor}10` : "white",
                      color: isActive ? activeColor : "#4B5563"
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm ${
                      isActive
                        ? "shadow-indigo-100/50 font-black scale-105"
                        : "border-gray-200/80 hover:border-gray-300 hover:text-gray-900 active:scale-95"
                    }`}
                  >
                    {p.title}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}



      {/* Sections with Items */}
      <div className="px-6 space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            id={section.id}
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
                        onClick={() => handleWhatsAppRedirect("Olá! Vim pelo MeuQR e gostaria de mais informações.")}
                        className="w-full flex items-center justify-center gap-2 bg-[#00C853] text-white rounded-xl py-3 font-medium hover:bg-[#00B34A]"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Fale conosco no WhatsApp
                      </button>
                    )}
                    {section.section_type === "booking" && (
                      <button
                        onClick={() => setShowBookingDrawer(true)}
                        className="w-full flex items-center justify-center gap-2 bg-[#111827] text-white rounded-xl py-3 font-medium hover:bg-[#1f2937]"
                      >
                        Agendar Horário
                      </button>
                    )}
                    {section.section_type === "rsvp" && (
                      <button
                        onClick={() => handleWhatsAppRedirect("Olá! Gostaria de confirmar minha presença.")}
                        className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-white rounded-xl py-3 font-medium hover:bg-[#c29e2f]"
                      >
                        Confirmar Presença
                      </button>
                    )}
                    {section.section_type === "info" && (
                      <p className="text-sm text-gray-500 text-center">
                        Informações adicionais serão publicadas em breve.
                      </p>
                    )}
                    {section.section_type === "gallery" && (
                      <p className="text-sm text-gray-500 text-center">
                        Galeria de fotos em construção.
                      </p>
                    )}
                    {section.section_type === "schedule" && (
                      <p className="text-sm text-gray-500 text-center">
                        Agenda não disponível no momento.
                      </p>
                    )}
                    {section.section_type === "events" && (
                      <p className="text-sm text-gray-500 text-center">
                        Nenhum evento programado.
                      </p>
                    )}
                    {!["whatsapp", "booking", "rsvp", "info", "gallery", "schedule", "events"].includes(section.section_type || "") && (
                      <p className="text-sm text-gray-400">
                        Nenhum item disponível no momento.
                      </p>
                    )}
                  </div>
                ) : (
                  section.items.map((item) => {
                    const cartItem = orderItems.find((oi) => oi.item.id === item.id);
                    const quoteItem = quoteItems.find((qi) => qi.item.id === item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 ${
                          !item.is_available ? "opacity-50" : ""
                        }`}
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
                          
                          {/* Polymorphic Metadata Presentation */}
                          {item.metadata && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {(business.category === "salon" || business.category === "clinic") && (
                                <>
                                  {item.metadata.duration_minutes && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      <Clock className="w-3 h-3" />
                                      {item.metadata.duration_minutes} min
                                    </span>
                                  )}
                                  {item.metadata.preparation_instructions && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" title={item.metadata.preparation_instructions}>
                                      ⚠️ Requer Preparo
                                    </span>
                                  )}
                                  {item.metadata.accepted_insurances && Array.isArray(item.metadata.accepted_insurances) && item.metadata.accepted_insurances.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                      🏥 Aceita Convênio
                                    </span>
                                  )}
                                </>
                              )}
                              
                              {business.category === "real_estate" && (
                                <>
                                  {item.metadata.bedrooms > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      🛏️ {item.metadata.bedrooms} Quartos
                                    </span>
                                  )}
                                  {item.metadata.bathrooms > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      🚿 {item.metadata.bathrooms} Banheiros
                                    </span>
                                  )}
                                  {item.metadata.area_sqm > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      📏 {item.metadata.area_sqm} m²
                                    </span>
                                  )}
                                </>
                              )}

                              {item.metadata.dietary && Array.isArray(item.metadata.dietary) && item.metadata.dietary.map((diet: string) => (
                                <span key={diet} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shadow-sm">
                                  {diet === 'vegan' ? '🌱 Vegano' : diet === 'vegetarian' ? '🧀 Vegetariano' : diet === 'gluten_free' ? '🌾 Sem Glúten' : diet === 'spicy' ? '🌶️ Apimentado' : diet}
                                </span>
                              ))}

                              {item.metadata.min_quantity && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded shadow-sm">
                                  Mínimo: {item.metadata.min_quantity} {item.metadata.unit_type || 'un'}
                                </span>
                              )}

                              {item.metadata.modifiers && item.metadata.modifiers.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  Opções Disponíveis
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end justify-between min-h-[60px]">
                          {item.price !== null && item.price > 0 ? (
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
                          ) : (
                            <div className="h-4" />
                          )}

                          {/* Add to Cart or Quote Controls */}
                          {item.is_available && (
                            <>
                              {section.section_type === "quote" ? (
                                // B2B Quote controls
                                quoteItem ? (
                                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full p-1 mt-1 shadow-sm shrink-0">
                                    <button
                                      onClick={() => decrementQuoteQty(item)}
                                      className="p-1 hover:bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                      type="number"
                                      step={item.metadata?.unit_type ? "0.01" : "1"}
                                      min="0"
                                      value={quoteItem.qty}
                                      onChange={(e) => setQuoteQty(item, parseFloat(e.target.value) || 0)}
                                      className="w-10 text-xs font-bold text-gray-800 text-center bg-transparent border-none focus:ring-0 p-0"
                                    />
                                    <button
                                      onClick={() => addToQuote(item)}
                                      className="p-1 hover:bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToQuote(item)}
                                    className="mt-1 flex items-center justify-center bg-[#111827] text-white w-7 h-7 rounded-full hover:bg-gray-800 shadow-sm transition-all active:scale-95 shrink-0"
                                    title="Adicionar à cotação"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )
                              ) : (business.category === "salon" || business.category === "clinic") ? (
                                  <button
                                    onClick={() => {
                                      setBookingCustomFields(prev => ({ ...prev, Servico: item.name }));
                                      setShowBookingDrawer(true);
                                    }}
                                    className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm"
                                  >
                                    Agendar
                                  </button>
                                ) : business.category === "real_estate" ? (
                                  <button
                                    onClick={() => handleWhatsAppRedirect(`Olá! Gostaria de agendar uma visita para o imóvel: ${item.name}`)}
                                    className="mt-1 bg-[#111827] hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm"
                                  >
                                    Agendar Visita
                                  </button>
                                ) : (business.category === "church" || business.category === "nonprofit") ? (
                                  <button
                                    onClick={() => {
                                      setDonationItem(item);
                                      setDonationAmount(item.price || "");
                                    }}
                                    className="mt-1 bg-[#D4AF37] hover:bg-[#c29e2f] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm"
                                  >
                                    Contribuir
                                  </button>
                                ) : (
                                  // General Menu Orders
                                  item.price && item.price > 0 ? (
                                    cartItem ? (
                                      <div className="flex items-center gap-1.5 bg-white border border-[#00C853]/30 rounded-full p-1 mt-1 shadow-sm shrink-0">
                                        <button
                                          onClick={() => decrementQty(item)}
                                          className="p-1 hover:bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform"
                                        >
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <input
                                            type="number"
                                            step={item.metadata?.unit_type ? "0.01" : "1"}
                                            min="0"
                                            value={cartItem.qty}
                                            onChange={(e) => setOrderQty(item, parseFloat(e.target.value) || 0)}
                                            className="w-10 text-xs font-bold text-[#00C853] text-center bg-transparent border-none focus:ring-0 p-0"
                                          />
                                        <button
                                          onClick={() => addToOrder(item)}
                                          className="p-1 hover:bg-[#00C853]/15 rounded-full text-[#00C853] active:scale-90 transition-transform"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => addToOrder(item)}
                                        className="mt-1 flex items-center justify-center bg-[#00C853] text-white w-7 h-7 rounded-full hover:bg-[#00B34A] shadow-sm transition-all active:scale-95 shrink-0"
                                        title="Pedir"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )
                                  ) : (
                                    // Direct info button if no price
                                    business.whatsapp && (
                                      <button
                                        onClick={() => handleWhatsAppRedirect(`Olá! Gostaria de agendar: ${item.name}`)}
                                        className="mt-1 flex items-center gap-1 text-xs text-[#00C853] font-medium"
                                      >
                                        <MessageCircle className="w-3 h-3" /> Falar
                                      </button>
                                    )
                                  )
                                )
                              }
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sleek Contact / Lead Form Block if required */}
      {sections.some((s) => s.section_type === "lead" || s.section_type === "contact") && (
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Mail className="text-[#111827] w-5 h-5" /> Enviar Mensagem
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Preencha os dados abaixo e entraremos em contato o mais rápido possível.
            </p>
            <form onSubmit={submitLead} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Seu Nome *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">WhatsApp / Telefone *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">E-mail (Opcional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Ex: joao@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Sua Mensagem</label>
                <textarea
                  value={leadMessage}
                  onChange={(e) => setLeadMessage(e.target.value)}
                  placeholder="Olá! Gostaria de falar sobre..."
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLead}
                className="w-full bg-[#111827] hover:bg-gray-800 text-white py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {submittingLead ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Enviar para WhatsApp
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {orderItems.length > 0 && !showOrderDrawer && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-slide-up">
          <button
            onClick={() => setShowOrderDrawer(true)}
            className="w-full flex items-center justify-between bg-black/90 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative bg-[#00C853] p-2 rounded-xl">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#111827] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {orderItems.reduce((sum, oi) => sum + oi.qty, 0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-400">Ver sacola</p>
                <p className="text-sm font-bold text-white">R$ {totalOrder.toFixed(2)}</p>
              </div>
            </div>
            <span className="bg-white/15 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white/20 transition-colors">
              Continuar
            </span>
          </button>
        </div>
      )}

      {/* Floating Bottom Quote Bar */}
      {quoteItems.length > 0 && !showQuoteDrawer && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-slide-up">
          <button
            onClick={() => setShowQuoteDrawer(true)}
            className="w-full flex items-center justify-between bg-[#111827] text-white rounded-2xl p-4 shadow-xl border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative bg-white/10 p-2 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {quoteItems.reduce((sum, qi) => sum + qi.qty, 0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-400">Itens para orçamento</p>
                <p className="text-sm font-bold text-white">
                  {quoteItems.length} {quoteItems.length === 1 ? "item" : "itens"} selecionado(s)
                </p>
              </div>
            </div>
            <span className="bg-white/15 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white/20 transition-colors">
              Ver Orçamento
            </span>
          </button>
        </div>
      )}
      {/* DONATION DRAWER */}
      {donationItem && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setDonationItem(null)} />
          <div className="bg-white rounded-t-[30px] p-6 max-h-[85vh] overflow-y-auto w-full max-w-lg mx-auto shadow-2xl z-10 relative animate-drawer-slide flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#D4AF37]" /> {donationItem.name}
              </h2>
              <button
                onClick={() => setDonationItem(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 overflow-y-auto flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Qual o valor da sua contribuição?</h3>
                <div className="relative inline-flex items-center">
                  <span className="absolute left-4 text-gray-400 font-bold text-xl">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value ? parseFloat(e.target.value) : "")}
                    className="w-full text-center text-4xl font-black text-[#111827] bg-gray-50 border border-gray-200 rounded-2xl py-6 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    placeholder="0,00"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 w-full">
                {[10, 20, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(amount)}
                    className="flex-1 min-w-[70px] bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                  >
                    R$ {amount}
                  </button>
                ))}
              </div>
              
              {donationItem.description && (
                <p className="text-xs text-gray-500 text-center max-w-sm mt-4 bg-gray-50 p-3 rounded-xl">
                  {donationItem.description}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 shrink-0">
              <button
                onClick={confirmDonation}
                disabled={!donationAmount || Number(donationAmount) <= 0}
                className="w-full bg-[#D4AF37] hover:bg-[#c29e2f] text-white py-4 rounded-xl font-bold text-base transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-white/20" /> Confirmar Contribuição
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODIFIERS DRAWER */}
      {modifierItem && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setModifierItem(null)} />
          <div className="bg-white rounded-t-[30px] p-6 max-h-[85vh] overflow-y-auto w-full max-w-lg mx-auto shadow-2xl z-10 relative animate-drawer-slide flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 line-clamp-1">
                {modifierItem.name}
              </h2>
              <button
                onClick={() => setModifierItem(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-6">
              {modifierItem.metadata?.modifiers?.map((mod: any, mIdx: number) => (
                <div key={mIdx}>
                  <div className="flex items-center justify-between mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">{mod.name}</h3>
                    {mod.required ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded">Obrigatório</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Opcional</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {mod.options?.map((opt: any, oIdx: number) => {
                      const isSelected = activeModifiers[mod.name]?.includes(opt.name);
                      return (
                        <label key={oIdx} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setActiveModifiers(prev => {
                                  const currentModSelections = prev[mod.name] || [];
                                  if (checked) {
                                    return { ...prev, [mod.name]: [...currentModSelections, opt.name] };
                                  } else {
                                    return { ...prev, [mod.name]: currentModSelections.filter(n => n !== opt.name) };
                                  }
                                });
                              }}
                              className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{opt.name}</span>
                          </div>
                          {opt.price > 0 && (
                            <span className="text-xs font-bold text-gray-500">+ R$ {opt.price.toFixed(2)}</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 shrink-0">
              <button
                onClick={confirmModifiers}
                className="w-full bg-[#111827] hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md"
              >
                Adicionar {modifierMode === "order" ? "ao Pedido" : "à Cotação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART CHECKOUT DRAWER */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowOrderDrawer(false)} />
          <div className="bg-white rounded-t-[30px] p-6 max-h-[85vh] overflow-y-auto w-full max-w-lg mx-auto shadow-2xl z-10 relative animate-drawer-slide">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <ShoppingCart className="text-[#00C853] w-5 h-5" /> Sua Sacola
              </h2>
              <button
                onClick={() => setShowOrderDrawer(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="py-4 divide-y divide-gray-100 max-h-[30vh] overflow-y-auto scrollbar-none">
              {orderItems.map((oi) => (
                <div key={oi.item.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-bold text-gray-800">{oi.item.name}</p>
                    {oi.selectedModifiers && oi.selectedModifiers.length > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        {oi.selectedModifiers.map((mod: any, idx: number) => (
                          <p key={idx} className="text-[10px] text-gray-500 flex justify-between pr-4">
                            <span>+ {mod.name}</span>
                            {mod.price > 0 && <span>R$ {mod.price.toFixed(2)}</span>}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      R$ {(oi.item.price || 0).toFixed(2)} {oi.item.metadata?.unit_type ? `/ ${oi.item.metadata.unit_type}` : 'cada'}
                    </p>
                    {business.category?.includes("constru") && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Qualidade:</span>
                        <select
                          value={oi.quality}
                          onChange={(e) => updateOrderQuality(oi.item.id, e.target.value)}
                          className="text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                        >
                          {getQualityOptions(oi.item.name).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => decrementQty(oi.item)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        step={oi.item.metadata?.unit_type ? "0.01" : "1"}
                        min="0"
                        value={oi.qty}
                        onChange={(e) => setOrderQty(oi.item, parseFloat(e.target.value) || 0)}
                        className="w-12 text-xs font-bold text-gray-800 text-center bg-transparent border-none focus:ring-0 p-0"
                      />
                      <button
                        onClick={() => addToOrder(oi.item)}
                        className="p-1 hover:bg-gray-100 rounded text-[#00C853]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromOrder(oi.item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="py-4 border-t border-gray-100 flex items-center justify-between font-bold text-[#111827] text-lg">
              <span>Total:</span>
              <span className="text-[#00C853]">R$ {totalOrder.toFixed(2)}</span>
            </div>

            {/* Customer info form */}
            <form onSubmit={submitOrder} className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dados de Entrega</h3>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Seu Nome *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853]/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853]/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">E-mail (Opcional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ex: joao@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853]/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Forma de Pagamento *</label>
                <div className="grid grid-cols-3 gap-2">
                  {["pix", "cartao", "dinheiro"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center capitalize transition-all ${
                        paymentMethod === method
                          ? "bg-[#00C853]/10 border-[#00C853] text-[#00C853]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {method === "cartao" ? "Cartão" : method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Observações do Pedido</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Retirar cebola, trazer troco para R$ 100, etc."
                  rows={2}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853]/50 focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full bg-[#00C853] hover:bg-[#00B34A] text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Enviar Pedido
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B2B QUOTE REQUEST DRAWER */}
      {showQuoteDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowQuoteDrawer(false)} />
          <div className="bg-white rounded-t-[30px] p-6 max-h-[85vh] overflow-y-auto w-full max-w-lg mx-auto shadow-2xl z-10 relative animate-drawer-slide">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <FileText className="text-[#111827] w-5 h-5" /> Solicitar Orçamento
              </h2>
              <button
                onClick={() => setShowQuoteDrawer(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quote Items List */}
            <div className="py-4 divide-y divide-gray-100 max-h-[30vh] overflow-y-auto scrollbar-none">
              {quoteItems.map((qi) => (
                <div key={qi.item.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-bold text-gray-800">{qi.item.name}</p>
                    <p className="text-xs text-gray-400">Adicionado à cotação</p>
                    {business.category?.includes("constru") && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Qualidade:</span>
                        <select
                          value={qi.quality}
                          onChange={(e) => updateQuoteQuality(qi.item.id, e.target.value)}
                          className="text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                        >
                          {getQualityOptions(qi.item.name).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => decrementQuoteQty(qi.item)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        step={qi.item.metadata?.unit_type ? "0.01" : "1"}
                        min="0"
                        value={qi.qty}
                        onChange={(e) => setQuoteQty(qi.item, parseFloat(e.target.value) || 0)}
                        className="w-12 text-xs font-bold text-gray-800 text-center bg-transparent border-none focus:ring-0 p-0"
                      />
                      <button
                        onClick={() => addToQuote(qi.item)}
                        className="p-1 hover:bg-gray-100 rounded text-[#111827]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromQuote(qi.item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer info form */}
            <form onSubmit={submitQuote} className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dados Corporativos / Contato</h3>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Seu Nome *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">E-mail (Opcional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ex: compras@empresa.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Mensagem Adicional</label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Gostaria de cotar frete para o CEP 01001-000, desconto para atacado, etc."
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingQuote}
                className="w-full bg-[#111827] hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
              >
                {submittingQuote ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Solicitar Orçamento via WhatsApp
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM SUCCESS SUBMISSION OVERLAY (Order, Quote or Lead) */}
      {(orderSuccess || quoteSuccess || leadSuccess) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#00C853]/10 flex items-center justify-center text-[#00C853] animate-bounce-subtle">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {orderSuccess ? "Pedido Enviado!" : leadSuccess ? "Sucesso!" : "Pedido Salvo!"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {orderSuccess
                ? "Seu pedido foi recebido com sucesso em nosso sistema! Agradecemos a preferência."
                : leadSuccess
                ? "Sua mensagem foi registrada em nosso banco de dados. Abrindo o WhatsApp..."
                : "Seus itens foram salvos no sistema. Redirecionando para o WhatsApp do vendedor..."}
            </p>
            {!orderSuccess && (
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 mt-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Conectando ao WhatsApp...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearby Businesses */}
      {nearbyBusinesses && nearbyBusinesses.length > 0 && (
        <div className="px-6 py-8 mt-4 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" /> 
            Descubra Perto de Você
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearbyBusinesses.map((biz) => (
              <a
                key={biz.id}
                href={`/${biz.slug}`}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
              >
                {biz.logo_url ? (
                  <img src={biz.logo_url} alt={biz.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 shrink-0">
                    {biz.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors truncate">{biz.name}</h4>
                  <p className="text-xs text-gray-500 capitalize truncate">{biz.category ? biz.category.replace("_", " ") : biz.city}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-6 mt-2">
        <a
          href="https://meuqr.com.br"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <QrCode className="w-3 h-3" />
          Powered by MeuQR
        </a>
      </div>
      {/* BOOKING DRAWER */}
      {showBookingDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowBookingDrawer(false)} />
          <div className="bg-white rounded-t-[30px] p-6 max-h-[85vh] overflow-y-auto w-full max-w-lg mx-auto shadow-2xl z-10 relative animate-drawer-slide">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <Clock className="text-[#00C853] w-5 h-5" /> Agendar Horário
              </h2>
              <button
                onClick={() => setShowBookingDrawer(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitBooking} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Seu Nome *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Dynamic Custom Fields */}
              {(business.form_schema?.appointments || business.notification_settings?.form_schemas?.appointments || []).map((field: any) => (
                <div key={field.id}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    {field.label} {field.required && "*"}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      value={bookingCustomFields[field.label] || ""}
                      onChange={(e) => setBookingCustomFields(p => ({...p, [field.label]: e.target.value}))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                      rows={3}
                    />
                  ) : field.type === "select" ? (
                    <select
                      required={field.required}
                      value={bookingCustomFields[field.label] || ""}
                      onChange={(e) => setBookingCustomFields(p => ({...p, [field.label]: e.target.value}))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Selecione...</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "phone" ? "tel" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
                      required={field.required}
                      value={bookingCustomFields[field.label] || ""}
                      onChange={(e) => setBookingCustomFields(p => ({...p, [field.label]: e.target.value}))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  )}
                </div>
              ))}
              
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Observações (Opcional)</label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Alguma observação?"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submittingBooking || bookingSuccess}
                  className="w-full bg-[#111827] hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {submittingBooking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : bookingSuccess ? (
                    <><Check className="w-4 h-4 text-[#00C853]" /> Agendamento Concluído!</>
                  ) : (
                    <><Clock className="w-4 h-4" /> Confirmar Agendamento</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
