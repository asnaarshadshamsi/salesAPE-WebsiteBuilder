"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";

interface HeroSectionProps {
  data: BusinessData["hero"];
}

const HeroSection = ({ data }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div
        className={`relative max-w-7xl mx-auto px-6 py-24 md:py-32 ${
          data.image
            ? "grid md:grid-cols-2 gap-12 items-center"
            : "text-center"
        }`}
      >
        <div className={data.image ? "" : "max-w-4xl mx-auto"}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            {data.headline}
          </motion.h1>

          {data.subheadline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className={`mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed ${
                data.image ? "" : "max-w-2xl mx-auto"
              }`}
            >
              {data.subheadline}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className={`mt-10 flex flex-col sm:flex-row gap-4 ${
              data.image ? "items-start" : "items-center justify-center"
            }`}
          >
            {data.cta && (
              <a
                href={data.cta.href}
                className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-warm text-primary-foreground font-medium text-base shadow-elevated hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                {data.cta.label}
              </a>
            )}
            {data.secondaryCta && (
              <a
                href={data.secondaryCta.href}
                className="inline-flex items-center px-8 py-3.5 rounded-lg border border-border text-foreground font-medium text-base hover:bg-muted transition-all"
              >
                {data.secondaryCta.label}
              </a>
            )}
          </motion.div>
        </div>

        {data.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="rounded-xl overflow-hidden shadow-elevated"
          >
            <img
              src={data.image}
              alt="Hero"
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
