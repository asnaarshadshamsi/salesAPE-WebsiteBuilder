/**
 * Business Theme Generator
 * Converts brand colors + business type into a full design token set
 */

import type { BusinessType } from '@/types/business';

export interface BusinessTypeTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  gradients: {
    hero: string;
    cta: string;
    card: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  rounded: string;
  shadow: string;
}

export interface BusinessTypeClasses {
  navStyle: string;
  heroStyle: string;
  cardStyle: string;
  buttonStyle: string;
  sectionStyle: string;
  badgeStyle: string;
}

// Typography & spacing per business archetype
const typeConfig: Record<string, { fonts: BusinessTypeTheme['fonts']; rounded: string; shadow: string }> = {
  luxury: {
    fonts: { heading: "'Playfair Display', Georgia, serif", body: "'Lato', system-ui, sans-serif" },
    rounded: '0.5rem',
    shadow: '0 10px 40px rgba(0,0,0,0.08)',
  },
  modern: {
    fonts: { heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
    rounded: '1rem',
    shadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
  warm: {
    fonts: { heading: "'Merriweather', Georgia, serif", body: "'Source Sans 3', system-ui, sans-serif" },
    rounded: '0.75rem',
    shadow: '0 6px 24px rgba(0,0,0,0.07)',
  },
  professional: {
    fonts: { heading: "'Montserrat', system-ui, sans-serif", body: "'Open Sans', system-ui, sans-serif" },
    rounded: '0.375rem',
    shadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  playful: {
    fonts: { heading: "'Nunito', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif" },
    rounded: '1.25rem',
    shadow: '0 8px 28px rgba(0,0,0,0.1)',
  },
};

const archetypeByType: Record<string, string> = {
  perfume: 'luxury', jewelry: 'luxury', hotel: 'luxury', spa: 'luxury',
  restaurant: 'warm', cafe: 'warm', bakery: 'warm', catering: 'warm',
  beauty: 'luxury', flowershop: 'warm', yoga: 'warm',
  fitness: 'modern', gym: 'modern', tech: 'modern', startup: 'modern', ecommerce: 'modern',
  law: 'professional', accounting: 'professional', healthcare: 'professional', dental: 'professional', consulting: 'professional',
  photography: 'modern', agency: 'modern', portfolio: 'modern',
  petcare: 'playful', events: 'playful',
  cleaning: 'professional', barbershop: 'modern', realestate: 'professional', education: 'professional',
};

export function generateBusinessTheme(
  primaryColor: string,
  secondaryColor: string,
  businessType: BusinessType | string,
): BusinessTypeTheme {
  const archetype = archetypeByType[businessType] || 'modern';
  const conf = typeConfig[archetype] || typeConfig.modern;

  return {
    colors: {
      primary: primaryColor || '#6366f1',
      secondary: secondaryColor || '#8b5cf6',
      accent: lightenHex(primaryColor || '#6366f1', 0.85),
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#111827',
      textMuted: '#6B7280',
      border: '#E5E7EB',
    },
    gradients: {
      hero: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      cta: `linear-gradient(135deg, ${primaryColor} 0%, ${darkenHex(primaryColor || '#6366f1', 0.15)} 100%)`,
      card: `linear-gradient(135deg, ${lightenHex(primaryColor || '#6366f1', 0.95)} 0%, ${lightenHex(secondaryColor || '#8b5cf6', 0.95)} 100%)`,
    },
    ...conf,
  };
}

export function getBusinessTypeClasses(businessType: BusinessType | string): BusinessTypeClasses {
  const archetype = archetypeByType[businessType] || 'modern';
  const base: BusinessTypeClasses = {
    navStyle: 'glass-morphism',
    heroStyle: 'parallax-bg',
    cardStyle: 'rounded-2xl shadow-lg hover-lift',
    buttonStyle: 'rounded-full font-semibold',
    sectionStyle: 'py-24',
    badgeStyle: 'rounded-full px-3 py-1 text-sm font-medium',
  };

  if (archetype === 'luxury') {
    return { ...base, cardStyle: 'rounded-xl shadow-xl hover-lift border border-gray-100', buttonStyle: 'rounded-sm font-medium tracking-wide uppercase text-sm' };
  }
  if (archetype === 'playful') {
    return { ...base, cardStyle: 'rounded-3xl shadow-lg hover-lift', buttonStyle: 'rounded-full font-bold text-lg' };
  }
  return base;
}

// ── Colour Utilities ────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').slice(0, 6);
  const n = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function lightenHex(hex: string, amount: number): string {
  try {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  } catch { return '#F3F4F6'; }
}

function darkenHex(hex: string, amount: number): string {
  try {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
  } catch { return '#374151'; }
}
