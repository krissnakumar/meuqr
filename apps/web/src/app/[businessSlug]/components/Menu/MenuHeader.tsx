import { MapPin, QrCode } from "lucide-react";
import { Badge } from "@meuqr/ui";

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
}

export function MenuHeader({ business }: { business: BusinessData }) {
  return (
    <>
      {/* Cover Image & Banner */}
      <div className="h-56 relative w-full overflow-hidden bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500">
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

          {(business.city || business.address) && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-gray-400 bg-white shadow-sm border border-gray-100 rounded-full px-3 py-1.5 w-max">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>{business.city || business.address}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
