/**
 * Color Extractor Service
 * Extracts dominant colors from logos and brand imagery
 * Generates harmonious color palettes
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
}

interface ImageColors {
  dominant: string;
  palette: string[];
}

/**
 * Extract colors from image URL using a simple algorithm
 * In production, you might use a service like Cloudinary or AWS Rekognition
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ImageColors | null> {
  try {
    // For now, we'll use a heuristic approach
    // In production, you'd want to use Canvas API or image processing service
    
    // This is a placeholder that returns null
    // The actual implementation would require server-side image processing
    // or a third-party service
    
    console.log('Color extraction from image:', imageUrl);
    return null;
  } catch (error) {
    console.error('Failed to extract colors from image:', error);
    return null;
  }
}

/**
 * Generate a color palette based on brand tone
 */
export function generatePaletteFromTone(tone: string, primaryColor?: string): ColorPalette {
  const palettePresets: Record<string, ColorPalette> = {
    luxury: {
      primary: primaryColor || '#1a1a1a',
      secondary: '#8b7355',
      accent: '#c9a96e',
      background: '#fafafa',
      foreground: '#1a1a1a',
      muted: '#f5f5f5',
      mutedForeground: '#737373',
      card: '#ffffff',
      cardForeground: '#1a1a1a',
      border: '#e5e5e5',
    },
    minimal: {
      primary: primaryColor || '#000000',
      secondary: '#666666',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#000000',
      muted: '#f9fafb',
      mutedForeground: '#6b7280',
      card: '#ffffff',
      cardForeground: '#000000',
      border: '#e5e7eb',
    },
    playful: {
      primary: primaryColor || '#ec4899',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#fef3c7',
      foreground: '#1f2937',
      muted: '#fef3c7',
      mutedForeground: '#6b7280',
      card: '#ffffff',
      cardForeground: '#1f2937',
      border: '#fbbf24',
    },
    corporate: {
      primary: primaryColor || '#1e40af',
      secondary: '#475569',
      accent: '#0284c7',
      background: '#f8fafc',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      card: '#ffffff',
      cardForeground: '#0f172a',
      border: '#cbd5e1',
    },
    bold: {
      primary: primaryColor || '#dc2626',
      secondary: '#ea580c',
      accent: '#fbbf24',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      mutedForeground: '#cbd5e1',
      card: '#1e293b',
      cardForeground: '#f8fafc',
      border: '#334155',
    },
    editorial: {
      primary: primaryColor || '#0f172a',
      secondary: '#475569',
      accent: '#0891b2',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f8fafc',
      mutedForeground: '#64748b',
      card: '#f8fafc',
      cardForeground: '#0f172a',
      border: '#e2e8f0',
    },
  };

  return palettePresets[tone] || palettePresets.minimal;
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
 * Calculate relative luminance
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Ensure color contrast meets WCAG standards
 */
function ensureContrast(foreground: string, background: string): boolean {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return ratio >= 4.5; // WCAG AA standard
}

/**
 * Generate accessible palette from primary color
 */
export function generateAccessiblePalette(
  primaryColor: string,
  tone: string
): ColorPalette {
  const basePalette = generatePaletteFromTone(tone, primaryColor);
  
  // Ensure primary color has good contrast with background
  if (!ensureContrast(basePalette.primary, basePalette.background)) {
    // If contrast is poor, adjust the palette
    const luminance = getLuminance(basePalette.primary);
    if (luminance > 0.5) {
      // Primary is light, use dark background
      basePalette.background = '#0f172a';
      basePalette.foreground = '#f8fafc';
      basePalette.card = '#1e293b';
      basePalette.cardForeground = '#f8fafc';
    } else {
      // Primary is dark, use light background
      basePalette.background = '#ffffff';
      basePalette.foreground = '#0f172a';
      basePalette.card = '#ffffff';
      basePalette.cardForeground = '#0f172a';
    }
  }

  return basePalette;
}

/**
 * Extract color palette from business data
 */
export async function extractBrandColors(
  logoUrl: string | null,
  heroImage: string | null,
  existingPrimaryColor: string | null,
  brandTone: string
): Promise<ColorPalette> {
  let primaryColor = existingPrimaryColor;

  // Try to extract from logo first
  if (logoUrl && !primaryColor) {
    const logoColors = await extractColorsFromImage(logoUrl);
    if (logoColors) {
      primaryColor = logoColors.dominant;
    }
  }

  // Try to extract from hero image
  if (heroImage && !primaryColor) {
    const heroColors = await extractColorsFromImage(heroImage);
    if (heroColors) {
      primaryColor = heroColors.dominant;
    }
  }

  // Generate palette
  return generateAccessiblePalette(primaryColor || '', brandTone);
}

export const colorExtractorService = {
  extractColorsFromImage,
  generatePaletteFromTone,
  generateAccessiblePalette,
  extractBrandColors,
};
