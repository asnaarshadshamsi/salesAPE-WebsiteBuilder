"use client";

import { CheckCircle, Star, ArrowRight } from "lucide-react";

interface Service {
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ServicesGridProps {
  title?: string;
  subtitle?: string;
  services: Service[];
  primaryColor?: string;
  variant?: "grid" | "list" | "cards";
}

export function ServicesGrid({
  title = "Our Services",
  subtitle,
  services,
  primaryColor = "#ec4899",
  variant = "cards",
}: ServicesGridProps) {
  if (services.length === 0) return null;

  if (variant === "list") {
    return (
      <section id="services" className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <CheckCircle
                  className="w-6 h-6 flex-shrink-0 mt-1"
                  style={{ color: primaryColor }}
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-gray-600">{service.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-16 md:py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {service.icon && (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  {service.icon}
                </div>
              )}
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                {service.name}
              </h3>
              {service.description && (
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
  avatar?: string;
  role?: string;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  primaryColor?: string;
}

export function TestimonialsSection({
  title = "What Our Clients Say",
  subtitle,
  testimonials,
  primaryColor = "#ec4899",
}: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 md:p-8 rounded-2xl hover:shadow-lg transition-shadow"
            >
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating!
                          ? "fill-current"
                          : "fill-gray-300"
                      }`}
                      style={{ color: i < testimonial.rating! ? primaryColor : undefined }}
                    />
                  ))}
                </div>
              )}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  {testimonial.role && (
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface AboutSectionProps {
  title?: string;
  content: string;
  image?: string | null;
  features?: string[];
  primaryColor?: string;
}

export function AboutSection({
  title = "About Us",
  content,
  image,
  features,
  primaryColor = "#ec4899",
}: AboutSectionProps) {
  return (
    <section id="about" className="py-16 md:py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {content}
            </p>
            {features && features.length > 0 && (
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle
                      className="w-6 h-6 flex-shrink-0 mt-0.5"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {image && (
            <div className="order-first md:order-last">
              <img
                src={image}
                alt="About"
                className="w-full h-auto rounded-2xl shadow-xl"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface CTABlockProps {
  title: string;
  subtitle?: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
}

export function CTABlock({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  primaryColor = "#ec4899",
  secondaryColor = "#db2777",
}: CTABlockProps) {
  return (
    <section
      className="py-16 md:py-24 px-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={primaryButton.href}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[56px]"
          >
            {primaryButton.text}
            <ArrowRight className="w-5 h-5" />
          </a>
          {secondaryButton && (
            <a
              href={secondaryButton.href}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border border-white/20 min-h-[56px]"
            >
              {secondaryButton.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
