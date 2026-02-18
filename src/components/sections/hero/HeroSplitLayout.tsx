/**
 * Hero with Split Layout
 * Half text, half image layout
 * Best for: Corporate, Minimal, Editorial brands
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DesignSystem } from "@/services/design-system-resolver.service";

export interface HeroSplitLayoutProps {
  headline: string;
  subheadline?: string;
  ctaText: string;
  secondaryCtaText?: string;
  ctaLink?: string;
  secondaryCtaLink?: string;
  heroImage: string;
  imagePosition?: 'left' | 'right';
  designSystem: DesignSystem;
}

export function HeroSplitLayout({
  headline,
  subheadline,
  ctaText,
  secondaryCtaText,
  ctaLink = "#",
  secondaryCtaLink = "#",
  heroImage,
  imagePosition = 'right',
  designSystem,
}: HeroSplitLayoutProps) {
  const { typography, spacing, colors, animations, borderRadius, shadows } = designSystem;
  const dur = parseFloat(animations.durations.normal) * 2;
  const ease = animations.easings.easeOut;
  const trans = `all ${animations.durations.normal} ${animations.easings.easeInOut}`;

  const contentSection = (
    <div className="flex items-center justify-center" style={{ padding: spacing.xl }}>
      <div style={{ maxWidth: '600px' }}>
        <motion.h1
          style={{
            fontSize: typography.h1.size,
            lineHeight: typography.h1.lineHeight,
            fontWeight: typography.h1.weight,
            letterSpacing: typography.h1.letterSpacing,
            color: colors.foreground,
            marginBottom: spacing.md,
          }}
          initial={{ opacity: 0, x: imagePosition === 'right' ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: dur, ease: "easeOut" }}
        >
          {headline}
        </motion.h1>

        {subheadline && (
          <motion.p
            style={{
              fontSize: typography.body.size,
              lineHeight: typography.body.lineHeight,
              color: colors.mutedForeground,
              marginBottom: spacing.lg,
            }}
            initial={{ opacity: 0, x: imagePosition === 'right' ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: dur, delay: 0.2, ease: "easeOut" }}
          >
            {subheadline}
          </motion.p>
        )}

        <motion.div
          className="flex gap-4 flex-wrap"
          initial={{ opacity: 0, x: imagePosition === 'right' ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: dur, delay: 0.4, ease: "easeOut" }}
        >
          <a href={ctaLink}>
            <Button
              size="lg"
              className="hover:scale-105"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
                borderRadius: borderRadius.button,
                boxShadow: shadows.button,
                transition: trans,
              }}
            >
              {ctaText}
            </Button>
          </a>
          
          {secondaryCtaText && (
            <a href={secondaryCtaLink}>
              <Button
                size="lg"
                variant="outline"
                className="hover:scale-105"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  borderRadius: borderRadius.button,
                  transition: trans,
                }}
              >
                {secondaryCtaText}
              </Button>
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );

  const imageSection = (
    <div className="relative overflow-hidden h-full">
      <motion.img
        src={heroImage}
        alt={headline}
        className="w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}10, transparent)`,
        }}
      />
    </div>
  );

  return (
    <section
      className="min-h-screen grid lg:grid-cols-2"
      style={{
        backgroundColor: colors.background,
        paddingTop: spacing.section,
        paddingBottom: spacing.section,
      }}
    >
      {imagePosition === 'left' ? (
        <>
          {imageSection}
          {contentSection}
        </>
      ) : (
        <>
          {contentSection}
          {imageSection}
        </>
      )}
    </section>
  );
}
