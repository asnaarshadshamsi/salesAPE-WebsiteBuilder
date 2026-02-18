/**
 * Booking/Appointment Section
 * Displays a call-to-action for booking appointments via Calendly or contact
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, Phone, Mail } from "lucide-react";
import { DesignSystem } from "@/services/design-system-resolver.service";

export interface BookingSectionProps {
  title: string;
  subtitle?: string;
  calendlyUrl?: string;
  phone?: string;
  email?: string;
  businessType?: string;
  designSystem: DesignSystem;
}

export function BookingSection({
  title,
  subtitle,
  calendlyUrl,
  phone,
  email,
  businessType = "service",
  designSystem,
}: BookingSectionProps) {
  const { typography, spacing, colors, animations, borderRadius, shadows } = designSystem;

  const handleBookingClick = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, "_blank", "width=800,height=800");
    }
  };

  return (
    <section
      id="booking"
      style={{
        backgroundColor: colors.muted,
        paddingTop: spacing.section,
        paddingBottom: spacing.section,
      }}
    >
      <div className="container mx-auto px-4" style={{ maxWidth: spacing.container }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: parseFloat(animations.durations.normal) * 2 }}
        >
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center mb-6"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: colors.primary,
              borderRadius: "50%",
              color: colors.background,
            }}
          >
            <Calendar className="w-10 h-10" />
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: typography.h2.size,
              lineHeight: typography.h2.lineHeight,
              fontWeight: typography.h2.weight,
              color: colors.foreground,
              marginBottom: spacing.md,
            }}
          >
            {title}
          </h2>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="mx-auto mb-8"
              style={{
                fontSize: typography.body.size,
                lineHeight: typography.body.lineHeight,
                color: colors.mutedForeground,
                maxWidth: "600px",
                marginBottom: spacing.lg,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2">
              <Clock
                className="w-5 h-5"
                style={{ color: colors.primary }}
              />
              <span style={{ fontSize: typography.body.size, color: colors.foreground }}>
                Quick & Easy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar
                className="w-5 h-5"
                style={{ color: colors.primary }}
              />
              <span style={{ fontSize: typography.body.size, color: colors.foreground }}>
                Choose Your Time
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone
                className="w-5 h-5"
                style={{ color: colors.primary }}
              />
              <span style={{ fontSize: typography.body.size, color: colors.foreground }}>
                Instant Confirmation
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {calendlyUrl && (
              <Button
                onClick={handleBookingClick}
                className="px-8 py-6 text-lg font-semibold hover:scale-105"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: borderRadius.button,
                  transition: `all ${animations.durations.normal} ${animations.easings.easeOut}`,
                  boxShadow: shadows.button,
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
            )}

            {/* Alternative contact options */}
            <div className="flex gap-3">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 hover:scale-105"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    borderRadius: borderRadius.button,
                    transition: `all ${animations.durations.normal} ${animations.easings.easeOut}`,
                    border: `1px solid ${colors.border}`,
                    textDecoration: "none",
                  }}
                >
                  <Phone className="w-4 h-4" />
                  Call Us
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 hover:scale-105"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    borderRadius: borderRadius.button,
                    transition: `all ${animations.durations.normal} ${animations.easings.easeOut}`,
                    border: `1px solid ${colors.border}`,
                    textDecoration: "none",
                  }}
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {calendlyUrl && (
            <p
              className="mt-6"
              style={{
                fontSize: typography.small.size,
                color: colors.mutedForeground,
              }}
            >
              Select a time that works best for you. We'll send a confirmation right away.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
