"use client";

import { useState } from "react";
import { VERTICALS_CONFIG } from "@meuqr/shared";
import { Button } from "@meuqr/ui";
import { HelpCircle } from "lucide-react";

interface BusinessSetupFormProps {
  verticalSlug: string;
  bizName: string;
  setBizName: (val: string) => void;
  bizWhatsapp: string;
  onWhatsappChange: (val: string) => void;
  answers: Record<string, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export function BusinessSetupForm({
  verticalSlug,
  bizName,
  setBizName,
  bizWhatsapp,
  onWhatsappChange,
  answers,
  setAnswers,
  onSubmit,
  onBack,
  submitting,
}: BusinessSetupFormProps) {
  const config = VERTICALS_CONFIG[verticalSlug];
  const questions = config?.onboardingQuestions || [];

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isFormValid = () => {
    if (!bizName.trim()) return false;
    if (bizWhatsapp.replace(/\D/g, "").length < 10) return false;

    // Check if required questions are answered
    for (const q of questions) {
      if (q.required && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === "")) {
        return false;
      }
    }
    return true;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isFormValid()) onSubmit();
      }}
      className="space-y-5"
    >
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Nome do Negócio
        </label>
        <input
          type="text"
          value={bizName}
          onChange={(e) => setBizName(e.target.value)}
          placeholder="Ex: Padaria Santa Inês"
          required
          className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Número do WhatsApp comercial
        </label>
        <input
          type="text"
          value={bizWhatsapp}
          onChange={(e) => onWhatsappChange(e.target.value)}
          placeholder="Ex: (11) 99999-9999"
          required
          className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
        />
      </div>

      {questions.length > 0 && (
        <div className="pt-3 border-t border-[#F1F5F9] space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Perguntas Rápidas</span>
          </div>

          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="block text-sm font-medium text-[#0F172A]">
                {q.question} {q.required && <span className="text-red-500">*</span>}
              </label>

              {q.type === "boolean" && (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleAnswerChange(q.id, true)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      answers[q.id] === true
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 font-semibold"
                        : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerChange(q.id, false)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      answers[q.id] === false
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 font-semibold"
                        : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50"
                    }`}
                  >
                    Não
                  </button>
                </div>
              )}

              {q.type === "select" && (
                <select
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  required={q.required}
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                >
                  <option value="" disabled>
                    {q.placeholder || "Selecione uma opção"}
                  </option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {q.type === "text" && (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  required={q.required}
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-slate-50 transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={!isFormValid() || submitting}
          className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? "Criando Workspace..." : "Criar Meu Workspace"}
        </button>
      </div>
    </form>
  );
}
