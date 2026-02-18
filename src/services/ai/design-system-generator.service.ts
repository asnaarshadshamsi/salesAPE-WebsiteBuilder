/**
 * Design System Generator
 * Generates complete design systems dynamically based on brand analysis
 */

import { BrandAnalysis } from './brand-analyzer.service';
import { ColorPalette } from './color-extractor.service';

export interface DesignSystem {
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  borderRadius: BorderRadiusSystem;
  shadows: ShadowSystem;
  buttons: ButtonSystem;
  animations: AnimationSystem;
}

export interface TypographySystem {
  fontFamily: {
    heading: string;
    body: string;
  };
  scale: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
  };
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface SpacingSystem {
  scale: {
    '0': string;
    '1': string;
    '2': string;
    '3': string;
    '4': string;
    '5': string;
    '6': string;
    '8': string;
    '10': string;
    '12': string;
    '16': string;
    '20': string;
    '24': string;
    '32': string;
    '40': string;
    '48': string;
    '64': string;
    '80': string;
    '96': string;
  };
  sectionPadding: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface BorderRadiusSystem {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ShadowSystem {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface ButtonSystem {
  primary: ButtonStyle;
  secondary: ButtonStyle;
  outline: ButtonStyle;
  ghost: ButtonStyle;
}

export interface ButtonStyle {
  background: string;
  color: string;
  border: string;
  hoverBackground: string;
  hoverColor: string;
  padding: string;
  borderRadius: string;
  fontWeight: number;
  transition: string;
}

export interface AnimationSystem {
  durations: {
    fast: string;
    normal: string;
    slow: string;
  };
  easings: {
    default: string;
    smooth: string;
    bounce: string;
  };
  hover: {
    scale: number;
    lift: string;
  };
}

/**
 * Generate typography system based on brand tone
 */
function generateTypography(tone: string): TypographySystem {
  const typographyPresets: Record<string, TypographySystem> = {
    luxury: {
      fontFamily: {
        heading: "'Playfair Display', serif",
        body: "'Inter', sans-serif",
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.8',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
      },
    },
    minimal: {
      fontFamily: {
        heading: "'Inter', sans-serif",
        body: "'Inter', sans-serif",
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.5rem',
        '5xl': '3.5rem',
        '6xl': '4.5rem',
        '7xl': '6rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: '1.1',
        normal: '1.5',
        relaxed: '1.75',
      },
      letterSpacing: {
        tight: '-0.03em',
        normal: '0',
        wide: '0.02em',
      },
    },
    playful: {
      fontFamily: {
        heading: "'Poppins', sans-serif",
        body: "'Poppins', sans-serif",
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.625rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.25rem',
        '6xl': '4rem',
        '7xl': '5rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: '1.2',
        normal: '1.6',
        relaxed: '1.8',
      },
      letterSpacing: {
        tight: '0',
        normal: '0.01em',
        wide: '0.05em',
      },
    },
    corporate: {
      fontFamily: {
        heading: "'IBM Plex Sans', sans-serif",
        body: "'IBM Plex Sans', sans-serif",
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.02em',
      },
    },
    bold: {
      fontFamily: {
        heading: "'Space Grotesk', sans-serif",
        body: "'Inter', sans-serif",
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
        '5xl': '4rem',
        '6xl': '5rem',
        '7xl': '6rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 700,
        bold: 900,
      },
      lineHeights: {
        tight: '1.1',
        normal: '1.4',
        relaxed: '1.6',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.03em',
      },
    },
    editorial: {
      fontFamily: {
        heading: "'Merriweather', serif",
        body: "'Georgia', serif",
      },
      scale: {
        xs: '0.875rem',
        sm: '0.9375rem',
        base: '1.0625rem',
        lg: '1.1875rem',
        xl: '1.375rem',
        '2xl': '1.625rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: '1.3',
        normal: '1.7',
        relaxed: '1.9',
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0.01em',
        wide: '0.03em',
      },
    },
  };

  return typographyPresets[tone] || typographyPresets.minimal;
}

/**
 * Generate spacing system based on brand tone
 */
function generateSpacing(tone: string, layoutDensity: string): SpacingSystem {
  const multiplier = layoutDensity === 'compact' ? 0.875 : layoutDensity === 'spacious' ? 1.25 : 1;

  return {
    scale: {
      '0': '0',
      '1': `${0.25 * multiplier}rem`,
      '2': `${0.5 * multiplier}rem`,
      '3': `${0.75 * multiplier}rem`,
      '4': `${1 * multiplier}rem`,
      '5': `${1.25 * multiplier}rem`,
      '6': `${1.5 * multiplier}rem`,
      '8': `${2 * multiplier}rem`,
      '10': `${2.5 * multiplier}rem`,
      '12': `${3 * multiplier}rem`,
      '16': `${4 * multiplier}rem`,
      '20': `${5 * multiplier}rem`,
      '24': `${6 * multiplier}rem`,
      '32': `${8 * multiplier}rem`,
      '40': `${10 * multiplier}rem`,
      '48': `${12 * multiplier}rem`,
      '64': `${16 * multiplier}rem`,
      '80': `${20 * multiplier}rem`,
      '96': `${24 * multiplier}rem`,
    },
    sectionPadding: {
      sm: `${3 * multiplier}rem`,
      md: `${5 * multiplier}rem`,
      lg: `${8 * multiplier}rem`,
    },
  };
}

/**
 * Generate border radius system based on brand tone
 */
function generateBorderRadius(tone: string): BorderRadiusSystem {
  const radiusPresets: Record<string, BorderRadiusSystem> = {
    luxury: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      '2xl': '0.75rem',
      '3xl': '1rem',
      full: '9999px',
    },
    minimal: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      '2xl': '0.75rem',
      '3xl': '1rem',
      full: '9999px',
    },
    playful: {
      none: '0',
      sm: '0.375rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      full: '9999px',
    },
    corporate: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      '2xl': '0.625rem',
      '3xl': '0.75rem',
      full: '9999px',
    },
    bold: {
      none: '0',
      sm: '0',
      md: '0',
      lg: '0.25rem',
      xl: '0.5rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    editorial: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
  };

  return radiusPresets[tone] || radiusPresets.minimal;
}

/**
 * Generate shadow system based on brand tone
 */
function generateShadows(tone: string): ShadowSystem {
  const shadowPresets: Record<string, ShadowSystem> = {
    luxury: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    minimal: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      md: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
      xl: '0 8px 12px -2px rgba(0, 0, 0, 0.1)',
      '2xl': '0 12px 24px -4px rgba(0, 0, 0, 0.12)',
      inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    },
    playful: {
      sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 8px -1px rgba(0, 0, 0, 0.15)',
      lg: '0 8px 16px -2px rgba(0, 0, 0, 0.2)',
      xl: '0 16px 32px -4px rgba(0, 0, 0, 0.25)',
      '2xl': '0 24px 48px -6px rgba(0, 0, 0, 0.3)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
    },
    corporate: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      md: '0 2px 4px -1px rgba(0, 0, 0, 0.08)',
      lg: '0 4px 8px -2px rgba(0, 0, 0, 0.1)',
      xl: '0 8px 16px -4px rgba(0, 0, 0, 0.12)',
      '2xl': '0 16px 32px -8px rgba(0, 0, 0, 0.15)',
      inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    bold: {
      sm: '0 0 0 1px rgba(0, 0, 0, 0.1)',
      md: '0 0 0 2px rgba(0, 0, 0, 0.2)',
      lg: '0 0 0 3px rgba(0, 0, 0, 0.3)',
      xl: '0 8px 16px -4px rgba(0, 0, 0, 0.4)',
      '2xl': '0 16px 32px -8px rgba(0, 0, 0, 0.5)',
      inner: 'inset 0 0 0 2px rgba(0, 0, 0, 0.1)',
    },
    editorial: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
      md: '0 3px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 6px 12px -2px rgba(0, 0, 0, 0.12)',
      xl: '0 12px 24px -4px rgba(0, 0, 0, 0.15)',
      '2xl': '0 20px 40px -8px rgba(0, 0, 0, 0.18)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
  };

  return shadowPresets[tone] || shadowPresets.minimal;
}

/**
 * Generate button system based on brand tone and colors
 */
function generateButtons(tone: string, colors: ColorPalette, borderRadius: BorderRadiusSystem): ButtonSystem {
  return {
    primary: {
      background: colors.primary,
      color: colors.background,
      border: 'none',
      hoverBackground: colors.accent,
      hoverColor: colors.background,
      padding: '0.75rem 1.5rem',
      borderRadius: borderRadius.lg,
      fontWeight: tone === 'bold' ? 700 : 600,
      transition: 'all 0.2s ease',
    },
    secondary: {
      background: colors.secondary,
      color: colors.background,
      border: 'none',
      hoverBackground: colors.primary,
      hoverColor: colors.background,
      padding: '0.75rem 1.5rem',
      borderRadius: borderRadius.lg,
      fontWeight: tone === 'bold' ? 700 : 500,
      transition: 'all 0.2s ease',
    },
    outline: {
      background: 'transparent',
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
      hoverBackground: colors.primary,
      hoverColor: colors.background,
      padding: '0.75rem 1.5rem',
      borderRadius: borderRadius.lg,
      fontWeight: tone === 'bold' ? 700 : 500,
      transition: 'all 0.2s ease',
    },
    ghost: {
      background: 'transparent',
      color: colors.foreground,
      border: 'none',
      hoverBackground: colors.muted,
      hoverColor: colors.foreground,
      padding: '0.75rem 1.5rem',
      borderRadius: borderRadius.lg,
      fontWeight: 500,
      transition: 'all 0.2s ease',
    },
  };
}

/**
 * Generate animation system based on brand tone
 */
function generateAnimations(tone: string): AnimationSystem {
  const animationPresets: Record<string, AnimationSystem> = {
    luxury: {
      durations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      hover: {
        scale: 1.02,
        lift: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
    minimal: {
      durations: {
        fast: '100ms',
        normal: '200ms',
        slow: '300ms',
      },
      easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      hover: {
        scale: 1.01,
        lift: '0 4px 8px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    playful: {
      durations: {
        fast: '150ms',
        normal: '300ms',
        slow: '600ms',
      },
      easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      hover: {
        scale: 1.05,
        lift: '0 12px 30px -8px rgba(0, 0, 0, 0.2)',
      },
    },
    corporate: {
      durations: {
        fast: '100ms',
        normal: '250ms',
        slow: '400ms',
      },
      easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      hover: {
        scale: 1.02,
        lift: '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      },
    },
    bold: {
      durations: {
        fast: '100ms',
        normal: '200ms',
        slow: '400ms',
      },
      easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      hover: {
        scale: 1.03,
        lift: '0 8px 20px -4px rgba(0, 0, 0, 0.3)',
      },
    },
    editorial: {
      durations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      hover: {
        scale: 1.02,
        lift: '0 6px 16px -4px rgba(0, 0, 0, 0.12)',
      },
    },
  };

  return animationPresets[tone] || animationPresets.minimal;
}

/**
 * Main design system generator
 */
export function generateDesignSystem(
  brandAnalysis: BrandAnalysis,
  colors: ColorPalette
): DesignSystem {
  const { tone, visualStyle } = brandAnalysis;

  const typography = generateTypography(tone);
  const spacing = generateSpacing(tone, visualStyle.preferredLayout);
  const borderRadius = generateBorderRadius(tone);
  const shadows = generateShadows(tone);
  const buttons = generateButtons(tone, colors, borderRadius);
  const animations = generateAnimations(tone);

  return {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    buttons,
    animations,
  };
}

export const designSystemGenerator = {
  generateDesignSystem,
  generateTypography,
  generateSpacing,
  generateBorderRadius,
  generateShadows,
  generateButtons,
  generateAnimations,
};
