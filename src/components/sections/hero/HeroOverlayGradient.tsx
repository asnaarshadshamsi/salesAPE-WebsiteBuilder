/**
 * Hero with Overlay Gradient
 * Full-screen with gradient overlay and dynamic colors
 * Best for: Playful, Bold brands
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DesignSystem } from "@/services/design-system-resolver.service";

export interface HeroOverlayGradientProps {
  headline: string;
  subheadline?: string;
  ctaText: string;
  ctaLink?: string;
  backgroundImage?: string;
  features?: string[];
  designSystem: DesignSystem;
}

export function HeroOverlayGradient({
  headline,
  subheadline,
  ctaText,
  ctaLink = "#",
  backgroundImage,
  features,
  designSystem,
}: HeroOverlayGradientProps) {
  const { typography, spacing, colors, animations, borderRadius, shadows } = designSystem;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: backgroundImage
            ? `linear-gradient(135deg, ${colors.primary}DD 0%, ${colors.secondary}DD 50%, ${colors.accent}DD 100%), url(${backgroundImage})`
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated Shapes */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-20"
        style={{
          background: colors.accent,
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-20"
        style={{
          background: colors.secondary,
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 container mx-auto px-4"
        style={{
          paddingTop: spacing['3xl'],
          paddingBottom: spacing['3xl'],
          maxWidth: '1200px',
        }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              className="text-white"
              style={{
                fontSize: typography.h1.size,
                lineHeight: typography.h1.lineHeight,
                fontWeight: typography.h1.weight,
                letterSpacing: typography.h1.letterSpacing,
                marginBottom: spacing.md,
              }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: parseFloat(animations.durations.normal) * 2, ease: "easeOut" }}
            >
              {headline}
            </motion.h1>

            {subheadline && (
              <motion.p
                className="text-white/90"
                style={{
                  fontSize: typography.body.size,
                  lineHeight: typography.body.lineHeight,
                  marginBottom: spacing.lg,
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: parseFloat(animations.durations.normal) * 2, delay: 0.2, ease: "easeOut" }}
              >
                {subheadline}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: parseFloat(animations.durations.normal) * 2, delay: 0.4, ease: "easeOut" }}
            >
              <a href={ctaLink}>
                <Button
                  size="lg"
                  className="hover:scale-105 hover:rotate-1"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primary,
                    borderRadius: borderRadius.button,
                    boxShadow: shadows.xl,
                    transition: `all ${animations.durations.normal} ease-out`,
                  }}
                >
                  {ctaText}
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Features List */}
          {features && features.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: parseFloat(animations.durations.normal) * 2, delay: 0.6, ease: "easeOut" }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: borderRadius.card,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: parseFloat(animations.durations.normal) * 2,
                    delay: 0.6 + index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: colors.background,
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: colors.primary }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-white"
                    style={{
                      fontSize: typography.body.size,
                      lineHeight: typography.body.lineHeight,
                    }}
                  >
                    {feature}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
