"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, LanguageSelector } from "@meuqr/ui";
import { QrCode, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth";
import { I18nProvider, useTranslation } from "@/lib/i18n-provider";
import type { Language } from "@meuqr/shared";
import { getSavedLanguage, saveLanguage } from "@meuqr/shared";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <I18nProvider>
        <LoginForm />
      </I18nProvider>
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, lang, setLang } = useTranslation();

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          router.push(searchParams.get("redirect") || "/dashboard");
        }
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || t("login_error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Language selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector
            currentLang={lang}
            onLanguageChange={setLang}
            variant="dropdown"
            size="sm"
          />
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#050505]">MeuQR</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("login_title")}</CardTitle>
            <CardDescription>{t("login_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("email_label")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password_label")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="default" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t("login_btn")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {t("no_account")}{" "}
              <Link href="/register" className="text-[#31A24C] font-medium hover:underline">
                {t("signup_link")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
