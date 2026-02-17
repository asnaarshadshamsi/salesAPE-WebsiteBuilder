"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";

interface FeaturesSectionProps {
  data: NonNullable<BusinessData["features"]>;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const FeaturesSection = ({ data }: FeaturesSectionProps) => {
  return (
    <section id="features" className="py-24 md:py-32">
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

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {data.items.map((feature, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group p-6 rounded-xl border border-border bg-card hover:shadow-soft transition-all duration-300"
            >
              {feature.icon && (
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-lg mb-4">
                  {feature.icon}
                </span>
              )}
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
