"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";

interface ServicesSectionProps {
  data: NonNullable<BusinessData["services"]>;
  businessType?: string;
}

const ServicesSection = ({ data, businessType }: ServicesSectionProps) => {
  // For e-commerce, never show images - just clean boxes
  const showImages = businessType !== 'ecommerce' && data.items.some((s) => !!s.image);

  return (
    <section id="services" className="py-24 md:py-32 bg-muted/40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {data.title && (
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {data.title}
            </h2>
          )}
          {data.subtitle && (
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </motion.div>

        <div
          className={`grid gap-8 ${
            showImages
              ? "md:grid-cols-2 lg:grid-cols-3"
              : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {data.items.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-xl bg-card border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {showImages && service.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-8">
                <h3 className="font-display text-xl font-semibold text-card-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
                {service.price && (
                  <div className="mt-4 text-lg font-semibold text-gradient">
                    {service.price}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
