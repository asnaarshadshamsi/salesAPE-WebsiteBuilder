"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  styles: {
    heroStyle: "gradient" | "image" | "minimal" | "bold";
    cardStyle: "rounded" | "sharp" | "floating" | "bordered";
    fontStyle: "modern" | "classic" | "playful" | "elegant";
  };
}

export const themes: ThemeConfig[] = [
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean and professional",
    preview: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      background: "#ffffff",
      text: "#1f2937",
      accent: "#f3f4f6",
    },
    styles: {
      heroStyle: "gradient",
      cardStyle: "rounded",
      fontStyle: "modern",
    },
  },
  {
    id: "bold",
    name: "Bold & Vibrant",
    description: "Stand out from the crowd",
    preview: {
      primary: "#ef4444",
      secondary: "#f97316",
      background: "#fef2f2",
      text: "#1f2937",
      accent: "#fee2e2",
    },
    styles: {
      heroStyle: "bold",
      cardStyle: "sharp",
      fontStyle: "modern",
    },
  },
  {
    id: "dark",
    name: "Dark Elegance",
    description: "Sophisticated and sleek",
    preview: {
      primary: "#a855f7",
      secondary: "#ec4899",
      background: "#0f0f0f",
      text: "#f9fafb",
      accent: "#1f1f1f",
    },
    styles: {
      heroStyle: "minimal",
      cardStyle: "floating",
      fontStyle: "elegant",
    },
  },
  {
    id: "nature",
    name: "Natural & Organic",
    description: "Earthy and trustworthy",
    preview: {
      primary: "#059669",
      secondary: "#10b981",
      background: "#f0fdf4",
      text: "#1f2937",
      accent: "#dcfce7",
    },
    styles: {
      heroStyle: "image",
      cardStyle: "rounded",
      fontStyle: "classic",
    },
  },
  {
    id: "playful",
    name: "Playful & Fun",
    description: "Energetic and friendly",
    preview: {
      primary: "#f59e0b",
      secondary: "#84cc16",
      background: "#fffbeb",
      text: "#1f2937",
      accent: "#fef3c7",
    },
    styles: {
      heroStyle: "bold",
      cardStyle: "rounded",
      fontStyle: "playful",
    },
  },
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onSelect: (themeId: string) => void;
  primaryColor?: string;
}

export function ThemeSelector({ selectedTheme, onSelect, primaryColor }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        <Palette className="w-4 h-4" />
        Change Theme
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose a Theme</h3>
            <div className="space-y-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelect(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedTheme === theme.id
                      ? "bg-indigo-50 border-2 border-indigo-500"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  {/* Theme color preview */}
                  <div className="flex -space-x-1">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.preview.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.preview.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.preview.background }}
                    />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{theme.name}</p>
                    <p className="text-xs text-gray-500">{theme.description}</p>
                  </div>

                  {selectedTheme === theme.id && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom theme hint */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                Your brand colors will be applied to any theme
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
