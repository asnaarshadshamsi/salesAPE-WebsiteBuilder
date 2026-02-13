"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./ui";

interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (imageUrl: string | null) => void;
  maxSizeMB?: number;
  recommendedDimensions?: string;
  className?: string;
}

export function ImageUpload({
  label = "Upload Image",
  value,
  onChange,
  maxSizeMB = 5,
  recommendedDimensions,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read image file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300 block">
          {label}
        </label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload image file"
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border border-zinc-700"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
            <Button
              variant="outline"
              onClick={handleRemove}
              className="!bg-red-500 !text-white !border-red-600 hover:!bg-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full h-48 border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-pink-500/50 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload image</p>
                {recommendedDimensions && (
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: {recommendedDimensions}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max size: {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

// Simple image placeholder generator
export function ImagePlaceholder({
  text,
  color = "#ec4899",
  width = 800,
  height = 600,
  className = "",
}: {
  text?: string;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="32"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${text || ""}
      </text>
    </svg>
  `;

  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  return (
    <img
      src={dataUrl}
      alt={text || "Placeholder"}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
