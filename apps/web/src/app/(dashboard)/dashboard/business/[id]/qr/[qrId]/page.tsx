"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  Download,
  Palette,
  Image as ImageIcon,
  QrCode as QrCodeIcon,
  Printer,
  Sparkles,
  Check,
} from "lucide-react";

// We'll load qr-code-styling dynamically
let QRCodeStyling: any = null;

export default function QRDesignerPage() {
  const params = useParams();
  const qrId = params.qrId as string;
  const businessId = params.id as string;

  const qrRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<any>(null);
  const [qrStyle, setQrStyle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrInstance, setQrInstance] = useState<any>(null);
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"base" | "gradient" | "logo" | "cta">("base");
  const [saving, setSaving] = useState(false);

  // Style state
  const [dotStyle, setDotStyle] = useState("rounded");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [foregroundColor, setForegroundColor] = useState("#111827");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [margin, setMargin] = useState(10);
  const [errorLevel, setErrorLevel] = useState("M");

  // Advanced states (gradients, logos, CTA)
  const [useGradient, setUseGradient] = useState(false);
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColor, setGradientColor] = useState("#4f46e5");
  const [logoOption, setLogoOption] = useState<"none" | "business" | "custom">("none");
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [businessLogoUrl, setBusinessLogoUrl] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaBgColor, setCtaBgColor] = useState("#111827");
  const [ctaTextColor, setCtaTextColor] = useState("#FFFFFF");

  useEffect(() => {
    loadQRData();
    loadQRCodeStyling();
  }, [qrId]);

  async function loadQRCodeStyling() {
    try {
      const module = await import("qr-code-styling");
      QRCodeStyling = module.default;
    } catch (err) {
      console.error("Failed to load qr-code-styling", err);
    }
  }

  async function loadQRData() {
    try {
      const { data: qr } = await supabase
        .from("qr_codes")
        .select("*, pages(title, slug), businesses!inner(name, slug, logo_url)")
        .eq("id", qrId)
        .single();

      const { data: style } = await supabase
        .from("qr_styles")
        .select("*")
        .eq("qr_code_id", qrId)
        .single();

      setQrCode(qr);
      setQrStyle(style);

      if (qr) {
        setUrl(`${window.location.origin}/q/${qr.short_code}`);
        if (qr.businesses?.logo_url) {
          setBusinessLogoUrl(qr.businesses.logo_url);
        }

        if (style) {
          setDotStyle(style.dot_style);
          setCornerStyle(style.corner_style);
          setForegroundColor(style.foreground_color);
          setBackgroundColor(style.background_color);
          setMargin(style.margin);
          setErrorLevel(style.error_correction_level);

          // Advanced settings loading
          setUseGradient(style.gradient || false);
          setGradientColor(style.gradient_color || "#4f46e5");
          setGradientType((style.gradient_type as any) || "linear");
          setGradientAngle(style.gradient_angle || 45);

          // Resolve logo settings
          if (style.logo_url) {
            if (qr.businesses?.logo_url && style.logo_url === qr.businesses.logo_url) {
              setLogoOption("business");
            } else {
              setLogoOption("custom");
              setCustomLogoUrl(style.logo_url);
            }
          } else {
            setLogoOption("none");
          }

          setCtaText(style.cta_text || "");
          setCtaBgColor(style.cta_background_color || "#111827");
          setCtaTextColor(style.cta_text_color || "#FFFFFF");
        }
      }
    } catch (err) {
      console.error("Failed to load QR configurations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (QRCodeStyling && url && qrRef.current) {
      generateQR();
    }
  }, [
    QRCodeStyling,
    url,
    dotStyle,
    cornerStyle,
    foregroundColor,
    backgroundColor,
    margin,
    errorLevel,
    useGradient,
    gradientType,
    gradientAngle,
    gradientColor,
    logoOption,
    customLogoUrl,
    businessLogoUrl,
  ]);

  function generateQR() {
    if (!QRCodeStyling || !qrRef.current) return;

    qrRef.current.innerHTML = "";

    try {
      const logoUrl = logoOption === "business" ? businessLogoUrl : logoOption === "custom" ? customLogoUrl : "";

      const dotsOptions: any = {
        type: dotStyle as any,
      };

      if (useGradient && gradientColor) {
        dotsOptions.gradient = {
          type: gradientType,
          rotation: gradientType === "linear" ? (gradientAngle * Math.PI) / 180 : 0,
          colorStops: [
            { offset: 0, color: foregroundColor },
            { offset: 1, color: gradientColor },
          ],
        };
      } else {
        dotsOptions.color = foregroundColor;
      }

      const cornersOptions: any = {
        type: cornerStyle as any,
        color: foregroundColor,
      };

      const qrOptions: any = {
        errorCorrectionLevel: errorLevel as any,
      };

      const options: any = {
        width: 300,
        height: 300,
        data: url,
        dotsOptions,
        cornersOptions,
        backgroundOptions: {
          color: backgroundColor,
        },
        margin: margin,
        qrOptions,
      };

      if (logoUrl) {
        options.image = logoUrl;
        options.imageOptions = {
          hideBackgroundDots: true,
          imageSize: 0.35,
          margin: 6,
        };
      }

      const qr = new QRCodeStyling(options);
      qr.append(qrRef.current);
      setQrInstance(qr);
    } catch (err) {
      console.error("QR generation error:", err);
    }
  }

  async function downloadPNG() {
    if (!qrInstance) return;
    try {
      const blob = await qrInstance.getRawData("png");
      const link = document.createElement("a");
      link.download = `meuqr-${qrCode?.short_code || "qrcode"}.png`;
      link.href = URL.createObjectURL(blob as Blob);
      link.click();
    } catch (err) {
      console.error("Failed to download PNG:", err);
    }
  }

  async function downloadSVG() {
    if (!qrInstance) return;
    try {
      const blob = await qrInstance.getRawData("svg");
      const link = document.createElement("a");
      link.download = `meuqr-${qrCode?.short_code || "qrcode"}.svg`;
      link.href = URL.createObjectURL(blob as Blob);
      link.click();
    } catch (err) {
      console.error("Failed to download SVG:", err);
    }
  }

  function printQR() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const qrHtml = qrRef.current?.innerHTML || "";
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR Code - MeuQR</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #ffffff;
            }
            .cta-frame {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 40px;
              border-radius: 24px;
              background-color: ${ctaText ? ctaBgColor : '#ffffff'};
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
              text-align: center;
            }
            .qr-container {
              padding: 24px;
              border-radius: 16px;
              background-color: ${backgroundColor};
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-container svg, .qr-container img {
              width: 350px;
              height: 350px;
            }
            .cta-text {
              margin-top: 24px;
              font-size: 24px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: ${ctaTextColor};
              max-width: 400px;
            }
          </style>
        </head>
        <body>
          <div class="cta-frame">
            <div class="qr-container">
              ${qrHtml}
            </div>
            ${ctaText ? `<div class="cta-text">${ctaText}</div>` : ""}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  async function saveStyle() {
    setSaving(true);
    try {
      const logoUrl = logoOption === "business" ? businessLogoUrl : logoOption === "custom" ? customLogoUrl : null;

      const payload = {
        dot_style: dotStyle,
        corner_style: cornerStyle,
        foreground_color: foregroundColor,
        background_color: backgroundColor,
        margin,
        error_correction_level: errorLevel,
        gradient: useGradient,
        gradient_color: gradientColor,
        gradient_type: gradientType,
        gradient_angle: gradientAngle,
        logo_url: logoUrl,
        cta_text: ctaText || null,
        cta_background_color: ctaBgColor,
        cta_text_color: ctaTextColor,
      };

      if (qrStyle) {
        await supabase
          .from("qr_styles")
          .update(payload)
          .eq("id", qrStyle.id);
      } else {
        const { data } = await supabase
          .from("qr_styles")
          .insert({
            qr_code_id: qrId,
            ...payload,
          })
          .select()
          .single();
        if (data) setQrStyle(data);
      }
    } catch (err) {
      console.error("Failed to save QR styles:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o Painel
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Designer de QR Code
          </h1>
          <p className="text-gray-500 mt-1">
            Personalize o estilo, as cores e as logos do QR Code físico do seu negócio.
          </p>
        </div>
        <Button onClick={saveStyle} disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Salvar Estilo
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-gray-100 overflow-hidden shadow-sm">
            <CardContent className="p-8 flex items-center justify-center min-h-[420px] bg-gray-50/50">
              {/* Framed QR Preview */}
              <div
                className="flex flex-col items-center p-6 border rounded-2xl shadow-md transition-all duration-300 w-full max-w-[360px]"
                style={{
                  backgroundColor: ctaText ? ctaBgColor : "#FFFFFF",
                  borderColor: ctaText ? "transparent" : "#f3f4f6",
                }}
              >
                <div
                  className="p-4 rounded-xl flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: backgroundColor }}
                >
                  <div ref={qrRef} className="flex items-center justify-center w-[260px] h-[260px]" />
                </div>
                {ctaText && (
                  <div
                    className="mt-5 text-center font-extrabold tracking-widest uppercase px-4 text-sm"
                    style={{ color: ctaTextColor }}
                  >
                    {ctaText}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={downloadPNG} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">
              <Download className="w-4 h-4 mr-2" />
              PNG
            </Button>
            <Button variant="outline" onClick={downloadSVG} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
            <Button variant="outline" onClick={printQR} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
          <p className="text-center text-xs text-gray-400">
            * O download exporta o código QR isolado. Use "Imprimir" para exportar a arte completa com o frame.
          </p>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-7">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              {/* Tabs Switcher */}
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto gap-2">
                {[
                  { id: "base", label: "Estilo Base", icon: QrCodeIcon },
                  { id: "gradient", label: "Gradiente", icon: Palette },
                  { id: "logo", label: "Logo Central", icon: ImageIcon },
                  { id: "cta", label: "Moldura (CTA)", icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? "border-gray-900 text-gray-900 font-semibold"
                          : "border-transparent text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Base Styles */}
              {activeTab === "base" && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Estilo dos pontos</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                      {[
                        { id: "square", name: "Quadrado" },
                        { id: "rounded", name: "Arredondado" },
                        { id: "classy", name: "Clássico" },
                        { id: "dots", name: "Pontos" },
                        { id: "extra-rounded", name: "Super Curvo" },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setDotStyle(style.id)}
                          className={`p-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                            dotStyle === style.id
                              ? "border-gray-900 bg-gray-900/5 text-gray-900"
                              : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
                          }`}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Estilo dos cantos</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {[
                        { id: "square", name: "Quadrado" },
                        { id: "rounded", name: "Arredondado" },
                        { id: "extra-rounded", name: "Super Curvo" },
                        { id: "circle", name: "Círculo" },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setCornerStyle(style.id)}
                          className={`p-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                            cornerStyle === style.id
                              ? "border-gray-900 bg-gray-900/5 text-gray-900"
                              : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
                          }`}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm font-semibold text-gray-700">Margem interna</Label>
                      <span className="text-xs font-mono text-gray-500">{margin}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Nível de Correção de Erros</Label>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2">
                      Níveis altos (Q, H) permitem que o código continue legível mesmo se riscado ou coberto por logos maiores.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: "L", label: "L (Baixo - 7%)" },
                        { value: "M", label: "M (Médio - 15%)" },
                        { value: "Q", label: "Q (Alto - 25%)" },
                        { value: "H", label: "H (Máximo - 30%)" },
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setErrorLevel(level.value)}
                          className={`p-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                            errorLevel === level.value
                              ? "border-gray-900 bg-gray-900/5 text-gray-900"
                              : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Gradients */}
              {activeTab === "gradient" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-800">Ativar efeito gradiente</Label>
                      <p className="text-xs text-gray-500">Muda a cor dos pontos de forma gradual para um visual premium.</p>
                    </div>
                    <button
                      onClick={() => setUseGradient(!useGradient)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        useGradient ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useGradient ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {useGradient && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700">Tipo de Gradiente</Label>
                          <select
                            value={gradientType}
                            onChange={(e: any) => setGradientType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          >
                            <option value="linear">Linear (Reto)</option>
                            <option value="radial">Radial (Circular)</option>
                          </select>
                        </div>

                        {gradientType === "linear" && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="text-xs font-semibold text-gray-700">Rotação do Gradiente</Label>
                              <span className="text-xs font-mono text-gray-500">{gradientAngle}°</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={gradientAngle}
                              onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900 mt-2"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700 font-mono">Cor Inicial (Offset 0)</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={foregroundColor}
                              onChange={(e) => setForegroundColor(e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0 overflow-hidden"
                            />
                            <Input
                              value={foregroundColor}
                              onChange={(e) => setForegroundColor(e.target.value)}
                              className="font-mono text-sm uppercase bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700 font-mono">Cor Final (Offset 1)</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={gradientColor}
                              onChange={(e) => setGradientColor(e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0 overflow-hidden"
                            />
                            <Input
                              value={gradientColor}
                              onChange={(e) => setGradientColor(e.target.value)}
                              className="font-mono text-sm uppercase bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 border-t border-gray-100 pt-6">
                    <Label className="text-sm font-semibold text-gray-700">Cor de fundo do QR Code</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0 overflow-hidden"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="font-mono text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Logo Central */}
              {activeTab === "logo" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Escolha a Imagem Central</Label>
                    <select
                      value={logoOption}
                      onChange={(e: any) => setLogoOption(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="none">Sem Logotipo (Código Limpo)</option>
                      <option value="business">Logotipo do Estabelecimento</option>
                      <option value="custom">URL de Imagem Customizada</option>
                    </select>
                  </div>

                  {logoOption === "business" && (
                    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center gap-4">
                      {businessLogoUrl ? (
                        <>
                          <img
                            src={businessLogoUrl}
                            alt="Logo do estabelecimento"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Usando Logotipo do Negócio</p>
                            <p className="text-xs text-gray-400 mt-0.5">Imagem carregada automaticamente das configurações da sua empresa.</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200/55 p-3 rounded-lg w-full">
                          Aviso: Seu estabelecimento não possui logotipo cadastrado. Adicione um nas configurações da empresa ou selecione "URL de Imagem Customizada" abaixo.
                        </div>
                      )}
                    </div>
                  )}

                  {logoOption === "custom" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-700">URL da Imagem (PNG, JPG, SVG ou WEBP)</Label>
                        <Input
                          placeholder="https://sua-empresa.com/logo.png"
                          value={customLogoUrl}
                          onChange={(e) => setCustomLogoUrl(e.target.value)}
                        />
                      </div>
                      {customLogoUrl && (
                        <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex justify-center">
                          <img
                            src={customLogoUrl}
                            alt="Preview Custom Logo"
                            onError={(e) => {
                              (e.target as any).src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=150";
                            }}
                            className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white p-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Call to Action (CTA) */}
              {activeTab === "cta" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Texto de Chamada (Call to Action)</Label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Insira uma frase curta para engajar os clientes a escanearem o código (ex: "CARDÁPIO DIGITAL", "FAÇA SEU PEDIDO").
                    </p>
                    <Input
                      maxLength={30}
                      placeholder="Ex: ESCANEIE AQUI"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {ctaText && (
                    <div className="space-y-6 border-t border-gray-100 pt-6 animate-fadeIn">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700">Cor de Fundo da Moldura</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={ctaBgColor}
                              onChange={(e) => setCtaBgColor(e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0 overflow-hidden"
                            />
                            <Input
                              value={ctaBgColor}
                              onChange={(e) => setCtaBgColor(e.target.value)}
                              className="font-mono text-sm uppercase"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700">Cor do Texto da Chamada</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={ctaTextColor}
                              onChange={(e) => setCtaTextColor(e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0 overflow-hidden"
                            />
                            <Input
                              value={ctaTextColor}
                              onChange={(e) => setCtaTextColor(e.target.value)}
                              className="font-mono text-sm uppercase"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Presets Theme Options */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-700">Temas rápidos de Moldura</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {[
                            { name: "Escuro", bg: "#111827", text: "#FFFFFF" },
                            { name: "Verde WhatsApp", bg: "#25D366", text: "#FFFFFF" },
                            { name: "Vermelho Alerta", bg: "#DC2626", text: "#FFFFFF" },
                            { name: "Azul Marca", bg: "#1E40AF", text: "#FFFFFF" },
                            { name: "Amarelo Destaque", bg: "#FBBF24", text: "#111827" },
                          ].map((theme) => (
                            <button
                              key={theme.name}
                              onClick={() => {
                                setCtaBgColor(theme.bg);
                                setCtaTextColor(theme.text);
                              }}
                              className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium bg-white hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-1.5"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block border border-gray-100"
                                style={{ backgroundColor: theme.bg }}
                              />
                              {theme.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
