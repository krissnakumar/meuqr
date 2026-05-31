"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, Button, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-provider";
import { Loader2, Plus, GripVertical, Settings2, Trash2, AlignLeft, CheckSquare, Calendar, Link as LinkIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type FieldType = "text" | "email" | "phone" | "date" | "select" | "textarea";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for select
}

export default function FormsBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"appointments" | "leads" | "quotes">("appointments");
  
  const [formSchemas, setFormSchemas] = useState<Record<string, FormField[]>>({
    appointments: [],
    leads: [],
    quotes: []
  });

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, category, notification_settings")
        .eq("id", businessId)
        .single();

      if (error) throw error;

      setBusiness(data);
      
      const settings = data.notification_settings || {};
      if (settings.form_schemas) {
        setFormSchemas({
          appointments: settings.form_schemas.appointments || [],
          leads: settings.form_schemas.leads || [],
          quotes: settings.form_schemas.quotes || []
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: type === 'text' ? 'New Text Field' : type === 'email' ? 'Email Address' : type === 'date' ? 'Select Date' : 'New Field',
      type,
      required: false,
      ...(type === 'select' ? { options: ['Option 1', 'Option 2'] } : {})
    };

    setFormSchemas(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newField]
    }));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormSchemas(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const removeField = (id: string) => {
    setFormSchemas(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(f => f.id !== id)
    }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const settings = business.notification_settings || {};
      const updatedSettings = {
        ...settings,
        form_schemas: formSchemas
      };

      const { error } = await supabase
        .from("businesses")
        .update({ notification_settings: updatedSettings })
        .eq("id", businessId);

      if (error) throw error;
      toast.success(t("success.saved"));
    } catch (err: any) {
      toast.error(t("errors.generic") + " " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const renderFieldIcon = (type: FieldType) => {
    switch(type) {
      case "text": return <AlignLeft className="w-4 h-4 text-slate-500" />;
      case "textarea": return <AlignLeft className="w-4 h-4 text-slate-500" />;
      case "email": return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case "phone": return <LinkIcon className="w-4 h-4 text-green-500" />;
      case "date": return <Calendar className="w-4 h-4 text-orange-500" />;
      case "select": return <CheckSquare className="w-4 h-4 text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const currentFields = formSchemas[activeTab] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Dynamic Form Builder
          </h1>
          <p className="text-sm text-gray-500">Customize the information you collect from clients.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "appointments" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Appointments Form
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "leads" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Leads Form
        </button>
        <button
          onClick={() => setActiveTab("quotes")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "quotes" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Quotes Form
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Field Types Sidebar */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          <GlassCard>
            <GlassCardHeader className="pb-3">
              <GlassCardTitle className="text-sm">Add Fields</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-slate-200" onClick={() => addField("text")}>
                <AlignLeft className="w-4 h-4 mr-2 text-slate-500" /> Short Text
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200" onClick={() => addField("textarea")}>
                <AlignLeft className="w-4 h-4 mr-2 text-slate-500" /> Long Text
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200" onClick={() => addField("phone")}>
                <LinkIcon className="w-4 h-4 mr-2 text-green-500" /> Phone Number
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200" onClick={() => addField("date")}>
                <Calendar className="w-4 h-4 mr-2 text-orange-500" /> Date
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200" onClick={() => addField("select")}>
                <CheckSquare className="w-4 h-4 mr-2 text-purple-500" /> Dropdown
              </Button>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Builder Canvas */}
        <div className="col-span-12 md:col-span-8 space-y-4">
          {currentFields.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-white/50">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No custom fields added yet.</p>
              <p className="text-xs text-slate-400 mt-1">Select a field from the left to start building your form.</p>
            </div>
          ) : (
            currentFields.map((field, index) => (
              <GlassCard key={field.id} className="group transition-all hover:border-indigo-200 hover:shadow-md">
                <GlassCardContent className="p-4 flex items-start gap-4">
                  <div className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderFieldIcon(field.type)}
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-500">
                          {field.type}
                        </Badge>
                      </div>
                      <button onClick={() => removeField(field.id)} className="text-slate-400 hover:text-rose-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Field Label</label>
                      <input 
                        type="text" 
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {field.type === 'select' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Options (comma separated)</label>
                        <input 
                          type="text" 
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`req-${field.id}`} 
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <label htmlFor={`req-${field.id}`} className="text-xs font-medium text-slate-600 cursor-pointer">
                        Required field
                      </label>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
