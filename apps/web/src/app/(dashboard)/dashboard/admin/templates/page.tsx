"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Plus,
  Languages,
  Check,
  Building,
  Menu,
} from "lucide-react";
import {
  getAllBusinessTemplates,
  getTemplateItemCount,
  getTemplateSectionCount,
  resolveText,
} from "@meuqr/shared";

export default function AdminTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTemplates, setActiveTemplates] = useState<Record<string, boolean>>({});

  const templates = getAllBusinessTemplates();

  // Categories present in templates
  // Categories present in templates
  const categories = [
    { value: "all", label: "Todas Categorias" },
    ...Array.from(new Set(templates.map(t => t.businessType))).sort().map(cat => ({
      value: cat,
      label: cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    })),
  ];

  // Match search and category filters
  const filteredTemplates = templates.filter((tmpl) => {
    const ptName = resolveText(tmpl.name, "pt-BR").toLowerCase();
    const ptDesc = resolveText(tmpl.description, "pt-BR").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      ptName.includes(query) ||
      ptDesc.includes(query) ||
      tmpl.id.includes(query);

    const matchesCategory =
      selectedCategory === "all" || tmpl.businessType === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  function handleCopyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleTemplateStatus(id: string) {
    setActiveTemplates((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="text-indigo-600 w-7 h-7" />
            Modelos de Negócio (Admin)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerenciamento global, auditoria de traduções e controle de ativação dos {templates.length} templates.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Criar Novo Modelo
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total de Modelos</p>
            <p className="text-2xl font-bold text-gray-800">{templates.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Traduzidos (EN/ES)</p>
            <p className="text-2xl font-bold text-gray-800">100%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Categorias</p>
            <p className="text-2xl font-bold text-gray-800">{categories.length - 1}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Menu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total de Seções</p>
            <p className="text-2xl font-bold text-gray-800">
              {templates.reduce((sum, t) => sum + getTemplateSectionCount(t), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar modelo por nome, descrição ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 py-2 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <th className="py-4 px-6">ID & Nome</th>
                <th className="py-4 px-6">Categoria</th>
                <th className="py-4 px-6 text-center">Seções / Itens</th>
                <th className="py-4 px-6">Localização (PT/EN/ES)</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Nenhum modelo encontrado correspondendo aos filtros.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tmpl) => {
                  const isActive = activeTemplates[tmpl.id] !== false;
                  
                  return (
                    <tr key={tmpl.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {resolveText(tmpl.name, "pt-BR")}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {resolveText(tmpl.description, "pt-BR")}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[10px] bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded">
                                {tmpl.id}
                              </span>
                              <button
                                onClick={() => handleCopyId(tmpl.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copiar ID do Modelo"
                              >
                                {copiedId === tmpl.id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
                          {tmpl.businessType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="font-semibold text-gray-800">
                          {getTemplateSectionCount(tmpl)} seções
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {getTemplateItemCount(tmpl)} itens
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded" title="Português">PT</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded" title="English">EN</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded" title="Español">ES</span>
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleTemplateStatus(tmpl.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Inativo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Ver detalhes do template">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Clonar template">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
