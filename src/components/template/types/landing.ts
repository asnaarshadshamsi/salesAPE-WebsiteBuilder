export interface BusinessData {
  brand: {
    name: string;
    logo?: string;
    tagline?: string;
    businessType?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  hero: {
    headline: string;
    subheadline?: string;
    cta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    image?: string;
  };
  about?: {
    title?: string;
    description: string;
    image?: string;
  };
  features?: {
    title?: string;
    subtitle?: string;
    items: {
      icon?: string;
      title: string;
      description: string;
    }[];
  };
  stats?: {
    items: {
      value: string;
      label: string;
    }[];
  };
  testimonials?: {
    title?: string;
    items: {
      quote: string;
      author: string;
      role?: string;
      avatar?: string;
    }[];
  };
  services?: {
    title?: string;
    subtitle?: string;
    items: {
      title: string;
      description: string;
      image?: string;
      price?: string;
    }[];
  };
  products?: {
    title?: string;
    subtitle?: string;
    items: {
      name: string;
      description?: string;
      price?: number;
      salePrice?: number;
      image?: string;
      category?: string;
    }[];
  };
  cta?: {
    title: string;
    description?: string;
    buttonLabel: string;
    buttonHref: string;
  };
  galleryImages?: string[];
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    calendlyUrl?: string;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  /** AI-generated lead-capture form copy, contextualised to this specific business */
  leadForm?: {
    eyebrow?: string;
    heading?: string;
    subheading?: string;
    messagePlaceholder?: string;
    submitLabel?: string;
    successTitle?: string;
    successMessage?: string;
  };
  footer?: {
    description?: string;
    links?: { label: string; href: string }[];
    socials?: { platform: string; href: string }[];
    copyright?: string;
  };
  nav?: {
    links: { label: string; href: string }[];
  };
}
