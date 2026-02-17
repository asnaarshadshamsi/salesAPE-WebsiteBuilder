"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";

interface TestimonialsSectionProps {
  data: NonNullable<BusinessData["testimonials"]>;
}

const TestimonialsSection = ({ data }: TestimonialsSectionProps) => {
  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {data.title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-16"
          >
            {data.title}
          </motion.h2>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {data.items.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <p className="text-foreground leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm text-card-foreground">
                    {testimonial.author}
                  </div>
                  {testimonial.role && (
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
