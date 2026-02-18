/**
 * Hero with Background Image
 * Full-screen hero with background image and overlay
 * Best for: Luxury, Bold brands
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DesignSystem } from "@/services/design-system-resolver.service";

export interface HeroBackgroundImageProps {
  headline: string;
  subheadline?: string;
  ctaText: string;
  ctaLink?: string;
  backgroundImage: string;
  designSystem: DesignSystem;
  overlayOpacity?: number;
}

export function HeroBackgroundImage({
  headline,
  subheadline,
  ctaText,
  ctaLink = "#",
  backgroundImage,
  designSystem,
  overlayOpacity = 0.5,
}: HeroBackgroundImageProps) {
  const { typography, spacing, colors, animations, borderRadius} = designSystem;
  const dur = parseFloat(animations.durations.normal);


  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 container mx-auto px-4 text-center max-w-5xl"
        style={{ paddingTop: spacing['2xl'], paddingBottom: spacing['2xl'], maxWidth: spacing.container }}
      >
        <motion.h1
          className="text-white mb-6"
          style={{
            fontSize: typography.h1.size,
            lineHeight: typography.h1.lineHeight,
            fontWeight: typography.h1.weight,
            letterSpacing: typography.h1.letterSpacing,
            marginBottom: spacing.lg,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: 0.2, ease: "easeOut" }}
        >
          {headline}
        </motion.h1>

        {subheadline && (
          <motion.p
            className="text-white/90 mx-auto"
            style={{
              fontSize: typography.body.size,
              lineHeight: typography.body.lineHeight,
              marginBottom: spacing.xl,
              maxWidth: '48rem',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: 0.4, ease: "easeOut" }}
          >
            {subheadline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: 0.6, ease: "easeOut" }}
        >
          <a href={ctaLink}>
            <Button
              size="lg"
              className="hover:scale-105"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
                borderRadius: borderRadius.button,
                transition: `all ${animations.durations.normal} ${animations.easings.easeInOut}`,
              }}
            >
              {ctaText}
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <svg
          className="w-6 h-6 text-white opacity-70"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </section>
  );
}
