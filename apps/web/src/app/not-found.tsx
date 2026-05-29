"use client";

import Link from "next/link";
import { QrCode, ArrowLeft, Home } from "lucide-react";
import { useTranslation } from "@/lib/i18n-provider";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
          <QrCode className="w-10 h-10 text-gray-300" />
        </div>

        {/* Error code */}
        <h1 className="text-7xl font-bold text-[#111827] mb-2">404</h1>

        {/* Message */}
        <h2 className="text-xl font-semibold text-[#111827] mb-2">
          {t("common.404_title")}
        </h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          {t("common.404_description")}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#111827] text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-[#1f2937] transition-colors"
          >
            <Home className="w-4 h-4" />
            {t("common.404_back")}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white text-[#111827] px-6 py-3 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </button>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Help text */}
        <p className="text-xs text-gray-400">
          {t("common.support")}{" "}
          <a
            href="mailto:suporte@meuqr.com.br"
            className="text-[#111827] font-medium hover:underline"
          >
            suporte@meuqr.com.br
          </a>
        </p>
      </div>
    </div>
  );
}
