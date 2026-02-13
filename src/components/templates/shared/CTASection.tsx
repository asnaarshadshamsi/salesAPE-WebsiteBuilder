"use client";

import { ArrowRight, PhoneCall, Calendar, MessageSquare, Mail } from "lucide-react";

/* ==================== CTA SECTIONS ==================== */

interface CTAButtonProps {
  href: string;
  text: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  external?: boolean;
  className?: string;
}

export function CTAButton({
  href,
  text,
  icon,
  variant = "primary",
  external = false,
  className = "",
}: CTAButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all touch-manipulation min-h-[48px] sm:min-h-[56px]";
  
  const variantClasses = {
    primary: "bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 shadow-lg hover:shadow-xl",
    outline: "border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white",
  };

  return (
    <a
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {icon}
      <span>{text}</span>
    </a>
  );
}

interface SimpleCTAProps {
  headline: string;
  subheadline?: string;
  primaryButton: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryButton?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  backgroundColor?: string;
  textColor?: string;
}

export function SimpleCTA({
  headline,
  subheadline,
  primaryButton,
  secondaryButton,
  backgroundColor = "#ec4899",
  textColor = "#ffffff",
}: SimpleCTAProps) {
  return (
    <section
      id="cta"
      className="py-16 md:py-24 px-4"
      style={{ backgroundColor }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
          style={{ color: textColor }}
        >
          {headline}
        </h2>
        {subheadline && (
          <p
            className="text-lg sm:text-xl mb-8 md:mb-12 opacity-90"
            style={{ color: textColor }}
          >
            {subheadline}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton
            href={primaryButton.href}
            text={primaryButton.text}
            icon={primaryButton.icon}
            variant="secondary"
          />
          {secondaryButton && (
            <CTAButton
              href={secondaryButton.href}
              text={secondaryButton.text}
              icon={secondaryButton.icon}
              variant="outline"
              className="!border-white !text-white hover:!bg-white/10"
            />
          )}
        </div>
      </div>
    </section>
  );
}

interface ContactCTAProps {
  headline: string;
  subheadline?: string;
  phone?: string;
  email?: string;
  calendlyUrl?: string;
  primaryColor?: string;
}

export function ContactCTA({
  headline,
  subheadline,
  phone,
  email,
  calendlyUrl,
  primaryColor = "#ec4899",
}: ContactCTAProps) {
  return (
    <section id="contact-cta" className="py-16 md:py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 touch-manipulation"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <PhoneCall className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
              <p className="text-gray-600 text-sm">{phone}</p>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 touch-manipulation"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
              <p className="text-gray-600 text-sm truncate max-w-full">{email}</p>
            </a>
          )}
          {calendlyUrl && (
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 touch-manipulation"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Book a Meeting</h3>
              <p className="text-gray-600 text-sm">Schedule a call</p>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ==================== ABOUT SECTIONS ==================== */

interface AboutSectionProps {
  title?: string;
  content: string;
  image?: string | null;
  imagePosition?: "left" | "right";
  stats?: Array<{
    value: string;
    label: string;
  }>;
  features?: string[];
  primaryColor?: string;
}

export function AboutSection({
  title = "About Us",
  content,
  image,
  imagePosition = "right",
  stats,
  features,
  primaryColor = "#ec4899",
}: AboutSectionProps) {
  const hasImage = image !== null && image !== undefined;
  
  return (
    <section id="about" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 ${hasImage ? 'lg:grid-cols-2' : ''} gap-12 lg:gap-16 items-center`}>
          {/* Image - Mobile: always on top, Desktop: depends on imagePosition */}
          {hasImage && (
            <div className={`${imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'} order-1`}>
              <img
                src={image}
                alt={title}
                className="w-full h-auto rounded-2xl shadow-2xl"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div className={`${hasImage ? (imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1') : ''} order-2`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 mb-8">
              {content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div
                      className="text-3xl md:text-4xl font-bold mb-1"
                      style={{ color: primaryColor }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Features */}
            {features && features.length > 0 && (
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
