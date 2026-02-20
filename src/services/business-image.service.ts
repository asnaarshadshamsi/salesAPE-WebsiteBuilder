/**
 * Business Image Service
 * Fetches business-type-appropriate images from Unsplash
 */

import type { BusinessType } from '@/types/business';

// Curated Unsplash search queries per business type
const imageQueries: Record<BusinessType | 'default', { hero: string; gallery: string[] }> = {
  perfume: {
    hero: 'luxury perfume fragrance bokeh',
    gallery: ['perfume bottle luxury', 'fragrance ingredients flowers', 'luxury cosmetics', 'scent bottle gold', 'perfume shop interior', 'flowers essential oils', 'luxury packaging cosmetics', 'aromatherapy spa'],
  },
  restaurant: {
    hero: 'fine dining restaurant elegant',
    gallery: ['gourmet food plating', 'restaurant interior ambiance', 'chef cooking kitchen', 'wine sommelier dinner', 'fresh ingredients vegetables', 'dessert pastry art', 'candlelit dinner table', 'farm to table food'],
  },
  cafe: {
    hero: 'coffee shop cozy interior',
    gallery: ['latte art coffee cup', 'cafe interior wooden', 'barista espresso machine', 'pastry croissant breakfast', 'coffee beans roasted', 'cozy reading corner', 'cappuccino foam art', 'cafe outdoor seating'],
  },
  bakery: {
    hero: 'artisan bakery fresh bread',
    gallery: ['fresh bread loaves', 'pastry croissants bakery', 'cake decoration dessert', 'baker flour kitchen', 'bread baking oven', 'cupcakes frosting colorful', 'artisan sourdough', 'pastry display window'],
  },
  beauty: {
    hero: 'beauty salon elegant interior',
    gallery: ['makeup artist cosmetics', 'beauty products skincare', 'salon styling chair', 'manicure nail art', 'skincare glow face', 'luxury cosmetics flat lay', 'hair styling professional', 'beauty spa treatment'],
  },
  spa: {
    hero: 'luxury spa resort wellness',
    gallery: ['spa massage stones', 'candles aromatherapy relaxation', 'spa pool interior', 'facial treatment skincare', 'essential oils bamboo', 'spa towels flowers', 'meditation zen garden', 'hot tub jacuzzi luxury'],
  },
  fitness: {
    hero: 'modern gym fitness equipment',
    gallery: ['workout gym weights', 'personal training session', 'yoga class studio', 'running track athlete', 'crossfit exercise group', 'nutrition healthy food', 'swimming pool athlete', 'cycling spin class'],
  },
  gym: {
    hero: 'professional gym training facility',
    gallery: ['gym equipment weights', 'barbell powerlifting', 'muscle training athlete', 'cardio treadmill gym', 'boxing training ring', 'fitness class group', 'protein shakes nutrition', 'gym locker room'],
  },
  yoga: {
    hero: 'yoga studio serene peaceful',
    gallery: ['yoga pose meditation', 'yoga mat outdoor sunrise', 'mindfulness meditation group', 'yoga instructor teaching', 'chakra spiritual wellness', 'flexibility stretch yoga', 'yoga retreat nature', 'breathwork pranayama'],
  },
  flowershop: {
    hero: 'flower shop bouquet colorful',
    gallery: ['rose bouquet arrangement', 'flower market colorful', 'wedding florals white', 'sunflower arrangement', 'lilies elegant white', 'floral design studio', 'dried flowers decor', 'orchid exotic plant'],
  },
  jewelry: {
    hero: 'luxury jewelry diamonds elegant',
    gallery: ['diamond ring engagement', 'gold necklace luxury', 'jewelry display case', 'sapphire gemstone ring', 'pearl necklace elegant', 'bracelet silver gold', 'jewelry workshop crafts', 'watch luxury timepiece'],
  },
  photography: {
    hero: 'professional photography camera studio',
    gallery: ['portrait photography studio', 'wedding photography couple', 'landscape photography nature', 'product photography flatlay', 'camera equipment professional', 'photo editing monitor', 'event photography crowd', 'food photography restaurant'],
  },
  barbershop: {
    hero: 'barbershop vintage interior classic',
    gallery: ['barber haircut scissors', 'beard grooming trim', 'barbershop pole vintage', 'hair fade cut skill', 'hot towel shave classic', 'hair styling product', 'barbershop interior modern', 'barber tools clippers'],
  },
  cleaning: {
    hero: 'professional cleaning service spotless',
    gallery: ['cleaning supplies modern', 'clean home interior', 'professional cleaner uniform', 'sparkling kitchen clean', 'vacuum cleaner home', 'cleaning spray products', 'organized tidy room', 'window cleaning service'],
  },
  petcare: {
    hero: 'pet care veterinary happy animals',
    gallery: ['dog grooming cute', 'cat veterinary exam', 'pet shop animals', 'dog training park', 'puppy care adorable', 'pet boarding kennels', 'animal hospital care', 'dog walking leash'],
  },
  law: {
    hero: 'law office professional elegant',
    gallery: ['law books library', 'courtroom justice scales', 'lawyer meeting client', 'legal documents contract', 'office desk professional', 'justice statue law', 'attorney briefcase suit', 'law firm modern office'],
  },
  accounting: {
    hero: 'accounting finance professional office',
    gallery: ['financial charts graphs', 'accounting spreadsheet calculator', 'tax documents numbers', 'business meeting finance', 'stock market analysis', 'budget planning desk', 'financial advisor report', 'invoice payment business'],
  },
  dental: {
    hero: 'dental clinic modern clean',
    gallery: ['dental teeth smile', 'dentist examination chair', 'dental equipment tools', 'teeth whitening bright', 'dental xray checkup', 'oral hygiene care', 'dentist patient treatment', 'dental office interior'],
  },
  hotel: {
    hero: 'luxury hotel resort beautiful',
    gallery: ['hotel room luxury bed', 'hotel lobby elegant', 'hotel pool rooftop', 'hotel restaurant fine dining', 'hotel suite panoramic view', 'hotel concierge service', 'hotel bathroom marble', 'hotel exterior architectural'],
  },
  events: {
    hero: 'event planning celebration elegant',
    gallery: ['wedding reception decor', 'event venue decoration', 'gala dinner table', 'birthday party celebration', 'corporate event conference', 'floral arch wedding', 'balloon decoration party', 'lighting event ambiance'],
  },
  catering: {
    hero: 'catering food buffet elegant',
    gallery: ['catering buffet spread', 'food presentation elegant', 'catering team service', 'wedding catering food', 'appetizer platter catering', 'chef plating event', 'banquet hall setup', 'corporate catering lunch'],
  },
  tech: {
    hero: 'technology innovation startup modern',
    gallery: ['coding software developer', 'tech startup office', 'computer server data', 'app development mobile', 'AI machine learning tech', 'cloud computing network', 'tech team collaboration', 'innovation lab research'],
  },
  startup: {
    hero: 'startup office modern team',
    gallery: ['startup team brainstorm', 'whiteboard planning startup', 'co-working space modern', 'pitch deck presentation', 'tech product demo', 'startup founder laptop', 'innovation hub community', 'product launch event'],
  },
  consulting: {
    hero: 'business consulting professional meeting',
    gallery: ['business strategy meeting', 'consulting whiteboard workshop', 'professional handshake deal', 'data analysis charts', 'boardroom presentation', 'business coach mentor', 'strategy planning team', 'executive office modern'],
  },
  healthcare: {
    hero: 'healthcare medical professional modern',
    gallery: ['doctor patient consultation', 'medical equipment hospital', 'healthcare team doctors', 'laboratory research science', 'surgery operating room', 'pharmacy medicine', 'health wellness lifestyle', 'medical technology scan'],
  },
  ecommerce: {
    hero: 'online shopping ecommerce modern',
    gallery: ['product packaging modern', 'ecommerce warehouse boxes', 'online store mobile shopping', 'delivery courier package', 'product photography flat', 'shopping cart checkout', 'brand packaging luxury', 'customer unboxing experience'],
  },
  service: {
    hero: 'professional service business quality',
    gallery: ['professional team meeting', 'service excellence customer', 'quality assurance check', 'business professional handshake', 'customer service help', 'industry professional tools', 'service delivery excellence', 'team collaboration office'],
  },
  portfolio: {
    hero: 'creative portfolio design elegant',
    gallery: ['creative workspace design', 'portfolio presentation laptop', 'design mockup art', 'creative studio light', 'artwork gallery display', 'graphic design work', 'architecture render building', 'illustration artwork colorful'],
  },
  agency: {
    hero: 'creative agency modern office',
    gallery: ['agency team creative', 'branding design mockup', 'marketing campaign board', 'agency office workspace', 'creative meeting brainstorm', 'design presentation client', 'digital marketing strategy', 'advertising creative team'],
  },
  realestate: {
    hero: 'real estate luxury home property',
    gallery: ['luxury home interior', 'modern house exterior', 'apartment city view', 'real estate agent keys', 'kitchen renovation modern', 'living room luxury', 'house for sale sign', 'commercial property building'],
  },
  education: {
    hero: 'education learning modern classroom',
    gallery: ['student learning classroom', 'teacher whiteboard teaching', 'library books study', 'online learning laptop', 'graduation ceremony', 'school campus building', 'science lab experiment', 'tutoring session desk'],
  },
  other: {
    hero: 'professional business modern',
    gallery: ['business professional team', 'modern office workspace', 'service quality excellence', 'customer satisfaction smile', 'professional meeting room', 'brand identity design', 'success achievement trophy', 'innovation technology future'],
  },
  default: {
    hero: 'professional business modern',
    gallery: ['business team office', 'professional workspace modern', 'success achievement', 'quality service customer', 'innovation modern tech', 'brand identity professional', 'meeting collaboration team', 'office interior design'],
  },
};

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_BASE = 'https://api.unsplash.com';

class BusinessImageService {
  private cache = new Map<string, string>();

  private getQuery(businessType: BusinessType | string): { hero: string; gallery: string[] } {
    return imageQueries[businessType as BusinessType] || imageQueries.default;
  }

  async getHeroImage(businessType: BusinessType | string): Promise<string> {
    const cacheKey = `hero_${businessType}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const { hero } = this.getQuery(businessType);

    try {
      if (UNSPLASH_ACCESS_KEY) {
        const url = `${UNSPLASH_BASE}/photos/random?query=${encodeURIComponent(hero)}&orientation=landscape&content_filter=high`;
        const res = await fetch(url, {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
          next: { revalidate: 3600 },
        });
        if (res.ok) {
          const data = await res.json();
          const imageUrl = data.urls?.regular || data.urls?.full;
          if (imageUrl) {
            this.cache.set(cacheKey, imageUrl);
            return imageUrl;
          }
        }
      }
    } catch {
      // fallthrough to static fallbacks
    }

    const fallback = this.getStaticFallback(businessType as BusinessType, 'hero');
    this.cache.set(cacheKey, fallback);
    return fallback;
  }

  async getGalleryImages(businessType: BusinessType | string, count = 8): Promise<string[]> {
    const cacheKey = `gallery_${businessType}_${count}`;
    if (this.cache.has(cacheKey)) {
      return JSON.parse(this.cache.get(cacheKey)!);
    }

    const { gallery } = this.getQuery(businessType);
    const queries = gallery.slice(0, count);

    try {
      if (UNSPLASH_ACCESS_KEY) {
        const results = await Promise.all(
          queries.map(async (query) => {
            try {
              const url = `${UNSPLASH_BASE}/photos/random?query=${encodeURIComponent(query)}&orientation=squarish&content_filter=high`;
              const res = await fetch(url, {
                headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
                next: { revalidate: 3600 },
              });
              if (res.ok) {
                const data = await res.json();
                return data.urls?.regular || null;
              }
            } catch { /* skip */ }
            return null;
          })
        );

        const valid = results.filter(Boolean) as string[];
        if (valid.length > 0) {
          this.cache.set(cacheKey, JSON.stringify(valid));
          return valid;
        }
      }
    } catch { /* fallthrough */ }

    const fallbacks = this.getStaticGalleryFallbacks(businessType as BusinessType, count);
    this.cache.set(cacheKey, JSON.stringify(fallbacks));
    return fallbacks;
  }

  private getStaticFallback(businessType: BusinessType, _type: 'hero'): string {
    const fallbacks: Record<string, string> = {
      perfume: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1600&q=80',
      restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
      cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
      bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
      beauty: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80',
      fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80',
      gym: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1600&q=80',
      yoga: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80',
      flowershop: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1600&q=80',
      jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
      photography: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1600&q=80',
      barbershop: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
      cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80',
      petcare: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=80',
      law: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
      accounting: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
      dental: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1600&q=80',
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
      events: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
      catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80',
      tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      startup: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
      consulting: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      healthcare: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1600&q=80',
      ecommerce: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80',
      realestate: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
      education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
      default: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    };
    return fallbacks[businessType] || fallbacks.default;
  }

  private getStaticGalleryFallbacks(businessType: BusinessType, count: number): string[] {
    const allFallbacks: Record<string, string[]> = {
      perfume: [
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1587895741558-a1929a5b38e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549049950-48d5887197a0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?auto=format&fit=crop&w=800&q=80',
      ],
      restaurant: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
      ],
      default: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      ],
    };

    const list = allFallbacks[businessType] || allFallbacks.default;
    const repeated: string[] = [];
    while (repeated.length < count) {
      repeated.push(...list.slice(0, count - repeated.length));
    }
    return repeated.slice(0, count);
  }
}

export default new BusinessImageService();
