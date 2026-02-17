"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";

interface AboutSectionProps {
  data: NonNullable<BusinessData["about"]>;
}

const AboutSection = ({ data }: AboutSectionProps) => {
  const hasImage = !!data.image;

  return (
    <section id="about" className="py-24 md:py-32 bg-muted/40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={
            hasImage
              ? "grid md:grid-cols-2 gap-12 items-center"
              : "max-w-3xl mx-auto text-center"
          }
        >
          <div>
            {data.title && (
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                {data.title}
              </h2>
            )}
            <p className="text-muted-foreground text-lg leading-relaxed">
              {data.description}
            </p>
          </div>
          {hasImage && (
            <div className="rounded-xl overflow-hidden shadow-soft">
              <img
                src={data.image}
                alt={data.title || "About"}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
