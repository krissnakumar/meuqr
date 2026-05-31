import { BusinessTemplate } from "@meuqr/shared";
import { Badge, GlassCard } from "@meuqr/ui";
import { Check, Layers, Tag, Phone } from "lucide-react";

interface TemplateCardProps {
  template: BusinessTemplate;
  isSelected: boolean;
  onSelect: (template: BusinessTemplate) => void;
  recommended?: boolean;
}

export function TemplateCard({ template, isSelected, onSelect, recommended }: TemplateCardProps) {
  const sectionsCount = template.sections.length;
  const itemsCount = template.sections.reduce((acc, sec) => acc + sec.items.length, 0);

  return (
    <GlassCard 
      className={`relative cursor-pointer transition-all hover:border-indigo-300 hover:shadow-lg ${
        isSelected ? "ring-2 ring-indigo-500 border-indigo-500 shadow-md" : ""
      }`}
      onClick={() => onSelect(template)}
    >
      {recommended && (
        <div className="absolute -top-3 -right-3">
          <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-bold border-none shadow-sm shadow-emerald-200">
            Recomendado
          </Badge>
        </div>
      )}
      
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
          <Check className="w-4 h-4" />
        </div>
      )}

      <div className="p-4">
        {/* Placeholder for Preview Image */}
        <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-4 flex items-center justify-center border border-slate-200/50">
          <span className="text-xs text-slate-400 font-medium tracking-widest uppercase">Preview Visual</span>
        </div>

        <h3 className="text-sm font-bold text-slate-800 mb-1">{template.name as string}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{template.description as string}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-white border-slate-200 text-slate-600 flex items-center gap-1">
            <Layers className="w-3 h-3" /> {sectionsCount} seções
          </Badge>
          <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-white border-slate-200 text-slate-600 flex items-center gap-1">
            <Tag className="w-3 h-3" /> {itemsCount} itens
          </Badge>
          {template.formType === "quote" && (
            <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-amber-50 border-amber-200 text-amber-700 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Orçamento
            </Badge>
          )}
          {template.formType === "order" && (
            <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-emerald-50 border-emerald-200 text-emerald-700 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Pedido via Zap
            </Badge>
          )}
          {template.formType === "booking" && (
            <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-indigo-50 border-indigo-200 text-indigo-700 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Agendamento
            </Badge>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
