import { notFound } from "next/navigation";
import { siteRepository } from "@/db/repositories";
import { ProfessionalSiteTemplate } from "@/components/ProfessionalSiteTemplate";
import LandingTemplate from "@/components/template/components/landing/LandingTemplate";
import EcommerceTemplate from "@/components/template/components/EcommerceTemplate";
import FoodTemplate from "@/components/template/components/FoodTemplate";
import type { BusinessData } from "@/components/template/types/landing";

// Business types that use the dedicated Ecommerce template
const ECOMMERCE_TYPES = new Set([
  'ecommerce','perfume','jewelry','flowershop','beauty','spa',
  'barbershop','photography','petcare','events',
]);

// Business types that use the dedicated Food / Restaurant template
const FOOD_TYPES = new Set([
  'restaurant','cafe','bakery','catering',
]);

function pickScraperTemplate(businessType: string): 'ecommerce' | 'food' | 'landing' {
  if (ECOMMERCE_TYPES.has(businessType)) return 'ecommerce';
  if (FOOD_TYPES.has(businessType)) return 'food';
  return 'landing';
}
import { WebsiteLaunchCelebration } from "@/components/WebsiteLaunchCelebration";
import { selectVariant } from "@/lib/ai";
import { trackPageView } from "@/actions/leads";
import { BusinessStructuredData, WebsiteStructuredData } from "@/components/SEO";
import type { Metadata } from "next";

interface SitePageProps {
  params: Promise<{ slug: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSiteBySlug(slug: string): Promise<any> {
  const site = await siteRepository.findBySlug(slug);
  return site;
}

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site) {
    return {
      title: "Site Not Found",
    };
  }

  const business = site.business;

  // Use AI-generated meta description if available, otherwise fall back
  const metaDescription = site.metaDescription || site.aboutText || business.description || "";

  return {
    title: `${business.name} - ${site.headline}`,
    description: metaDescription,
    keywords: [
      business.name,
      business.city || "",
      ...(business.services ? JSON.parse(business.services as string) : []),
    ].filter(Boolean),
    openGraph: {
      title: business.name,
      description: metaDescription,
      type: "website",
      images: business.heroImage ? [business.heroImage] : undefined,
    },
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site || !site.isPublished) {
    notFound();
  }

  // Select A/B variant for this visitor
  const variant = selectVariant();

  // Track page view (don't await to not block rendering)
  trackPageView(site.id, variant);

  const business = site.business;
  const services: string[] = business.services ? JSON.parse(business.services as string) : [];
  const features: string[] = site.features ? JSON.parse(site.features as string) : [];
  const testimonials: { name: string; text: string; rating?: number }[] = site.testimonials ? JSON.parse(site.testimonials as string) : [];
  const socialLinks = business.socialLinks ? JSON.parse(business.socialLinks as string) : null;
  const openingHours = business.openingHours ? JSON.parse(business.openingHours as string) : null;
  const galleryImages: string[] = business.galleryImages ? JSON.parse(business.galleryImages as string) : [];
  
  // Parse AI-enhanced content if available
  const valuePropositions: string[] = site.valuePropositions ? JSON.parse(site.valuePropositions as string) : [];
  const serviceDescriptions: { name: string; description: string }[] = site.serviceDescriptions ? JSON.parse(site.serviceDescriptions as string) : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (business.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice,
    image: p.image,
    category: p.category,
    featured: p.featured,
  }));

  // Determine which template to render:
  //  • URL-scraper sites  → LandingTemplate  (completely different, AI-composed layout)
  //  • AI chatbot sites   → ProfessionalSiteTemplate (keep untouched)
  const isScraperSite = !!(business.sourceUrl && business.sourceUrl.trim());
  const rawTemplateData: string | null = site.templateData ?? null;

  if (isScraperSite && rawTemplateData) {
    let landing: BusinessData | null = null;
    try {
      landing = JSON.parse(rawTemplateData) as BusinessData;
    } catch {
      console.error('[SitePage] Failed to parse templateData JSON for slug:', slug);
    }

    if (landing) {
      const templateKind = pickScraperTemplate(business.businessType);
      const TemplateComponent =
        templateKind === 'ecommerce' ? EcommerceTemplate :
        templateKind === 'food'      ? FoodTemplate :
                                       LandingTemplate;

      return (
        <>
          <WebsiteLaunchCelebration
            businessName={business.name}
            siteSlug={site.slug}
            primaryColor={business.primaryColor}
          />
          <BusinessStructuredData
            business={{
              name: business.name,
              description: business.description,
              logo: business.logo,
              phone: business.phone,
              email: business.email,
              address: business.address,
              city: business.city,
              businessType: business.businessType,
            }}
            site={{ headline: site.headline, slug: site.slug }}
            socialLinks={socialLinks}
          />
          <WebsiteStructuredData
            business={{ name: business.name }}
            site={{ headline: site.headline, slug: site.slug }}
          />
          {templateKind === 'ecommerce' ? (
            <EcommerceTemplate data={landing} siteId={site.id} />
          ) : templateKind === 'food' ? (
            <FoodTemplate data={landing} siteId={site.id} />
          ) : (
            <LandingTemplate data={landing} />
          )}
        </>
      );
    }
  }

  return (
    <>
      {/* Launch Celebration Modal (shows on first visit with ?new=true) */}
      <WebsiteLaunchCelebration
        businessName={business.name}
        siteSlug={site.slug}
        primaryColor={business.primaryColor}
      />
      
      {/* Structured Data for SEO */}
      <BusinessStructuredData
        business={{
          name: business.name,
          description: business.description,
          logo: business.logo,
          phone: business.phone,
          email: business.email,
          address: business.address,
          city: business.city,
          businessType: business.businessType,
        }}
        site={{
          headline: site.headline,
          slug: site.slug,
        }}
        socialLinks={socialLinks}
      />
      <WebsiteStructuredData
        business={{ name: business.name }}
        site={{ headline: site.headline, slug: site.slug }}
      />
      
      {/* Professional Site Template — modern, conversion-focused design */}
      <ProfessionalSiteTemplate
        site={{
          id: site.id,
          slug: site.slug,
          headline: variant === "A" ? site.headline : (site.subheadline || site.headline),
          subheadline: site.subheadline || null,
          aboutText: site.aboutText || null,
          ctaText: site.ctaText,
          features,
          testimonials,
          variant,
          tagline: site.tagline || null,
          valuePropositions,
          serviceDescriptions,
        }}
        business={{
          name: business.name,
          description: business.description || null,
          logo: business.logo,
          heroImage: business.heroImage,
          galleryImages,
          primaryColor: business.primaryColor,
          secondaryColor: business.secondaryColor,
          businessType: business.businessType,
          services,
          phone: business.phone,
          email: business.email,
          address: business.address,
          city: business.city,
          calendlyUrl: business.calendlyUrl,
          socialLinks,
          openingHours,
        }}
        products={products}
      />
    </>
  );
}
