'use client';

import type { DesignSystem as RawDesignSystem } from './ai/design-system-generator.service';

export interface ResolvedDesignSystem {
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
    h1: { size: string; lineHeight: string; weight: number; letterSpacing: string };
    h2: { size: string; lineHeight: string; weight: number; letterSpacing: string };
    h3: { size: string; lineHeight: string; weight: number; letterSpacing: string };
    h4: { size: string; lineHeight: string; weight: number; letterSpacing: string };
    body: { size: string; lineHeight: string; weight: number; letterSpacing: string };
    small: { size: string; lineHeight: string; weight: number; letterSpacing: string };
    fontFamily: {
      heading: string;
      body: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    section: string;
    container: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    button: string;
    card: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    button: string;
    card: string;
  };
  animations: {
    durations: {
      fast: string;
      normal: string;
      slow: string;
    };
    easings: {
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

/**
 * Resolves raw design system to unified component format
 */
export function resolveDesignSystem(raw: RawDesignSystem): ResolvedDesignSystem {
  const { colors, typography, spacing, borderRadius, shadows, animations } = raw;

  return {
    colors,
    typography: {
      h1: {
        size: typography.scale["6xl"],
        lineHeight: typography.lineHeights.tight,
        weight: typography.weights.bold,
        letterSpacing: typography.letterSpacing.tight,
      },
      h2: {
        size: typography.scale["5xl"],
        lineHeight: typography.lineHeights.tight,
        weight: typography.weights.bold,
        letterSpacing: typography.letterSpacing.normal,
      },
      h3: {
        size: typography.scale["4xl"],
        lineHeight: typography.lineHeights.normal,
        weight: typography.weights.semibold,
        letterSpacing: typography.letterSpacing.normal,
      },
      h4: {
        size: typography.scale["2xl"],
        lineHeight: typography.lineHeights.normal,
        weight: typography.weights.semibold,
        letterSpacing: typography.letterSpacing.normal,
      },
      body: {
        size: typography.scale.base,
        lineHeight: typography.lineHeights.relaxed,
        weight: typography.weights.normal,
        letterSpacing: typography.letterSpacing.normal,
      },
      small: {
        size: typography.scale.sm,
        lineHeight: typography.lineHeights.normal,
        weight: typography.weights.normal,
        letterSpacing: typography.letterSpacing.normal,
      },
      fontFamily: typography.fontFamily,
    },
    spacing: {
      xs: spacing.scale["1"],
      sm: spacing.scale["2"],
      md: spacing.scale["4"],
      lg: spacing.scale["6"],
      xl: spacing.scale["8"],
      '2xl': spacing.scale["12"],
      '3xl': spacing.scale["16"],
      section: spacing.sectionPadding.lg,
      container: "1280px",
    },
    borderRadius: {
      none: borderRadius.none,
      sm: borderRadius.sm,
      md: borderRadius.md,
      lg: borderRadius.lg,
      xl: borderRadius.xl,
      button: borderRadius.md,
      card: borderRadius.lg,
      full: borderRadius.full,
    },
    shadows: {
      sm: shadows.sm,
      md: shadows.md,
      lg: shadows.lg,
      xl: shadows.xl,
      button: shadows.md,
      card: shadows.lg,
    },
    animations: {
      durations: {
        fast: "0.15s",
        normal: "0.3s",
        slow: "0.5s",
      },
      easings: {
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        easeOut: "cubic-bezier(0, 0, 0.2, 1)",
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  };
}

export type DesignSystem = ResolvedDesignSystem;
