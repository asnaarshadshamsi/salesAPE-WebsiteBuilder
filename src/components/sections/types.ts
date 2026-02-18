/**
 * Shared types for all section components
 * Defines the "resolved" DesignSystem shape that components consume
 */

import type { ColorPalette } from '@/services/ai/color-extractor.service';
import type {
  DesignSystem as RawDesignSystem,
} from '@/services/ai/design-system-generator.service';

/* ------------------------------------------------------------------ */
/*  Resolved / component-level design-system                          */
/* ------------------------------------------------------------------ */

export interface TypographyToken {
  size: string;
  lineHeight: string;
  weight: number;
  letterSpacing: string;
}

export interface ResolvedTypography {
  fontFamily: { heading: string; body: string };
  h1: TypographyToken;
  h2: TypographyToken;
  h3: TypographyToken;
  h4: TypographyToken;
  body: { size: string; lineHeight: string };
  small: { size: string; weight: number };
  caption: { size: string };
}

export interface ResolvedSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  section: string;
  container: string;
}

export interface ResolvedBorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  card: string;
  button: string;
}

export interface ResolvedShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  card: string;
  button: string;
}

export interface ResolvedAnimations {
  duration: string;
  easing: string;
  hover: { scale: number; lift: string };
}

/** The shape every section component destructures */
export interface SectionDesignSystem {
  colors: ColorPalette;
  typography: ResolvedTypography;
  spacing: ResolvedSpacing;
  borderRadius: ResolvedBorderRadius;
  shadows: ResolvedShadows;
  animations: ResolvedAnimations;
}

/* ------------------------------------------------------------------ */
/*  Resolver – raw generator output  →  component-ready tokens        */
/* ------------------------------------------------------------------ */

export function resolveDesignSystem(raw: RawDesignSystem): SectionDesignSystem {
  const { colors, typography: t, spacing: s, borderRadius: br, shadows: sh, animations: a } = raw;

  const typography: ResolvedTypography = {
    fontFamily: t.fontFamily,
    h1: {
      size: t.scale['6xl'],
      lineHeight: t.lineHeights.tight,
      weight: t.weights.bold,
      letterSpacing: t.letterSpacing.tight,
    },
    h2: {
      size: t.scale['4xl'],
      lineHeight: t.lineHeights.tight,
      weight: t.weights.bold,
      letterSpacing: t.letterSpacing.tight,
    },
    h3: {
      size: t.scale['2xl'],
      lineHeight: t.lineHeights.normal,
      weight: t.weights.semibold,
      letterSpacing: t.letterSpacing.normal,
    },
    h4: {
      size: t.scale.lg,
      lineHeight: t.lineHeights.normal,
      weight: t.weights.semibold,
      letterSpacing: t.letterSpacing.normal,
    },
    body: {
      size: t.scale.lg,
      lineHeight: t.lineHeights.relaxed,
    },
    small: {
      size: t.scale.sm,
      weight: t.weights.medium,
    },
    caption: {
      size: t.scale.xs,
    },
  };

  const spacing: ResolvedSpacing = {
    xs: s.scale['1'],
    sm: s.scale['2'],
    md: s.scale['4'],
    lg: s.scale['6'],
    xl: s.scale['8'],
    '2xl': s.scale['12'],
    '3xl': s.scale['16'],
    section: s.sectionPadding.lg,
    container: '80rem',
  };

  const borderRadius: ResolvedBorderRadius = {
    sm: br.sm,
    md: br.md,
    lg: br.lg,
    xl: br.xl,
    full: br.full,
    card: br.xl,
    button: br.lg,
  };

  const shadows: ResolvedShadows = {
    sm: sh.sm,
    md: sh.md,
    lg: sh.lg,
    xl: sh.xl,
    card: sh.md,
    button: sh.sm,
  };

  const animations: ResolvedAnimations = {
    duration: a.durations.normal,
    easing: a.easings.smooth,
    hover: a.hover,
  };

  return { colors, typography, spacing, borderRadius, shadows, animations };
}

/* Re-export so component files only need one import */
export type { ColorPalette };

/* Aliases for backward compatibility */
export type ResolvedDesignSystem = SectionDesignSystem;

/**
 * Legacy SectionProps used by old-style section components.
 * `design` uses a flattened shape with headingScale for backward compat.
 */
export interface SectionProps {
  design: {
    colors: {
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
    };
    typography: {
      fontFamily: string;
      headingScale: {
        h1: { size: string; lineHeight: string; weight: number };
        h2: { size: string; lineHeight: string; weight: number };
        h3: { size: string; lineHeight: string; weight: number };
        h4: { size: string; lineHeight: string; weight: number };
        h5: { size: string; lineHeight: string; weight: number };
        h6: { size: string; lineHeight: string; weight: number };
      };
      bodySize: string;
      bodyLineHeight: string;
    };
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
    shadows: Record<string, string>;
    buttons: { primary: string; secondary: string; outline: string };
  };
  data: Record<string, any>;
}

/**
 * Convert SectionDesignSystem → SectionProps['design']
 */
export function toSectionPropsDesign(ds: SectionDesignSystem): SectionProps['design'] {
  return {
    colors: ds.colors,
    typography: {
      fontFamily: ds.typography.fontFamily.body,
      headingScale: {
        h1: { size: ds.typography.h1.size, lineHeight: ds.typography.h1.lineHeight, weight: ds.typography.h1.weight },
        h2: { size: ds.typography.h2.size, lineHeight: ds.typography.h2.lineHeight, weight: ds.typography.h2.weight },
        h3: { size: ds.typography.h3.size, lineHeight: ds.typography.h3.lineHeight, weight: ds.typography.h3.weight },
        h4: { size: ds.typography.h4.size, lineHeight: ds.typography.h4.lineHeight, weight: ds.typography.h4.weight },
        h5: { size: ds.typography.h4.size, lineHeight: ds.typography.h4.lineHeight, weight: ds.typography.h4.weight },
        h6: { size: ds.typography.body.size, lineHeight: ds.typography.body.lineHeight, weight: 500 },
      },
      bodySize: ds.typography.body.size,
      bodyLineHeight: ds.typography.body.lineHeight,
    },
    spacing: {
      xs: ds.spacing.xs,
      sm: ds.spacing.sm,
      md: ds.spacing.md,
      lg: ds.spacing.lg,
      xl: ds.spacing.xl,
      '2xl': ds.spacing['2xl'],
      '3xl': ds.spacing['3xl'],
      section: ds.spacing.section,
      container: ds.spacing.container,
    },
    borderRadius: {
      sm: ds.borderRadius.sm,
      md: ds.borderRadius.md,
      lg: ds.borderRadius.lg,
      xl: ds.borderRadius.xl,
      full: ds.borderRadius.full,
      card: ds.borderRadius.card,
      button: ds.borderRadius.button,
    },
    shadows: {
      sm: ds.shadows.sm,
      md: ds.shadows.md,
      lg: ds.shadows.lg,
      xl: ds.shadows.xl,
      card: ds.shadows.card,
      button: ds.shadows.button,
    },
    buttons: {
      primary: `background-color: ${ds.colors.primary}; color: white; padding: 0.75rem 1.5rem; border-radius: ${ds.borderRadius.button};`,
      secondary: `background-color: ${ds.colors.secondary}; color: white;`,
      outline: `border: 1px solid ${ds.colors.primary}; color: ${ds.colors.primary};`,
    },
  };
}
