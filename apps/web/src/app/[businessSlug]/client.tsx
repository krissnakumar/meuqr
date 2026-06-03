"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Facebook, Instagram, MapPin, MessageCircle, ChevronRight, Sparkles } from "lucide-react";
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

interface PublicPageNavItem {
  id: string;
  title: string;
  slug: string;
  show_in_navigation?: boolean | null;
  navigation_label?: string | null;
}

export function PublicBusinessPageClient({
  business,
  page,
  pages = [],
  sections,
}: {
  business: BusinessData;
  page: { id: string; title: string; slug: string };
  pages?: PublicPageNavItem[];
  sections: PageSection[];
  nearbyBusinesses?: any[];
}) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const threshold = 112;
    let ticking = false;

    const updateCompactState = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        setIsCompact(window.scrollY > threshold);
        ticking = false;
      });
    };

    updateCompactState();
    window.addEventListener("scroll", updateCompactState, { passive: true });

    return () => window.removeEventListener("scroll", updateCompactState);
  }, []);

  const visiblePages = useMemo(
    () => pages.filter((p) => p.show_in_navigation !== false || p.slug === page.slug),
    [pages, page.slug]
  );

  const getPageHref = (slug: string) =>
    slug === "home" ? `/b/${business.slug}` : `/b/${business.slug}/${slug}`;

  const activePageId = page.id;
  const activeSections = sections.filter((s) => s.page_id === activePageId);

  const addressLabel = useMemo(() => {
    const parts = [business.address, business.city, business.state].filter(Boolean);
    return parts.join(" • ");
  }, [business.address, business.city, business.state]);

  const whatsappLink = useMemo(() => {
    if (!business.whatsapp) return null;
    const clean = business.whatsapp.replace(/\D/g, "");
    return clean ? `https://wa.me/${clean}` : null;
  }, [business.whatsapp]);

  const instagramLink = useMemo(() => {
    if (!business.instagram) return null;
    const handle = business.instagram.replace(/^@/, "").trim();
    if (!handle) return null;
    return handle.startsWith("http") ? handle : `https://instagram.com/${handle}`;
  }, [business.instagram]);

  const facebookLink = useMemo(() => {
    if (!business.facebook) return null;
    const value = business.facebook.trim();
    if (!value) return null;
    return value.startsWith("http") ? value : `https://facebook.com/${value.replace(/^\//, "")}`;
  }, [business.facebook]);

  const mapsLink = useMemo(() => {
    if (!addressLabel) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLabel)}`;
  }, [addressLabel]);

  const handleFloatingWhatsAppClick = () => {
    if (!whatsappLink) return;
    const text = encodeURIComponent(
      `Olá! Estou na página de *${business.name}* e gostaria de iniciar uma conversa.`
    );
    window.open(`${whatsappLink}?text=${text}`, "_blank");
  };

  const profileActionClass =
    "inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3.5 py-2 text-[11px] font-semibold text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:text-indigo-600";

  const compactIconButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/75 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600";

  const bannerStyle: CSSProperties = {
    backgroundImage: business.cover_url
      ? `url(${business.cover_url})`
      : "linear-gradient(135deg, #0F172A 0%, #1D4ED8 45%, #6366F1 100%)",
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.08),_transparent_34%),linear-gradient(180deg,_#F8FAFC_0%,_#EEF2FF_100%)] max-w-md mx-auto relative shadow-[0_12px_40px_rgba(15,23,42,0.12)] border-x border-white/70 flex flex-col justify-between">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/45 backdrop-blur-2xl">
        <div className={`px-4 sm:px-5 transition-all duration-300 ${isCompact ? "pt-2 pb-2 space-y-2" : "pt-4 pb-3 space-y-3"}`}>
          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl ring-1 ring-white/50 transition-all duration-300">
            <div className={`relative w-full overflow-hidden transition-all duration-300 ${isCompact ? "h-16" : "h-44 sm:h-52"}`}>
              {business.cover_url ? (
                <img src={business.cover_url} alt={`${business.name} cover`} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-cover bg-center" style={bannerStyle} />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent" />

              {!isCompact && (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Premium public profile</span>
                </div>
              )}

              {mapsLink && !isCompact && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md transition-transform hover:-translate-y-0.5"
                  title={addressLabel}
                >
                  <MapPin className="h-3.5 w-3.5 text-rose-300" />
                  <span className="max-w-[170px] truncate">{addressLabel}</span>
                </a>
              )}
            </div>

            <div className={`relative px-4 sm:px-5 transition-all duration-300 ${isCompact ? "pb-3" : "pb-4 sm:pb-5"}`}>
              <div className={`flex min-w-0 items-end gap-3 transition-all duration-300 ${isCompact ? "-mt-8" : "-mt-10"}`}>
                <div className={`shrink-0 overflow-hidden rounded-[26px] border-[5px] border-white bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] ring-1 ring-slate-100 transition-all duration-300 ${isCompact ? "h-14 w-14" : "h-20 w-20"}`}>
                  {business.logo_url ? (
                    <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 text-2xl font-black text-white">
                      {business.name?.[0]?.toUpperCase() || "M"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 pb-1">
                  <h1 className={`truncate font-black leading-tight tracking-tight text-[#0F172A] transition-all duration-300 ${isCompact ? "text-[18px]" : "text-[22px] sm:text-[24px]"}`}>
                    {business.name}
                  </h1>
                  {!isCompact && business.category && (
                    <div className="mt-1 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                      {business.category.replace(/_/g, " ")}
                    </div>
                  )}
                  {isCompact && mapsLink && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 hover:text-indigo-600"
                      title={addressLabel}
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                      <span className="truncate">{addressLabel}</span>
                    </a>
                  )}
                </div>
              </div>

              {!isCompact && business.description && (
                <p className="mt-3 max-w-[28rem] text-sm leading-relaxed text-slate-600">
                  {business.description}
                </p>
              )}

              <div className={`mt-4 flex flex-wrap items-center gap-2 transition-all duration-300 ${isCompact ? "mt-2" : "mt-4"}`}>
                {whatsappLink && (
                  isCompact ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={compactIconButtonClass}
                      aria-label="Open WhatsApp"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                    </a>
                  ) : (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${profileActionClass} border-emerald-100 text-emerald-700 hover:border-emerald-200`}
                      aria-label="Open WhatsApp"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </a>
                  )
                )}

                {instagramLink && (
                  isCompact ? (
                    <a
                      href={instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={compactIconButtonClass}
                      aria-label="Open Instagram"
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </a>
                  ) : (
                    <a
                      href={instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${profileActionClass} border-pink-100 text-pink-600 hover:border-pink-200`}
                      aria-label="Open Instagram"
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </a>
                  )
                )}

                {facebookLink && (
                  isCompact ? (
                    <a
                      href={facebookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={compactIconButtonClass}
                      aria-label="Open Facebook"
                      title="Facebook"
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                    </a>
                  ) : (
                    <a
                      href={facebookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${profileActionClass} border-blue-100 text-blue-600 hover:border-blue-200`}
                      aria-label="Open Facebook"
                      title="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                      <span>Facebook</span>
                    </a>
                  )
                )}

                {mapsLink && isCompact && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${compactIconButtonClass} min-w-0 w-auto gap-1.5 px-3`}
                    aria-label="Open maps"
                    title={addressLabel}
                  >
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span className="max-w-[160px] truncate text-[11px] font-semibold text-slate-600">{addressLabel}</span>
                  </a>
                )}
              </div>
            </div>
          </section>

          {visiblePages.length > 1 && (
            <nav className={`overflow-hidden rounded-[24px] border border-white/70 bg-white/75 p-2 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 ${isCompact ? "py-1.5" : ""}`}>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {visiblePages.map((navPage) => {
                  const isActive = navPage.slug === page.slug;
                  const label = navPage.navigation_label || navPage.title;

                  return (
                    <Link
                      key={navPage.id}
                      href={getPageHref(navPage.slug)}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)]"
                          : "border border-slate-200 bg-white/80 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                      }`}
                    >
                      <span>{label}</span>
                      {isActive && <ChevronRight className="h-3 w-3" />}
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="p-4 sm:p-5 flex-1">
        <PublicPageRenderer business={business} sections={activeSections} />
      </main>

      {whatsappLink && (
        <button
          onClick={handleFloatingWhatsAppClick}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full border border-emerald-400 bg-emerald-500 p-4 text-white shadow-[0_20px_45px_rgba(16,185,129,0.35)] transition-all duration-200 hover:scale-105 hover:bg-emerald-600 active:scale-95"
          title="Falar no WhatsApp"
        >
          <MessageCircle className="h-6 w-6 fill-white text-white" />
        </button>
      )}

      <footer className="border-t border-white/60 bg-white/45 py-5 text-center text-[10px] font-medium text-slate-500 backdrop-blur-xl">
        Desenvolvido com ❤️ por <span className="font-bold text-slate-700">MeuQR</span>
      </footer>
    </div>
  );
}
