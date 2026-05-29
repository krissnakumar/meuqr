"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
import { QrCode, Eye, EyeOff, Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Senhas não conferem");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }  if (success) {
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
              <CardTitle>Conta criada!</CardTitle>
              <CardDescription>
                Enviamos um email de confirmação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e confirme seu email para acessar o painel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button variant="default" className="w-full">
                  Ir para o Login
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
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>
              Comece grátis em menos de 1 minuto
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
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a senha"
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
                  Mostrar senhas
                </Label>
              </div>

              <Button type="submit" variant="default" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Criar Conta Grátis"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Já tem conta?{" "}
              <Link href="/login" className="text-[#31A24C] font-medium hover:underline">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
