"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";

interface StatsSectionProps {
  data: NonNullable<BusinessData["stats"]>;
}

const StatsSection = ({ data }: StatsSectionProps) => {
  return (
    <section className="py-20 md:py-28 bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {data.items.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">
                {stat.value}
              </div>
              <div className="mt-2 text-sm md:text-base text-primary-foreground/70">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
