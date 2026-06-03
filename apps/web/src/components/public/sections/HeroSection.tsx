"use client";

import { MapPin, Instagram, Globe, Phone } from "lucide-react";

interface HeroSectionProps {
  business: {
    name: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    city: string | null;
    state: string | null;
    instagram: string | null;
    website: string | null;
    whatsapp: string | null;
    brand_color?: string;
  };
  /** Optional: specific page hero item from the DB (name, description, metadata) */
  heroItem?: {
    name?: string;
    description?: string | null;
    metadata?: {
      button_label?: string;
      button_action?: string;
      button_url?: string;
    };
  } | null;
}

export function HeroSection({ business, heroItem }: HeroSectionProps) {
  const brandColor = business.brand_color || "#4F46E5";
  const displayName = heroItem?.name || business.name;
  const displayDesc = heroItem?.description ?? business.description;

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 pb-6">
      {/* Cover Photo */}
      <div 
        className="h-36 sm:h-48 w-full bg-gradient-to-r relative"
        style={{ 
          backgroundImage: business.cover_url 
            ? `url(${business.cover_url})` 
            : `linear-gradient(to right, ${brandColor}, #6366F1)` 
        }}
      >
        {business.cover_url && <div className="absolute inset-0 bg-black/10" />}
      </div>

      {/* Logo Container */}
      <div className="px-6 relative -mt-10 sm:-mt-12 flex flex-col items-center text-center">
        <div 
          className="w-20 h-20 sm:w-24 h-24 rounded-2xl bg-white p-1 border-2 shadow-md flex items-center justify-center overflow-hidden"
          style={{ borderColor: brandColor }}
        >
          {business.logo_url ? (
            <img 
              src={business.logo_url} 
              alt={business.name} 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div 
              className="w-full h-full rounded-xl flex items-center justify-center font-bold text-white text-2xl"
              style={{ backgroundColor: brandColor }}
            >
              {business.name[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Business Title & Details */}
        <h1 className="mt-4 text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          {displayName}
        </h1>

        {business.city && (
          <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-[#64748B]">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>{business.city}, {business.state || "BR"}</span>
          </div>
        )}

        {displayDesc && (
          <p className="mt-3 text-sm text-[#475569] max-w-md leading-relaxed">
            {displayDesc}
          </p>
        )}

        {/* Social Badges */}
        <div className="flex gap-2.5 mt-4">
          {business.instagram && (
            <a 
              href={`https://instagram.com/${business.instagram.replace("@", "")}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors text-pink-600"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {business.website && (
            <a 
              href={business.website.startsWith("http") ? business.website : `https://${business.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors text-indigo-600"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {business.whatsapp && (
            <a 
              href={`https://wa.me/${business.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors text-emerald-600"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
