/**
 * Hero with Centered Text
 * Clean, centered hero with optional background
 * Best for: Minimal, Corporate, Editorial brands
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DesignSystem } from "@/services/design-system-resolver.service";

export interface HeroCenteredProps {
  headline: string;
  subheadline?: string;
  ctaText: string;
  secondaryCtaText?: string;
  ctaLink?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  showStats?: { label: string; value: string }[];
  designSystem: DesignSystem;
}

export function HeroCentered({
  headline,
  subheadline,
  ctaText,
  secondaryCtaText,
  ctaLink = "#",
  secondaryCtaLink = "#",
  backgroundImage,
  showStats,
  designSystem,
}: HeroCenteredProps) {
  const { typography, spacing, colors, animations, borderRadius, shadows } = designSystem;
  const dur = parseFloat(animations.durations.normal) * 2;
  const ease = animations.easings.easeOut;
  const trans = `all ${animations.durations.normal} ${animations.easings.easeInOut}`;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: backgroundImage ? 'transparent' : colors.background,
        paddingTop: spacing['3xl'],
        paddingBottom: spacing['3xl'],
      }}
    >
      {/* Optional Background */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.1,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center" style={{ maxWidth: '1000px' }}>
        <motion.h1
          style={{
            fontSize: typography.h1.size,
            lineHeight: typography.h1.lineHeight,
            fontWeight: typography.h1.weight,
            letterSpacing: typography.h1.letterSpacing,
            color: colors.foreground,
            marginBottom: spacing.md,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, ease: "easeOut" }}
        >
          {headline}
        </motion.h1>

        {subheadline && (
          <motion.p
            className="mx-auto"
            style={{
              fontSize: typography.body.size,
              lineHeight: typography.body.lineHeight,
              color: colors.mutedForeground,
              marginBottom: spacing.xl,
              maxWidth: '700px',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: 0.2, ease: "easeOut" }}
          >
            {subheadline}
          </motion.p>
        )}

        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          style={{ marginBottom: spacing['2xl'] }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
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

        {/* Optional Stats */}
        {showStats && showStats.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mx-auto"
            style={{ maxWidth: '800px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: 0.6, ease: "easeOut" }}
          >
            {showStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  style={{
                    fontSize: typography.h2.size,
                    fontWeight: typography.h2.weight,
                    color: colors.primary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: typography.small.size,
                    color: colors.mutedForeground,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
