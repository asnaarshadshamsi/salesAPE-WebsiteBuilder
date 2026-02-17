/**
 * Template Field Generator Service
 * Generates ALL fields required by the new unified LandingTemplate
 * Outputs BusinessData (from @/components/template/types/landing)
 */

import { BusinessData } from '@/components/template/types/landing';
import { BusinessType, Testimonial } from '@/types';

interface MergedData {
  name: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  galleryImages: string[];
  primaryColor: string;
  secondaryColor: string;
  businessType: BusinessType;
  industry?: string;
  category?: string;
  services: string[];
  features: string[];
  products: Array<{
    name: string;
    description?: string;
    price?: number;
    salePrice?: number;
    image?: string;
    category?: string;
  }>;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  socialLinks: any;
  calendlyUrl?: string;
  openingHours?: Record<string, string>;
  aboutContent?: string;
  testimonials: Testimonial[];
  targetAudience?: string;
  tone?: string;
  uniqueSellingPoints?: string[];
  keyMessages?: string[];
  callToAction?: string;
  confidence: 'high' | 'medium' | 'low';
}

export class TemplateFieldGeneratorService {
  /**
   * Generate complete landing page data from merged data
   */
  generate(merged: MergedData): BusinessData {
    console.log('[TemplateGenerator] Generating BusinessData for LandingTemplate');

    const businessType = merged.businessType;
    const config = this.getBusinessTypeConfig(businessType);

    return {
      brand: {
        name: merged.name,
        logo: merged.logo || undefined,
        tagline: merged.keyMessages?.[0] || merged.category || merged.industry || config.heroTag,
      },

      hero: this.generateHero(merged, config),

      nav: this.generateNav(merged, config),

      about: this.generateAbout(merged, config),

      features: this.generateFeatures(merged, config),

      stats: this.generateStats(merged),

      services: this.generateServices(merged, config),

      testimonials: this.generateTestimonials(merged, config),

      cta: this.generateCta(merged, config),

      footer: this.generateFooter(merged),
    };
  }

  private getBusinessTypeConfig(type: BusinessType) {
    const configs: Record<string, {
      heroTag: string;
      primaryCTA: string;
      secondaryCTA: string;
      servicesTitle: string;
      featuresTitle: string;
      aboutTitle: string;
      contactTitle: string;
      testimonialTitle: string;
    }> = {
      agency: {
        heroTag: 'Creative Agency',
        primaryCTA: 'View Our Work',
        secondaryCTA: 'Get Started',
        servicesTitle: 'What We Do',
        featuresTitle: 'Why Choose Us',
        aboutTitle: 'Who We Are',
        contactTitle: "Let's Create Together",
        testimonialTitle: 'Client Success Stories',
      },
      ecommerce: {
        heroTag: 'Shop Online',
        primaryCTA: 'Shop Now',
        secondaryCTA: 'Browse Collection',
        servicesTitle: 'Why Shop With Us',
        featuresTitle: 'Our Advantages',
        aboutTitle: 'Our Story',
        contactTitle: 'Get In Touch',
        testimonialTitle: 'Customer Reviews',
      },
      restaurant: {
        heroTag: 'Fine Dining',
        primaryCTA: 'Reserve a Table',
        secondaryCTA: 'View Menu',
        servicesTitle: 'Our Services',
        featuresTitle: 'Why Dine With Us',
        aboutTitle: 'Our Story',
        contactTitle: 'Visit Us',
        testimonialTitle: 'What Our Guests Say',
      },
      fitness: {
        heroTag: 'Transform Your Life',
        primaryCTA: 'Start Training',
        secondaryCTA: 'View Plans',
        servicesTitle: 'Training Programs',
        featuresTitle: 'Why Train With Us',
        aboutTitle: 'About Us',
        contactTitle: 'Get Started Today',
        testimonialTitle: 'Member Testimonials',
      },
      healthcare: {
        heroTag: 'Your Health, Our Priority',
        primaryCTA: 'Book Appointment',
        secondaryCTA: 'Learn More',
        servicesTitle: 'Our Services',
        featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Our Practice',
        contactTitle: 'Contact Us',
        testimonialTitle: 'Patient Testimonials',
      },
      beauty: {
        heroTag: 'Enhance Your Beauty',
        primaryCTA: 'Book Now',
        secondaryCTA: 'View Services',
        servicesTitle: 'Our Services',
        featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Us',
        contactTitle: 'Book Appointment',
        testimonialTitle: 'Client Reviews',
      },
      service: {
        heroTag: 'Professional Services',
        primaryCTA: 'Get Started',
        secondaryCTA: 'Learn More',
        servicesTitle: 'What We Offer',
        featuresTitle: 'Why Choose Us',
        aboutTitle: 'Who We Are',
        contactTitle: 'Contact Us',
        testimonialTitle: 'Client Testimonials',
      },
      portfolio: {
        heroTag: 'Creative Professional',
        primaryCTA: 'View Portfolio',
        secondaryCTA: 'Get In Touch',
        servicesTitle: 'Services',
        featuresTitle: 'What Sets Me Apart',
        aboutTitle: 'About Me',
        contactTitle: 'Work Together',
        testimonialTitle: 'Client Feedback',
      },
      realestate: {
        heroTag: 'Find Your Dream Home',
        primaryCTA: 'Browse Properties',
        secondaryCTA: 'Schedule Tour',
        servicesTitle: 'Our Services',
        featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Us',
        contactTitle: 'Contact Agent',
        testimonialTitle: 'Client Reviews',
      },
      education: {
        heroTag: 'Learn & Grow',
        primaryCTA: 'Enroll Now',
        secondaryCTA: 'View Courses',
        servicesTitle: 'What We Offer',
        featuresTitle: 'Why Learn With Us',
        aboutTitle: 'About Us',
        contactTitle: 'Get Started',
        testimonialTitle: 'Student Success',
      },
      startup: {
        heroTag: 'Innovation in Action',
        primaryCTA: 'Get Started',
        secondaryCTA: 'Learn More',
        servicesTitle: 'Features',
        featuresTitle: 'What Sets Us Apart',
        aboutTitle: 'Our Mission',
        contactTitle: 'Get In Touch',
        testimonialTitle: 'What Users Say',
      },
      other: {
        heroTag: 'Welcome',
        primaryCTA: 'Get Started',
        secondaryCTA: 'Learn More',
        servicesTitle: 'What We Offer',
        featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Us',
        contactTitle: 'Contact Us',
        testimonialTitle: 'Testimonials',
      },
    };

    return configs[type] || configs.other;
  }

  private generateHero(merged: MergedData, config: any): BusinessData['hero'] {
    const headline =
      merged.keyMessages?.[0] ||
      `Welcome to ${merged.name}`;

    const subheadline =
      merged.description ||
      (merged.uniqueSellingPoints && merged.uniqueSellingPoints.join(' · ')) ||
      `Professional ${merged.businessType} services`;

    return {
      headline,
      subheadline,
      cta: {
        label: merged.callToAction || config.primaryCTA,
        href: '#contact',
      },
      secondaryCta: {
        label: config.secondaryCTA,
        href: '#about',
      },
      image: merged.heroImage || undefined,
    };
  }

  private generateNav(merged: MergedData, config: any): BusinessData['nav'] {
    const links: { label: string; href: string }[] = [];

    if (merged.aboutContent || merged.description) links.push({ label: 'About', href: '#about' });
    if (merged.features.length > 0) links.push({ label: 'Features', href: '#features' });
    if (merged.services.length > 0) links.push({ label: 'Services', href: '#services' });
    if (merged.testimonials.length > 0) links.push({ label: 'Testimonials', href: '#testimonials' });
    links.push({ label: 'Contact', href: '#contact' });

    return { links };
  }

  private generateAbout(merged: MergedData, config: any): BusinessData['about'] {
    const text =
      merged.aboutContent ||
      merged.description ||
      `${merged.name} is dedicated to providing exceptional ${merged.businessType} services.`;

    return {
      title: config.aboutTitle,
      description: text,
    };
  }

  private generateFeatures(merged: MergedData, config: any): BusinessData['features'] | undefined {
    if (merged.features.length === 0) return undefined;

    const icons = ['✦', '◈', '▲', '●', '◆', '■'];
    const items = merged.features.slice(0, 6).map((f, i) => ({
      icon: icons[i % icons.length],
      title: f,
      description: merged.uniqueSellingPoints?.[i] || `Professional ${f.toLowerCase()} services`,
    }));

    return {
      title: config.featuresTitle,
      subtitle: merged.targetAudience
        ? `Tailored for ${merged.targetAudience}`
        : undefined,
      items,
    };
  }

  private generateStats(merged: MergedData): BusinessData['stats'] | undefined {
    const items: { value: string; label: string }[] = [];

    if (merged.products.length > 0) items.push({ value: `${merged.products.length}+`, label: 'Projects' });
    if (merged.testimonials.length > 0) items.push({ value: `${merged.testimonials.length * 10}+`, label: 'Happy Clients' });
    items.push({ value: '100%', label: 'Satisfaction' });
    items.push({ value: '24/7', label: 'Support' });

    return items.length > 0 ? { items } : undefined;
  }

  private generateServices(merged: MergedData, config: any): BusinessData['services'] | undefined {
    const servicesList = merged.services.length > 0 ? merged.services : [];
    if (servicesList.length === 0) return undefined;

    const items = servicesList.slice(0, 6).map((s) => ({
      title: s,
      description: `Professional ${s.toLowerCase()} solutions tailored to your needs.`,
    }));

    return {
      title: config.servicesTitle,
      items,
    };
  }

  private generateTestimonials(merged: MergedData, config: any): BusinessData['testimonials'] | undefined {
    if (merged.testimonials.length === 0) return undefined;

    const items = merged.testimonials.map((t) => ({
      quote: t.text,
      author: t.name,
      role: undefined as string | undefined,
    }));

    return {
      title: config.testimonialTitle,
      items,
    };
  }

  private generateCta(merged: MergedData, config: any): BusinessData['cta'] {
    return {
      title: config.contactTitle,
      description: `Get in touch with ${merged.name} to discuss how we can help.`,
      buttonLabel: merged.callToAction || config.primaryCTA,
      buttonHref: '#contact',
    };
  }

  private generateFooter(merged: MergedData): BusinessData['footer'] {
    const socials = merged.socialLinks
      ? Object.entries(merged.socialLinks)
          .filter(([, href]) => !!href)
          .map(([platform, href]) => ({ platform, href: href as string }))
      : undefined;

    return {
      description: merged.description || undefined,
      links: [
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' },
      ],
      socials: socials && socials.length > 0 ? socials : undefined,
      copyright: `© ${new Date().getFullYear()} ${merged.name}. All rights reserved.`,
    };
  }
}

export const templateFieldGeneratorService = new TemplateFieldGeneratorService();
