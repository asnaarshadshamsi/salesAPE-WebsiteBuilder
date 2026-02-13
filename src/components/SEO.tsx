"use client";

/* ==================== SEO & STRUCTURED DATA COMPONENTS ==================== */

interface BusinessStructuredDataProps {
  business: {
    name: string;
    description?: string | null;
    logo?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    businessType: string;
  };
  site: {
    headline: string;
    slug: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  } | null;
}

// Generate JSON-LD structured data for SEO
export function BusinessStructuredData({ business, site, socialLinks }: BusinessStructuredDataProps) {
  // Map business types to Schema.org types
  const schemaTypeMap: Record<string, string> = {
    restaurant: "Restaurant",
    healthcare: "MedicalBusiness",
    fitness: "HealthAndBeautyBusiness",
    beauty: "BeautySalon",
    realestate: "RealEstateAgent",
    education: "EducationalOrganization",
    agency: "ProfessionalService",
    ecommerce: "Store",
    service: "LocalBusiness",
    portfolio: "ProfessionalService",
    startup: "Organization",
    other: "LocalBusiness",
  };

  const schemaType = schemaTypeMap[business.businessType] || "LocalBusiness";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: business.name,
    description: business.description || site.headline,
    url: `https://poweredbyape.ai/sites/${site.slug}`,
    ...(business.logo && { logo: business.logo, image: business.logo }),
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
    ...(business.address && business.city && {
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: business.city,
      },
    }),
    ...(socialLinks && {
      sameAs: [
        socialLinks.facebook,
        socialLinks.instagram,
        socialLinks.twitter,
        socialLinks.linkedin,
      ].filter(Boolean),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface WebsiteStructuredDataProps {
  business: {
    name: string;
  };
  site: {
    headline: string;
    slug: string;
  };
}

export function WebsiteStructuredData({ business, site }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${business.name} - ${site.headline}`,
    url: `https://poweredbyape.ai/sites/${site.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/* ==================== SEO META TAGS ==================== */

interface SEOMetaTagsProps {
  title: string;
  description: string;
  image?: string | null;
  url: string;
  keywords?: string[];
  author?: string;
  businessType?: string;
}

export function SEOMetaTags({
  title,
  description,
  image,
  url,
  keywords = [],
  author,
  businessType,
}: SEOMetaTagsProps) {
  return (
    <>
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}

      {/* Additional SEO */}
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      {author && <meta name="author" content={author} />}
      {businessType && <meta name="business:type" content={businessType} />}
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#ec4899" />
      
      {/* Prevent indexing of demo/test sites */}
      {url.includes('localhost') || url.includes('dev.') ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      )}
    </>
  );
}

/* ==================== PERFORMANCE HINTS ==================== */

export function PerformanceHints() {
  return (
    <>
      {/* DNS Prefetch for external resources */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Preconnect to important origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </>
  );
}

/* ==================== ACCESSIBILITY SKIP LINK ==================== */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-pink-500 focus:text-white focus:font-semibold"
    >
      Skip to main content
    </a>
  );
}

/* ==================== SEMANTIC HTML WRAPPER ==================== */

interface SemanticMainProps {
  children: React.ReactNode;
  className?: string;
}

export function SemanticMain({ children, className = "" }: SemanticMainProps) {
  return (
    <main id="main-content" className={className} role="main">
      {children}
    </main>
  );
}
