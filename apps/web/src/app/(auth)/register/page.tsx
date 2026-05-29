"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
import { QrCode, Eye, EyeOff, Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) router.push("/dashboard");
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("validation.password_mismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("validation.password_min"));
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("auth.register_error"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#31A24C]/10 rounded-full flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-[#31A24C]" />
                </div>
              </div>
              <CardTitle>{t("auth.register_success_title")}</CardTitle>
              <CardDescription>
                {t("auth.register_success_desc", { email })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button variant="default" className="w-full">
                  {t("auth.register_success_btn")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#050505]">MeuQR</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("auth.register_title")}</CardTitle>
            <CardDescription>
              {t("auth.register_subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">{t("auth.name_label")}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("auth.name_placeholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email_label")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password_label")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.password_min")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirm_password_label")}</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.confirm_password_placeholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPass"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="showPass" className="text-xs text-gray-500 font-normal cursor-pointer">
                  {t("auth.show_password")}
                </Label>
              </div>

              <Button type="submit" variant="default" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t("auth.register_btn")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {t("auth.has_account")}{" "}
              <Link href="/login" className="text-[#31A24C] font-medium hover:underline">
                {t("auth.login_link")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
