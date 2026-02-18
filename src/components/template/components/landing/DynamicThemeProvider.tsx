"use client";

import { useEffect } from 'react';

interface DynamicThemeProviderProps {
  primaryColor?: string;
  secondaryColor?: string;
  children: React.ReactNode;
}

/**
 * DynamicThemeProvider - Injects CSS variables for dynamic theming
 * 
 * Takes scraped brand colors and creates a cohesive theme with proper contrast.
 * Generates lighter/darker shades and determines optimal text colors.
 */
export default function DynamicThemeProvider({
  primaryColor,
  secondaryColor,
  children,
}: DynamicThemeProviderProps) {
  useEffect(() => {
    if (!primaryColor) return;

    // Create a custom style element for dynamic CSS variables
    const styleId = 'dynamic-theme-vars';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    // Generate theme colors
    const theme = generateTheme(primaryColor, secondaryColor);
    
    // Inject CSS variables
    styleEl.textContent = `
      :root {
        --background: ${theme.background};
        --foreground: ${theme.foreground};
        --card: ${theme.card};
        --card-foreground: ${theme.cardForeground};
        --popover: ${theme.popover};
        --popover-foreground: ${theme.popoverForeground};
        --primary: ${theme.primary};
        --primary-foreground: ${theme.primaryForeground};
        --secondary: ${theme.secondary};
        --secondary-foreground: ${theme.secondaryForeground};
        --muted: ${theme.muted};
        --muted-foreground: ${theme.mutedForeground};
        --accent: ${theme.accent};
        --accent-foreground: ${theme.accentForeground};
        --destructive: ${theme.destructive};
        --destructive-foreground: ${theme.destructiveForeground};
        --border: ${theme.border};
        --input: ${theme.input};
        --ring: ${theme.ring};
      }
    `;
  }, [primaryColor, secondaryColor]);

  return <>{children}</>;
}

/**
 * Generate a complete theme from brand colors
 */
function generateTheme(primaryColor: string, secondaryColor?: string) {
  const primary = primaryColor;
  const secondary = secondaryColor || primaryColor;
  
  // Determine if primary color is light or dark
  const isLightPrimary = isColorLight(primary);
  const isLightSecondary = isColorLight(secondary);
  
  // For background, use white or very light shade unless the brand is explicitly dark
  const background = isLightPrimary ? '#ffffff' : lighten(primary, 0.95);
  const foreground = isLightPrimary ? '#18181b' : darken(primary, 0.85);
  
  return {
    background,
    foreground,
    card: '#ffffff',
    cardForeground: foreground,
    popover: '#ffffff',
    popoverForeground: foreground,
    primary: primary,
    primaryForeground: isLightPrimary ? '#18181b' : '#ffffff',
    secondary: secondary,
    secondaryForeground: isLightSecondary ? '#18181b' : '#ffffff',
    muted: isLightPrimary ? '#f4f4f5' : lighten(primary, 0.85),
    mutedForeground: isLightPrimary ? '#71717a' : darken(primary, 0.4),
    accent: secondary,
    accentForeground: isLightSecondary ? '#18181b' : '#ffffff',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: isLightPrimary ? '#e4e4e7' : lighten(primary, 0.75),
    input: isLightPrimary ? '#e4e4e7' : lighten(primary, 0.75),
    ring: primary,
  };
}

/**
 * Determine if a color is light (luminance > 0.5)
 */
function isColorLight(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return true;
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Lighten a color by a percentage (0-1)
 */
function lighten(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = rgb.r + (255 - rgb.r) * amount;
  const g = rgb.g + (255 - rgb.g) * amount;
  const b = rgb.b + (255 - rgb.b) * amount;
  
  return rgbToHex(r, g, b);
}

/**
 * Darken a color by a percentage (0-1)
 */
function darken(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = rgb.r * (1 - amount);
  const g = rgb.g * (1 - amount);
  const b = rgb.b * (1 - amount);
  
  return rgbToHex(r, g, b);
}
