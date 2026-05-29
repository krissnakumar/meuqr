"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Badge } from "@meuqr/ui";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  Download,
  Share2,
  Palette,
  Image,
  QrCode as QrCodeIcon,
  Square,
  Circle,
  Diamond,
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

  // Style state
  const [dotStyle, setDotStyle] = useState("rounded");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [foregroundColor, setForegroundColor] = useState("#111827");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [margin, setMargin] = useState(10);
  const [errorLevel, setErrorLevel] = useState("M");

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
        .select("*, pages(title, slug), businesses!inner(name, slug)")
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
        setUrl(
          `${window.location.origin}/q/${qr.short_code}`
        );
        if (style) {
          setDotStyle(style.dot_style);
          setCornerStyle(style.corner_style);
          setForegroundColor(style.foreground_color);
          setBackgroundColor(style.background_color);
          setMargin(style.margin);
          setErrorLevel(style.error_correction_level);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (QRCodeStyling && url && qrRef.current) {
      generateQR();
    }
  }, [QRCodeStyling, url, dotStyle, cornerStyle, foregroundColor, backgroundColor, margin, errorLevel]);

  function generateQR() {
    if (!QRCodeStyling || !qrRef.current) return;

    qrRef.current.innerHTML = "";

    try {
      const qr = new QRCodeStyling({
        width: 300,
        height: 300,
        data: url,
        dotsOptions: {
          color: foregroundColor,
          type: dotStyle as any,
        },
        cornersOptions: {
          type: cornerStyle as any,
          color: foregroundColor,
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        margin: margin,
        qrOptions: {
          errorCorrectionLevel: errorLevel as any,
        },
      });

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
      console.error(err);
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
      console.error(err);
    }
  }

  async function saveStyle() {
    if (qrStyle) {
      await supabase
        .from("qr_styles")
        .update({
          dot_style: dotStyle,
          corner_style: cornerStyle,
          foreground_color: foregroundColor,
          background_color: backgroundColor,
          margin,
          error_correction_level: errorLevel,
        })
        .eq("id", qrStyle.id);
    } else {
      await supabase.from("qr_styles").insert({
        qr_code_id: qrId,
        dot_style: dotStyle,
        corner_style: cornerStyle,
        foreground_color: foregroundColor,
        background_color: backgroundColor,
        margin,
        error_correction_level: errorLevel,
      });
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
    <div>
      <Link
        href={`/dashboard/business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-[#111827] mb-2">
        Designer de QR Code
      </h1>
      <p className="text-gray-500 mb-8">
        Personalize o visual do seu QR code
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[350px]">
              <div ref={qrRef} className="flex items-center justify-center" />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="default" onClick={downloadPNG} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              PNG
            </Button>
            <Button variant="outline" onClick={downloadSVG} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
            <Button variant="accent" onClick={saveStyle}>
              Salvar Estilo
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estilo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Estilo dos pontos</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {["square", "rounded", "classy", "dots"].map((style) => (
                    <button
                      key={style}
                      onClick={() => setDotStyle(style)}
                      className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                        dotStyle === style
                          ? "border-[#111827] bg-[#111827]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {style === "square" ? "Quadrado" :
                       style === "rounded" ? "Arredondado" :
                       style === "classy" ? "Clássico" : "Pontos"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Estilo dos cantos</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["square", "rounded", "circle"].map((style) => (
                    <button
                      key={style}
                      onClick={() => setCornerStyle(style)}
                      className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                        cornerStyle === style
                          ? "border-[#111827] bg-[#111827]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {style === "square" ? "Quadrado" :
                       style === "rounded" ? "Arredondado" : "Círculo"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor principal</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor de fundo</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Margem: {margin}px</Label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Nível de correção</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "L", label: "L (7%)" },
                    { value: "M", label: "M (15%)" },
                    { value: "Q", label: "Q (25%)" },
                    { value: "H", label: "H (30%)" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setErrorLevel(level.value)}
                      className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        errorLevel === level.value
                          ? "border-[#111827] bg-[#111827]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
