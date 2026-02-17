"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";

interface CtaSectionProps {
  data: NonNullable<BusinessData["cta"]>;
}

const CtaSection = ({ data }: CtaSectionProps) => {
  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl bg-gradient-dark p-12 md:p-20 text-center overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-warm rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-warm rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {data.title}
            </h2>
            {data.description && (
              <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-8">
                {data.description}
              </p>
            )}
            <a
              href={data.buttonHref}
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-warm text-primary-foreground font-medium text-base shadow-elevated hover:opacity-90 transition-all hover:scale-[1.02]"
            >
              {data.buttonLabel}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
