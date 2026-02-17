export interface BusinessData {
  brand: {
    name: string;
    logo?: string;
    tagline?: string;
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
  cta?: {
    title: string;
    description?: string;
    buttonLabel: string;
    buttonHref: string;
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
