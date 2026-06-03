"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { PublicPageRenderer } from "@/components/public/PublicPageRenderer";

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
  facebook: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
  category?: string | null;
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
  page_id?: string;
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
}: {
  business: BusinessData;
  page: { id: string; title: string; slug: string };
  pages?: { id: string; title: string; slug: string }[];
  sections: PageSection[];
  nearbyBusinesses?: any[];
}) {
  const [activePageId] = useState(page.id);
  const activeSections = sections.filter((s) => s.page_id === activePageId);

  const handleFloatingWhatsAppClick = () => {
    if (!business.whatsapp) return;
    const text = encodeURIComponent(
      `Olá! Estou na página de *${business.name}* e gostaria de iniciar uma conversa.`
    );
    window.open(`https://wa.me/${business.whatsapp}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-md mx-auto relative shadow-md border-x border-slate-100 flex flex-col justify-between">
      {/* Dynamic Template Block Renderer */}
      <main className="p-4 sm:p-5 flex-1">
        <PublicPageRenderer 
          business={business} 
          sections={activeSections} 
        />
      </main>

      {/* Floating WhatsApp Action Button */}
      {business.whatsapp && (
        <button
          onClick={handleFloatingWhatsAppClick}
          className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border border-emerald-400"
          title="Falar no WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-white text-white" />
        </button>
      )}

      {/* Footer Branding */}
      <footer className="py-6 text-center border-t border-slate-100 bg-white text-[10px] text-[#94A3B8] font-medium">
        Desenvolvido com ❤️ por <span className="font-bold text-[#64748B]">MeuQR</span>
      </footer>
    </div>
  );
}
