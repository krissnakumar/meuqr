"use client";

import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { cn } from "./utils";

export interface ImageUploadProps {
  value?: string;
  onChange?: (file: File) => void;
  onRemove?: () => void;
  label?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  shape?: "rounded" | "circle";
  placeholderIcon?: React.ReactNode;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Fazer upload",
  className,
  aspectRatio = "square",
  shape = "rounded",
  placeholderIcon,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  // Sync prop value
  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    // Create a local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setLoading(false);
      if (onChange) onChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    if (onRemove) onRemove();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden cursor-pointer group border-2 border-dashed flex items-center justify-center transition-all bg-gray-50 hover:bg-gray-100",
          shape === "circle" ? "rounded-full" : "rounded-xl",
          aspectRatio === "square" && "aspect-square",
          aspectRatio === "video" && "aspect-video",
          preview ? "border-transparent" : "border-gray-200 hover:border-indigo-300"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isHovered && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-sm transition-all animate-in fade-in">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Alterar</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors p-4 text-center">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
            ) : placeholderIcon ? (
              placeholderIcon
            ) : shape === "circle" ? (
              <Camera className="w-6 h-6 mb-2" />
            ) : (
              <ImageIcon className="w-8 h-8 mb-2" />
            )}
            <span className="text-xs font-medium max-w-[120px]">{loading ? "Carregando..." : label}</span>
          </div>
        )}
      </div>
      
      {preview && onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs font-semibold text-red-500 hover:text-red-600 self-center"
        >
          Remover imagem
        </button>
      )}
    </div>
  );
}
