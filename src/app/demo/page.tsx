/**
 * Website Template Demo Page
 * Showcases ProfessionalSiteTemplate across all supported business types
 */

import React from 'react';
import { ProfessionalSiteTemplate } from '@/components/ProfessionalSiteTemplate';
import { generateBusinessColorPalette } from '@/services/ai/color-palette-generator.service';
import type { BusinessType } from '@/types/business';

// ── Demo catalogue ───────────────────────────────────────────────────────────

const demoBusinesses: {
  name: string;
  businessType: BusinessType;
  description: string;
  services: string[];
  phone: string;
  city: string;
  products?: { id: string; name: string; description: string; price: number; salePrice: number | null; image: null; category: string; featured: boolean }[];
}[] = [
  {
    name: 'Luxe Parfumerie',
    businessType: 'perfume',
    description: 'Exclusive luxury fragrance boutique offering handcrafted artisanal perfumes and personalised scent consultations.',
    services: ['Custom Fragrance Creation', 'Scent Consultation', 'Luxury Perfume Collection', 'Fragrance Workshops'],
    phone: '+1 (555) 110-1001',
    city: 'New York',
    products: [
      { id: '1', name: 'Signature Essence', description: 'flagship fragrance with notes of bergamot, sandalwood, and vanilla', price: 150, salePrice: null, image: null, category: 'Signature', featured: true },
      { id: '2', name: 'Luxury Collection', description: 'Premium fragrances crafted with the finest ingredients from around the world', price: 250, salePrice: 200, image: null, category: 'Premium', featured: true },
      { id: '3', name: 'Custom Blend', description: 'Personalised fragrance created exclusively for you by our master perfumer', price: 350, salePrice: null, image: null, category: 'Custom', featured: false },
    ],
  },
  {
    name: 'FreshBite Restaurant',
    businessType: 'restaurant',
    description: 'A modern farm-to-table restaurant serving fresh, locally-sourced cuisine in the heart of downtown.',
    services: ['Fine Dining', 'Private Events', 'Wine Pairing', 'Catering'],
    phone: '+1 (555) 110-1002',
    city: 'Chicago',
    products: [
      { id: '1', name: "Chef's Tasting Menu", description: 'A curated selection of our finest dishes featuring seasonal ingredients', price: 85, salePrice: null, image: null, category: 'Menu', featured: true },
      { id: '2', name: 'Wine Pairing Experience', description: 'Premium wines carefully selected to complement your meal', price: 45, salePrice: null, image: null, category: 'Wine', featured: true },
    ],
  },
  {
    name: 'TechFlow Solutions',
    businessType: 'startup',
    description: 'Innovative software development company specialising in AI-powered business automation tools.',
    services: ['Software Development', 'AI Consulting', 'Cloud Migration', 'Tech Training'],
    phone: '+1 (555) 110-1003',
    city: 'San Francisco',
  },
  {
    name: 'Zen Wellness Spa',
    businessType: 'spa',
    description: 'Luxurious wellness sanctuary offering holistic treatments for mind, body, and soul.',
    services: ['Massage Therapy', 'Facial Treatments', 'Aromatherapy', 'Hot Stone Ritual'],
    phone: '+1 (555) 110-1004',
    city: 'Los Angeles',
  },
  {
    name: 'Elite Fitness Center',
    businessType: 'fitness',
    description: 'State-of-the-art fitness facility with personal training, group classes, and cutting-edge equipment.',
    services: ['Personal Training', 'Group Fitness', 'Nutrition Coaching', 'Athletic Recovery'],
    phone: '+1 (555) 110-1005',
    city: 'Miami',
  },
  {
    name: 'Bloom Florist',
    businessType: 'flowershop',
    description: 'Boutique florist creating breathtaking arrangements for every occasion, delivered fresh daily.',
    services: ['Custom Bouquets', 'Wedding Florals', 'Event Decoration', 'Same-Day Delivery'],
    phone: '+1 (555) 110-1006',
    city: 'Seattle',
    products: [
      { id: '1', name: 'Romantic Roses Bouquet', description: '24 premium long-stem red roses', price: 89, salePrice: null, image: null, category: 'Bouquets', featured: true },
      { id: '2', name: 'Spring Garden Arrangement', description: 'Seasonal blooms in a glass vase', price: 65, salePrice: 55, image: null, category: 'Arrangements', featured: true },
    ],
  },
  {
    name: 'Artisan Bakes Co.',
    businessType: 'bakery',
    description: 'Family-run artisan bakery crafting fresh bread, pastries, and celebration cakes from scratch every day.',
    services: ['Artisan Breads', 'Custom Celebration Cakes', 'Pastries & Croissants', 'Wholesale Orders'],
    phone: '+1 (555) 110-1007',
    city: 'Austin',
    products: [
      { id: '1', name: 'Sourdough Loaf', description: 'Traditional slow-fermented sourdough with crispy crust', price: 12, salePrice: null, image: null, category: 'Breads', featured: true },
      { id: '2', name: 'Celebration Cake', description: 'Custom-designed 3-tier celebration cake', price: 180, salePrice: null, image: null, category: 'Cakes', featured: true },
    ],
  },
  {
    name: 'Glow Beauty Studio',
    businessType: 'beauty',
    description: 'Premium beauty destination for hair, makeup, nails, and skincare with certified beauty professionals.',
    services: ['Hair Styling & Colouring', 'Makeup Artistry', 'Nail Art', 'Advanced Skincare'],
    phone: '+1 (555) 110-1008',
    city: 'Houston',
  },
  {
    name: 'Sharp Edge Barbershop',
    businessType: 'barbershop',
    description: 'Classic barbershop with master barbers delivering precision cuts, fades, and traditional hot towel shaves.',
    services: ['Haircut & Fade', 'Beard Trim & Shape', 'Hot Towel Shave', 'Hair Treatments'],
    phone: '+1 (555) 110-1009',
    city: 'Nashville',
  },
  {
    name: 'Sterling Law Group',
    businessType: 'law',
    description: 'Experienced law firm providing comprehensive legal representation across commercial, family, and criminal law.',
    services: ['Commercial Law', 'Family Law', 'Criminal Defence', 'Contractual Disputes'],
    phone: '+1 (555) 110-1010',
    city: 'Boston',
  },
  {
    name: 'BrightSmile Dental',
    businessType: 'dental',
    description: 'Modern dental clinic offering comprehensive care from routine check-ups to cosmetic dentistry.',
    services: ['General Dentistry', 'Teeth Whitening', 'Invisalign', 'Dental Implants'],
    phone: '+1 (555) 110-1011',
    city: 'Denver',
  },
  {
    name: 'The Grand Palace Hotel',
    businessType: 'hotel',
    description: 'Five-star luxury hotel offering world-class hospitality, fine dining, and exceptional wellness facilities.',
    services: ['Luxury Rooms & Suites', 'Fine Dining Restaurant', 'Spa & Wellness', 'Event Spaces'],
    phone: '+1 (555) 110-1012',
    city: 'Las Vegas',
  },
  {
    name: 'CloudNine Tech Agency',
    businessType: 'tech',
    description: 'Full-stack technology agency building scalable, secure software products for startups and enterprises.',
    services: ['Web & App Development', 'Cloud Architecture', 'AI & Machine Learning', 'Cybersecurity'],
    phone: '+1 (555) 110-1013',
    city: 'Austin',
  },
  {
    name: 'Apex Business Consulting',
    businessType: 'consulting',
    description: 'Strategic consulting firm helping businesses unlock growth, streamline operations, and outperform competitors.',
    services: ['Growth Strategy', 'Operations Optimisation', 'Financial Advisory', 'Change Management'],
    phone: '+1 (555) 110-1014',
    city: 'New York',
  },
  {
    name: 'PawfectCare Pet Clinic',
    businessType: 'petcare',
    description: 'Certified pet care specialists providing grooming, boarding, training, and veterinary support for your furry family.',
    services: ['Pet Grooming', 'Veterinary Exams', 'Boarding & Daycare', 'Dog Training'],
    phone: '+1 (555) 110-1015',
    city: 'Portland',
  },
  {
    name: 'SparkleClean Services',
    businessType: 'cleaning',
    description: 'Professional cleaning company delivering spotless results for homes and commercial spaces using eco-friendly products.',
    services: ['Residential Cleaning', 'Commercial Cleaning', 'Deep Cleaning', 'End-of-Tenancy Clean'],
    phone: '+1 (555) 110-1016',
    city: 'Phoenix',
  },
  {
    name: 'Vista Real Estate',
    businessType: 'realestate',
    description: 'Premier real estate agency with deep market knowledge and a track record of exceptional client outcomes.',
    services: ['Residential Sales', 'Property Management', 'Commercial Real Estate', 'Investment Advisory'],
    phone: '+1 (555) 110-1017',
    city: 'Miami',
  },
  {
    name: 'Elevated Events Co.',
    businessType: 'events',
    description: 'Full-service event planning company creating unforgettable corporate galas, weddings, and private celebrations.',
    services: ['Event Design', 'Venue Management', 'Vendor Coordination', 'Day-Of Coordination'],
    phone: '+1 (555) 110-1018',
    city: 'Atlanta',
  },
  {
    name: 'Serene Yoga Studio',
    businessType: 'yoga',
    description: 'Mindful yoga studio offering classes for all levels, from gentle restorative flows to dynamic vinyasa.',
    services: ['Vinyasa Classes', 'Yin & Restore', 'Private Sessions', 'Online Classes'],
    phone: '+1 (555) 110-1019',
    city: 'San Diego',
  },
  {
    name: 'IronCore Gym',
    businessType: 'gym',
    description: 'High-performance gym with Olympic lifting platforms, functional zones, and expert strength coaches.',
    services: ['Open Gym Access', 'Strength Coaching', 'Group Classes', 'Nutrition Plans'],
    phone: '+1 (555) 110-1020',
    city: 'Dallas',
  },
  {
    name: 'The Daily Grind Café',
    businessType: 'cafe',
    description: 'Artisan coffee bar serving ethically sourced single-origin espresso, hand-crafted pastries, and light bites.',
    services: ['Specialty Coffee', 'Fresh Baked Goods', 'Private Events', 'Catering'],
    phone: '+1 (555) 110-1021',
    city: 'Portland',
  },
  {
    name: 'Radiant Gems Jewellery',
    businessType: 'jewelry',
    description: 'Fine jewellery studio handcrafting heirloom pieces with certified gemstones and ethically sourced precious metals.',
    services: ['Custom Design', 'Engagement Rings', 'Repairs & Restoration', 'Jewellery Cleaning'],
    phone: '+1 (555) 110-1022',
    city: 'New York',
    products: [
      { id: '1', name: 'Solitaire Diamond Ring', description: 'Handcrafted 18k gold ring with a 1ct certified diamond', price: 4500, salePrice: null, image: null, category: 'Rings', featured: true },
      { id: '2', name: 'Pearl Necklace Set', description: 'Freshwater pearl necklace with matching earrings', price: 680, salePrice: 580, image: null, category: 'Necklaces', featured: true },
    ],
  },
  {
    name: 'Frame & Focus Photography',
    businessType: 'photography',
    description: 'Award-winning photography studio specialising in wedding, portrait, and commercial photography.',
    services: ['Wedding Photography', 'Portrait Sessions', 'Event Coverage', 'Commercial Shoots'],
    phone: '+1 (555) 110-1023',
    city: 'Chicago',
  },
  {
    name: 'Precision Accounting Group',
    businessType: 'accounting',
    description: 'Certified public accountants delivering tax optimisation, bookkeeping, and strategic financial advisory.',
    services: ['Tax Planning', 'Bookkeeping', 'Financial Advisory', 'Business Accounting'],
    phone: '+1 (555) 110-1024',
    city: 'Houston',
  },
  {
    name: 'Savour Catering Co.',
    businessType: 'catering',
    description: 'Award-winning catering company crafting bespoke menus for corporate events, weddings, and private celebrations.',
    services: ['Corporate Catering', 'Wedding Catering', 'Private Events', 'Beverage Service'],
    phone: '+1 (555) 110-1025',
    city: 'Los Angeles',
  },
  {
    name: 'HealthFirst Medical',
    businessType: 'healthcare',
    description: 'Comprehensive healthcare provider offering primary care, specialised treatment, and telehealth services.',
    services: ['General Practice', 'Preventive Care', 'Specialized Treatment', 'Telehealth'],
    phone: '+1 (555) 110-1026',
    city: 'Boston',
  },
  {
    name: 'Apex Learning Academy',
    businessType: 'education',
    description: 'Leading educational institution offering expert-led programmes, certifications, and career support.',
    services: ['Online Courses', 'Live Classes', 'Certifications', 'Career Support'],
    phone: '+1 (555) 110-1027',
    city: 'San Francisco',
  },
  {
    name: 'ShopSmart Online',
    businessType: 'ecommerce',
    description: 'Curated online marketplace offering premium products from trusted brands with fast, free delivery.',
    services: ['Fast Shipping', 'Easy Returns', 'Secure Payment', '24/7 Support'],
    phone: '+1 (555) 110-1028',
    city: 'Seattle',
    products: [
      { id: '1', name: 'Premium Wireless Headphones', description: 'Noise-cancelling headphones with 40-hour battery life', price: 199, salePrice: 149, image: null, category: 'Electronics', featured: true },
      { id: '2', name: 'Organic Skincare Set', description: 'Cleanser, toner, and moisturiser made with organic ingredients', price: 89, salePrice: null, image: null, category: 'Beauty', featured: true },
    ],
  },
  {
    name: 'Pixel Creative Agency',
    businessType: 'agency',
    description: 'Full-service creative agency delivering brand strategy, web design, and digital marketing for forward-thinking brands.',
    services: ['Brand Strategy', 'Web Design', 'Digital Marketing', 'Content Creation'],
    phone: '+1 (555) 110-1029',
    city: 'Austin',
  },
  {
    name: 'Handyman Pro Services',
    businessType: 'service',
    description: 'Reliable professional service provider offering expert solutions with a personal touch and guaranteed satisfaction.',
    services: ['Consultation', 'Project Management', 'Custom Solutions', 'Ongoing Support'],
    phone: '+1 (555) 110-1030',
    city: 'Denver',
  },
  {
    name: 'Alex Rivera Portfolio',
    businessType: 'portfolio',
    description: 'Creative portfolio showcasing thoughtful, user-centred design and robust digital solutions for modern businesses.',
    services: ['Web Design', 'Development', 'Branding', 'Consulting'],
    phone: '+1 (555) 110-1031',
    city: 'San Francisco',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildDemoSite(business: (typeof demoBusinesses)[number], idx: number) {
  const palette = generateBusinessColorPalette(business.businessType, business.name);

  const siteData = {
    id: `demo-${idx}`,
    slug: business.name.toLowerCase().replace(/\s+/g, '-'),
    headline: `Welcome to ${business.name}`,
    subheadline: business.description,
    aboutText: business.description,
    ctaText: 'Get Started Today',
    features: ['Premium Quality', 'Expert Service', 'Customer Satisfaction', 'Professional Results'],
    testimonials: [
      { name: 'Sarah J.', text: 'Absolutely amazing service! The quality exceeded my expectations completely.', rating: 5 },
      { name: 'Michael C.', text: 'Professional, reliable, and outstanding results. Highly recommended.', rating: 5 },
      { name: 'Emma W.', text: 'Best decision I made this year! The team was fantastic and results speak for themselves.', rating: 5 },
    ],
    variant: 'A' as const,
    tagline: `${business.name} — Excellence Delivered`,
    valuePropositions: ['Premium Quality', 'Expert Team', 'Satisfaction Guaranteed', 'Proven Results'],
    serviceDescriptions: business.services.map(s => ({
      name: s,
      description: `Expert ${s.toLowerCase()} services tailored to your specific needs with guaranteed satisfaction.`,
    })),
  };

  const businessData = {
    name: business.name,
    description: business.description,
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&size=200&background=${palette.palette.primary.replace('#', '')}&color=fff&bold=true`,
    heroImage: null as null,
    galleryImages: [] as string[],
    primaryColor: palette.palette.primary,
    secondaryColor: palette.palette.secondary,
    businessType: business.businessType,
    services: business.services,
    phone: business.phone,
    email: `hello@${business.name.toLowerCase().replace(/\s+/g, '')}.com`,
    address: '123 Main Street',
    city: business.city,
    calendlyUrl: null as null,
    socialLinks: {
      instagram: `https://instagram.com/${business.name.toLowerCase().replace(/\s+/g, '')}`,
      facebook: `https://facebook.com/${business.name.toLowerCase().replace(/\s+/g, '')}`,
      twitter: `https://twitter.com/${business.name.toLowerCase().replace(/\s+/g, '')}`,
    },
    openingHours: {
      Monday: '9:00 AM – 6:00 PM',
      Tuesday: '9:00 AM – 6:00 PM',
      Wednesday: '9:00 AM – 6:00 PM',
      Thursday: '9:00 AM – 6:00 PM',
      Friday: '9:00 AM – 6:00 PM',
      Saturday: '10:00 AM – 4:00 PM',
      Sunday: 'Closed',
    },
  };

  return { siteData, businessData, palette, products: business.products ?? [] };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const demos = demoBusinesses.map((b, i) => ({ ...buildDemoSite(b, i), meta: b }));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SalesAPE Template Demo</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {demoBusinesses.length} business types · Scroll to explore each template
            </p>
          </div>
          <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
            Live Previews
          </span>
        </div>

        {/* Business type quick-nav */}
        <div className="border-t bg-gray-50 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6 flex gap-2 py-2 min-w-max">
            {demoBusinesses.map((b, i) => (
              <a
                key={i}
                href={`#demo-${i}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm transition-all whitespace-nowrap border border-transparent hover:border-gray-200"
              >
                {b.name}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Demo entries */}
      <main className="max-w-full">
        {demos.map((demo, idx) => (
          <section key={idx} id={`demo-${idx}`} className="border-b-4 border-gray-200">
            {/* Business banner */}
            <div className="bg-white px-6 py-4 flex flex-wrap gap-4 items-center justify-between border-b">
              <div className="flex items-center gap-3">
                {/* Colour swatch */}
                <div className="flex gap-1">
                  {[demo.palette.palette.primary, demo.palette.palette.secondary, demo.palette.palette.accent].map((c, ci) => (
                    <div key={ci} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{demo.meta.name}</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{demo.meta.businessType} · {demo.meta.city}</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-gray-500">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">{demo.palette.mood}</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{demo.meta.services.length} services</span>
                {demo.products.length > 0 && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">{demo.products.length} products</span>
                )}
              </div>
            </div>

            {/* Full-width template render */}
            <ProfessionalSiteTemplate
              site={demo.siteData}
              business={demo.businessData}
              products={demo.products}
            />
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 text-sm text-gray-400">
        SalesAPE Demo Page · {demoBusinesses.length} business types · Professional Website Templates
      </footer>
    </div>
  );
}
