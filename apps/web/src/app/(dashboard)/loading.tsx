"use client";

import { useTranslation } from "@/lib/i18n-provider";

export default function DashboardLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    </div>
  );
}
