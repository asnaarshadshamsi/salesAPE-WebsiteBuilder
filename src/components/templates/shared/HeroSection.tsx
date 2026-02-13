"use client";

import { Phone, Calendar, MessageCircle, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  business: {
    name: string;
    logo: string | null;
    heroImage: string | null;
    primaryColor: string;
    secondaryColor: string;
    phone: string | null;
    calendlyUrl: string | null;
  };
  site: {
    headline: string;
    subheadline: string | null;
  };
  badges?: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  ctaPrimary?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  ctaSecondary?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  variant?: "default" | "split" | "centered" | "minimal";
}

export function HeroSection({
  business,
  site,
  badges,
  stats,
  ctaPrimary,
  ctaSecondary,
  variant = "default",
}: HeroSectionProps) {
  const hasHeroImage = business.heroImage;
  
  const defaultCtaPrimary = ctaPrimary || {
    text: "Get Started",
    href: "#contact",
    icon: <MessageCircle className="w-5 h-5" />,
  };

  const defaultCtaSecondary = ctaSecondary || (
    business.calendlyUrl
      ? {
          text: "Book a Call",
          href: business.calendlyUrl,
          icon: <Calendar className="w-5 h-5" />,
        }
      : business.phone
      ? {
          text: "Call Now",
          href: `tel:${business.phone}`,
          icon: <Phone className="w-5 h-5" />,
        }
      : null
  );

  // Responsive background styling
  const backgroundStyle = hasHeroImage
    ? {
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%), url(${business.heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: `linear-gradient(135deg, ${business.primaryColor} 0%, ${business.secondaryColor} 100%)`,
      };

  if (variant === "centered") {
    return (
      <section
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {business.logo && (
            <div className="flex justify-center mb-8">
              <img
                src={business.logo}
                alt={business.name}
                className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-2xl bg-white/10 backdrop-blur-sm p-2"
                loading="lazy"
              />
            </div>
          )}

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm"
                >
                  {badge.icon}
                  {badge.text}
                </div>
              ))}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {site.headline}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {site.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={defaultCtaPrimary.href}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[56px]"
            >
              {defaultCtaPrimary.icon}
              {defaultCtaPrimary.text}
            </a>
            {defaultCtaSecondary && (
              <a
                href={defaultCtaSecondary.href}
                target={business.calendlyUrl ? "_blank" : undefined}
                rel={business.calendlyUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border border-white/20 min-h-[56px]"
              >
                {defaultCtaSecondary.icon}
                {defaultCtaSecondary.text}
              </a>
            )}
          </div>

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default variant - side content
  return (
    <section
      className="relative min-h-[90vh] md:min-h-screen flex items-center px-4 py-20 md:py-32"
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6 md:mb-8">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm"
                >
                  {badge.icon}
                  {badge.text}
                </div>
              ))}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {site.headline}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-12 leading-relaxed">
            {site.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href={defaultCtaPrimary.href}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[56px]"
            >
              {defaultCtaPrimary.icon}
              {defaultCtaPrimary.text}
            </a>
            {defaultCtaSecondary && (
              <a
                href={defaultCtaSecondary.href}
                target={business.calendlyUrl ? "_blank" : undefined}
                rel={business.calendlyUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border border-white/20 min-h-[56px]"
              >
                {defaultCtaSecondary.icon}
                {defaultCtaSecondary.text}
              </a>
            )}
          </div>

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
