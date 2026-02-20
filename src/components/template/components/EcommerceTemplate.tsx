"use client";

/**
 * EcommerceTemplate – URL-scraper template for fashion, retail, jewelry,
 * perfume, flowershop, boutique & similar product-led businesses.
 * Completely different from ProfessionalSiteTemplate (chatbot) and LandingTemplate.
 */

import React, { useState } from "react";
import type { BusinessData } from "../types/landing";
import { createLead } from "@/actions/leads";
import {
  ShoppingBag, Star, Instagram, Facebook, Twitter, Linkedin,
  Phone, Mail, MapPin, ChevronRight, ArrowRight, Menu, X,
  Package, Heart, Sparkles, Award,
} from "lucide-react";

interface Props { data: BusinessData; siteId?: string }

interface LeadCopy {
  eyebrow: string; heading: string; subheading: string;
  namePlaceholder: string; messagePlaceholder: string;
  submitLabel: string; successTitle: string; successMessage: string;
}

function getLeadCopy(businessType: string, brandName?: string): LeadCopy {
  const name = brandName || 'us';
  const map: Record<string, LeadCopy> = {
    jewelry: { eyebrow: 'Custom Order', heading: 'Request a Bespoke Piece', subheading: 'Share your vision and our artisans will craft something truly one-of-a-kind for you.', namePlaceholder: 'Your name', messagePlaceholder: 'Describe your dream piece — metal, stones, occasion…', submitLabel: 'Request a Quote', successTitle: 'Request Received!', successMessage: "We'll reach out within 24 hours to discuss your bespoke piece." },
    perfume: { eyebrow: 'Fragrance Consultation', heading: 'Find Your Signature Scent', subheading: `Tell us your mood, favourite notes, or occasions and our team at ${name} will guide you to the perfect fragrance.`, namePlaceholder: 'Your name', messagePlaceholder: "Describe your favourite scent notes — woody, floral, oud, fresh? Any occasion or mood in mind?", submitLabel: 'Find My Scent', successTitle: 'Consultation Booked!', successMessage: 'Our fragrance expert will be in touch shortly.' },
    beauty: { eyebrow: 'Book a Service', heading: 'Reserve Your Appointment', subheading: "Treat yourself. Let us know your preferred treatment and we'll arrange your visit.", namePlaceholder: 'Your name', messagePlaceholder: 'Which treatment are you interested in? Any preferred time?', submitLabel: 'Book Now', successTitle: 'Appointment Requested!', successMessage: "We'll confirm your booking shortly." },
    spa: { eyebrow: 'Wellness Booking', heading: 'Reserve Your Treatment', subheading: "Relax and rejuvenate. Tell us your preferred treatment and we'll handle the rest.", namePlaceholder: 'Your name', messagePlaceholder: 'Which treatment interests you? Any special requirements?', submitLabel: 'Book Treatment', successTitle: 'Booking Received!', successMessage: "We'll confirm your spa appointment within 24 hours." },
    fitness: { eyebrow: 'Membership', heading: 'Book Your Membership', subheading: "Start your fitness journey today. Tell us your goals and we'll find the perfect plan.", namePlaceholder: 'Your name', messagePlaceholder: 'What are your fitness goals? Any preferred training schedule?', submitLabel: 'Book Free Session', successTitle: 'Welcome!', successMessage: 'One of our trainers will be in touch to set up your free trial.' },
    gym: { eyebrow: 'Membership', heading: 'Start Your Fitness Journey', subheading: "Tell us your goals and we'll find the perfect membership plan for you.", namePlaceholder: 'Your name', messagePlaceholder: 'Share your fitness goals and any questions about membership…', submitLabel: 'Book Free Session', successTitle: "Let's Go!", successMessage: 'Our team will contact you to schedule your free introductory session.' },
    flowershop: { eyebrow: 'Floral Order', heading: 'Order Custom Arrangements', subheading: "For birthdays, weddings, or just because — let us create something beautiful for you.", namePlaceholder: 'Your name', messagePlaceholder: 'Tell us the occasion, preferred flowers, colours and delivery date…', submitLabel: 'Place Order', successTitle: 'Order Received!', successMessage: "We'll confirm your arrangement and delivery details shortly." },
    events: { eyebrow: 'Event Enquiry', heading: 'Plan Your Perfect Event', subheading: "Whether it's a corporate event, wedding, or private party — we'll make it unforgettable.", namePlaceholder: 'Your name', messagePlaceholder: 'Describe your event — type, date, guest count, and any special requirements…', submitLabel: 'Get a Quote', successTitle: 'Enquiry Sent!', successMessage: 'Our events team will be in touch within 24 hours.' },
    photography: { eyebrow: 'Book a Session', heading: "Let's Create Together", subheading: "Tell us about your vision and we'll arrange the perfect photography session.", namePlaceholder: 'Your name', messagePlaceholder: 'What type of session are you looking for? Any specific ideas?', submitLabel: 'Book a Session', successTitle: 'Session Requested!', successMessage: "We'll be in touch to discuss the details and confirm your booking." },
    catering: { eyebrow: 'Catering Enquiry', heading: 'Catering for Your Event', subheading: "From intimate dinners to large corporate events — let's make your occasion delicious.", namePlaceholder: 'Your name', messagePlaceholder: 'Tell us your event date, number of guests, cuisine preferences…', submitLabel: 'Request a Quote', successTitle: 'Enquiry Received!', successMessage: 'Our catering team will send you a personalised quote within 24 hours.' },
    petcare: { eyebrow: 'Appointment', heading: 'Your Pet Deserves the Best', subheading: 'Book a grooming, checkup, or care session for your furry friend.', namePlaceholder: 'Your name', messagePlaceholder: "What service does your pet need? What's their breed and any special needs?", submitLabel: 'Book Appointment', successTitle: 'Appointment Booked!', successMessage: "We'll confirm your pet's appointment shortly." },
    barbershop: { eyebrow: 'Book a Cut', heading: 'Reserve Your Seat', subheading: 'Fresh cuts, clean fades, expert grooming. Book your spot now.', namePlaceholder: 'Your name', messagePlaceholder: 'What service are you looking for? Any preferred stylist or time?', submitLabel: 'Book Now', successTitle: 'Booking Confirmed!', successMessage: "We'll reach out to confirm your grooming appointment." },
    restaurant: { eyebrow: 'Reservations', heading: 'Reserve Your Table', subheading: "Join us for an unforgettable dining experience. We'd love to have you.", namePlaceholder: 'Your name', messagePlaceholder: 'Party size, preferred date/time, special occasion or dietary requirements…', submitLabel: 'Reserve Table', successTitle: 'Reservation Received!', successMessage: "We'll confirm your table reservation shortly." },
    bakery: { eyebrow: 'Custom Order', heading: 'Order a Custom Cake', subheading: "Birthdays, weddings, celebrations — let us bake something special just for you.", namePlaceholder: 'Your name', messagePlaceholder: 'Describe your cake — flavour, design, occasion and required date…', submitLabel: 'Place Order', successTitle: 'Order Placed!', successMessage: 'Our bakers will be in touch to confirm your order.' },
    fashion: { eyebrow: 'Order Enquiry', heading: 'Request a Custom Piece', subheading: `Looking for something specific from ${name}? Tell us your style, size, and occasion.`, namePlaceholder: 'Your name', messagePlaceholder: 'Describe your requirements — size, colour, occasion, or custom needs…', submitLabel: 'Send Enquiry', successTitle: 'Enquiry Sent!', successMessage: `The team at ${name} will be in touch within 24 hours.` },
  };
  return map[businessType] || map['fashion']!;
}

/**
 * Scan stored BusinessData for domain keywords so that existing sites
 * (created before the leadForm LLM field existed) still get the right copy.
 * Returns the most specific copy-type key to pass to getLeadCopy().
 */
function inferCopyTypeFromData(data: BusinessData, declaredType: string): string {
  // Collect all readable text from the stored template data
  const corpus = [
    (data as any).brand?.tagline,
    (data as any).about?.description,
    (data as any).about?.title,
    (data as any).hero?.headline,
    (data as any).hero?.subheadline,
    ...(((data as any).products?.items || []) as any[]).map((p: any) => `${p.name} ${p.description} ${p.category}`),
    ...(((data as any).services?.items || []) as any[]).map((s: any) => `${s.title} ${s.description}`),
    ...(((data as any).features?.items || []) as any[]).map((f: any) => `${f.title} ${f.description}`),
  ].filter(Boolean).join(' ').toLowerCase();

  // Ordered from most-specific to prevent cross-matching
  const signals: [string, string[]][] = [
    ['perfume',     ['perfume', 'parfum', 'fragrance', 'scent', 'eau de', 'oud', 'attar', 'cologne', 'sillage', 'aroma', 'aromatic']],
    ['jewelry',     ['jewelry', 'jewellery', 'diamond', 'gemstone', 'necklace', 'bracelet', 'ring', 'bespoke jewel', 'artisan jewel']],
    ['flowershop',  ['flower', 'floral', 'bouquet', 'arrangement', 'bloom', 'petal', 'florist']],
    ['fitness',     ['gym', 'fitness', 'workout', 'membership', 'personal trainer', 'strength', 'cardio', 'muscle']],
    ['spa',         ['spa', 'massage', 'facial', 'relaxation', 'wellness treatment', 'body wrap']],
    ['beauty',      ['salon', 'hair colour', 'manicure', 'pedicure', 'nail', 'lash', 'brow', 'waxing', 'threading']],
    ['photography', ['photography', 'portrait', 'shoot', 'photographer', 'lens', 'studio session']],
    ['events',      ['event planning', 'corporate event', 'wedding planner', 'venue', 'event management']],
    ['catering',    ['catering', 'caterer', 'buffet', 'event dining', 'corporate lunch']],
    ['petcare',     ['pet', 'grooming', 'veterinary', 'dog', 'cat', 'animal care']],
    ['barbershop',  ['barber', 'haircut', 'fade', 'shave', 'grooming']],
  ];

  for (const [type, keywords] of signals) {
    if (keywords.some(kw => corpus.includes(kw))) return type;
  }

  return declaredType; // nothing matched — honour the original type
}

export default function EcommerceTemplate({ data, siteId }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const { brand, hero, about, products, services, testimonials, gallery, contact, footer, nav, galleryImages } = data as any;

  const primary = brand?.primaryColor || "#ec4899";
  const secondary = brand?.secondaryColor || "#f472b6";
  const grad = `linear-gradient(135deg, ${primary}, ${secondary})`;

  // Sanitise brand name: decode HTML entities and strip page-title separators
  // e.g. "Peirama Parfums – peiramaparfums" → "Peirama Parfums"
  const rawBrandName: string = brand?.name || "";
  const brandName = rawBrandName
    .replace(/&ndash;/gi, "–").replace(/&mdash;/gi, "—").replace(/&amp;/gi, "&")
    .replace(/\s*[–—|·:]{1,2}\s*.+$/, "")   // strip everything from first separator onward
    .replace(/\s+-\s+.+$/, "")               // strip " - subtitle" style
    .trim() || rawBrandName;

  // Gather all product items
  const allProducts = products?.items || [];
  const categories = ["All", ...Array.from(new Set(allProducts.map((p: any) => p.category).filter(Boolean))) as string[]];
  const filtered = activeCategory === "All" ? allProducts : allProducts.filter((p: any) => p.category === activeCategory);

  const images: string[] = galleryImages || [];

  // nav.links may be string[] or { label: string; href?: string }[] — normalise to string[]
  const rawNavLinks: unknown[] = nav?.links || ["Home", "Shop", "About", "Contact"];
  const navLinks: string[] = rawNavLinks.map((l: unknown) =>
    typeof l === "string" ? l : (l as any)?.label || (l as any)?.text || String(l)
  );

  // Lead form state
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const businessType = ((brand?.businessType || '') as string).toLowerCase();
  // Use AI-generated lead form copy if available, fall back to static type-based copy
  const leadCopy: LeadCopy = data.leadForm?.heading
    ? {
        eyebrow:            data.leadForm.eyebrow            || 'Get in Touch',
        heading:            data.leadForm.heading,
        subheading:         data.leadForm.subheading          || '',
        namePlaceholder:    'Your name',
        messagePlaceholder: data.leadForm.messagePlaceholder  || 'How can we help you?',
        submitLabel:        data.leadForm.submitLabel          || 'Send Message',
        successTitle:       data.leadForm.successTitle         || 'Message Sent!',
        successMessage:     data.leadForm.successMessage       || "We'll get back to you soon.",
      }
    : getLeadCopy(inferCopyTypeFromData(data, businessType), brandName);

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!siteId) return;
    setLeadStatus('submitting');
    try {
      const result = await createLead({
        siteId,
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone || undefined,
        message: leadForm.message || undefined,
      });
      setLeadStatus(result.success ? 'success' : 'error');
    } catch {
      setLeadStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ "--ec-primary": primary, "--ec-secondary": secondary } as React.CSSProperties}>

      {/* ── Announcement bar ── */}
      <div className="py-2.5 text-center text-xs font-semibold text-white tracking-widest uppercase" style={{ background: grad }}>
        Free shipping on orders over $75 &nbsp;·&nbsp; New arrivals every week
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            {brand?.logo ? (
              <img src={brand.logo} alt={brandName} className="h-10 w-auto object-contain max-w-[180px]" />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ background: grad }}>
                  {brandName.charAt(0) || "S"}
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 truncate">{brandName}</span>
              </>
            )}
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link: string) => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
              style={{ background: grad }}>
              <ShoppingBag size={15} /> Shop Now
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {navLinks.map((link: string) => (
              <a key={link} href={`#${link.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-700 font-medium py-1.5 hover:text-pink-600 transition-colors">
                {link}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        {hero?.image ? (
          <div className="absolute inset-0">
            <img src={hero.image} alt="hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)" }} />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #1a0a14 0%, #2d0a22 50%, #1a0a14 100%)` }}>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "radial-gradient(ellipse 70% 70% at 80% 50%, rgba(236,72,153,0.45) 0%, transparent 70%)" }} />
          </div>
        )}

        {/* Floating decorative circles */}
        <div className="absolute top-20 right-12 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: primary }} />
        <div className="absolute bottom-20 right-40 w-32 h-32 rounded-full opacity-15 blur-2xl" style={{ background: secondary }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            {/* Welcome badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-6">
              <Sparkles size={13} className="text-pink-300" />
              <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">
                Welcome to {brandName}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-5 tracking-tight">
              {hero?.headline || brandName}
            </h1>
            <p className="text-lg text-white/75 mb-8 leading-relaxed max-w-md">
              {hero?.subheadline || brand?.tagline || "Discover our exclusive collection."}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-3.5 rounded-full font-bold text-white text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{ background: grad }}>
                <ShoppingBag size={16} /> Explore Collection
              </button>
              <button
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-3.5 rounded-full font-semibold text-white text-sm border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
                Our Story <ChevronRight size={16} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                { icon: <Award size={14} />, label: "Premium Quality" },
                { icon: <Heart size={14} />, label: "Loved by Thousands" },
                { icon: <Package size={14} />, label: "Fast Delivery" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/65 text-xs font-medium">
                  {icon} {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category tabs + Products ── */}
      <section id="shop" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Our <span className="bg-clip-text text-transparent" style={{ backgroundImage: grad }}>Collection</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {products?.subtitle || "Curated with care — crafted for excellence."}
            </p>
          </div>

          {/* Category tabs */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={activeCategory === cat
                    ? { background: grad, color: "#fff", boxShadow: `0 4px 20px ${primary}40` }
                    : { background: "white", color: "#6b7280", border: "1px solid #e5e7eb" }}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p: any, i: number) => (
                <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={p.image || images[i % Math.max(images.length, 1)] || hero?.image || ""}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.salePrice && p.price && p.salePrice < p.price && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-red-500">SALE</span>
                    )}
                    {i === 0 && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: grad }}>NEW</span>}
                  </div>
                  <div className="p-4">
                    {p.category && <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: primary }}>{p.category}</p>}
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight line-clamp-2">{p.name}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {p.salePrice && p.price && p.salePrice < p.price ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base" style={{ color: primary }}>${p.salePrice}</span>
                            <span className="text-xs text-gray-400 line-through">${p.price}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-base text-gray-900">{p.price ? `$${p.price}` : "Inquire"}</span>
                        )}
                      </div>
                      <button
                        onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                        className="p-2 rounded-full text-white transition-all hover:scale-110"
                        style={{ background: grad }}>
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No products — show services as cards */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(services?.items || []).map((s: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
                  {(s.image || images[i]) && (
                    <img src={s.image || images[i]} alt={s.title} className="w-full h-52 object-cover" />
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About / Brand Story ── */}
      {about && (
        <section id="about" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>Our Story</p>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                  {about.title || `About ${brandName}`}
                </h2>
                <div className="space-y-4">
                  {(about.description || "").split("\n\n").filter(Boolean).map((para: string, i: number) => (
                    <p key={i} className="text-gray-600 text-lg leading-relaxed">{para}</p>
                  ))}
                </div>
                <button
                  onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
                  className="mt-8 flex items-center gap-2 font-semibold text-sm transition-all duration-200 hover:gap-4"
                  style={{ color: primary }}>
                  Explore the Collection <ArrowRight size={16} />
                </button>
              </div>
              <div className="relative">
                <img
                  src={about.image || images[0] || hero?.image || ""}
                  alt="About"
                  className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl shadow-xl overflow-hidden">
                  <img src={images[1] || images[0] || hero?.image || ""} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl shadow-xl overflow-hidden">
                  <img src={images[2] || images[0] || hero?.image || ""} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery / Lookbook ── */}
      {images.length >= 3 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                Lookbook &amp; <span className="bg-clip-text text-transparent" style={{ backgroundImage: grad }}>Gallery</span>
              </h2>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.slice(0, 8).map((src: string, i: number) => (
                <div key={i} className={`break-inside-avoid overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 ${i % 3 === 0 ? "aspect-square" : "aspect-[3/4]"}`}>
                  <img src={src} alt={`gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {testimonials?.items?.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                What Our <span className="bg-clip-text text-transparent" style={{ backgroundImage: grad }}>Clients Say</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.items.map((t: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.author} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: grad }}>
                        {t.author?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                      {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Lead Capture / Contact ── */}
      <section id="contact" className="py-24" style={{ background: `linear-gradient(135deg, #0f0a14 0%, #1a0a1c 100%)` }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {leadStatus === 'success' ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold" style={{ background: grad }}>✓</div>
              <h2 className="text-3xl font-bold text-white mb-3">{leadCopy.successTitle}</h2>
              <p className="text-white/60 text-lg max-w-md mx-auto mb-8">{leadCopy.successMessage}</p>
              <button onClick={() => { setLeadStatus('idle'); setLeadForm({ name: '', email: '', phone: '', message: '' }); }}
                className="px-8 py-3 rounded-full font-semibold text-white border border-white/20 hover:bg-white/10 transition-all">
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left — copy + contact info */}
              <div className="lg:pt-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>{leadCopy.eyebrow}</p>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
                  {leadCopy.heading}
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-10">{leadCopy.subheading}</p>

                <div className="space-y-4">
                  {contact?.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-4 group">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: grad }}>
                        <Phone size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Call Us</p>
                        <p className="text-white font-semibold text-sm group-hover:underline">{contact.phone}</p>
                      </div>
                    </a>
                  )}
                  {contact?.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-4 group">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: grad }}>
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Email</p>
                        <p className="text-white font-semibold text-sm group-hover:underline">{contact.email}</p>
                      </div>
                    </a>
                  )}
                  {(contact?.address || contact?.city) && (
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: grad }}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Visit Us</p>
                        <p className="text-white font-semibold text-sm">{[contact.address, contact.city].filter(Boolean).join(", ")}</p>
                      </div>
                    </div>
                  )}
                </div>

                {footer?.socialLinks && (
                  <div className="flex gap-3 mt-8">
                    {footer.socialLinks.instagram && (
                      <a href={footer.socialLinks.instagram} target="_blank" rel="noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/8 border border-white/10 hover:border-pink-500/40 text-white/50 hover:text-white transition-all">
                        <Instagram size={17} />
                      </a>
                    )}
                    {footer.socialLinks.facebook && (
                      <a href={footer.socialLinks.facebook} target="_blank" rel="noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/8 border border-white/10 hover:border-blue-500/40 text-white/50 hover:text-white transition-all">
                        <Facebook size={17} />
                      </a>
                    )}
                    {footer.socialLinks.twitter && (
                      <a href={footer.socialLinks.twitter} target="_blank" rel="noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/8 border border-white/10 text-white/50 hover:text-white transition-all">
                        <Twitter size={17} />
                      </a>
                    )}
                    {footer.socialLinks.linkedin && (
                      <a href={footer.socialLinks.linkedin} target="_blank" rel="noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/8 border border-white/10 text-white/50 hover:text-white transition-all">
                        <Linkedin size={17} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right — lead form */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                {siteId ? (
                  <form onSubmit={handleLeadSubmit} className="space-y-5">
                    <h3 className="text-lg font-bold text-white mb-1">{leadCopy.submitLabel === 'Send Enquiry' ? 'Your Enquiry' : 'Your Details'}</h3>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-widest mb-2">Full Name *</label>
                      <input
                        required
                        value={leadForm.name}
                        onChange={e => setLeadForm(p => ({ ...p, name: e.target.value }))}
                        placeholder={leadCopy.namePlaceholder}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-widest mb-2">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={leadForm.email}
                        onChange={e => setLeadForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-widest mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={e => setLeadForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-widest mb-2">Message</label>
                      <textarea
                        rows={4}
                        value={leadForm.message}
                        onChange={e => setLeadForm(p => ({ ...p, message: e.target.value }))}
                        placeholder={leadCopy.messagePlaceholder}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/40 transition-colors resize-none"
                      />
                    </div>
                    {leadStatus === 'error' && (
                      <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                    )}
                    <button
                      type="submit"
                      disabled={leadStatus === 'submitting'}
                      className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: grad }}>
                      {leadStatus === 'submitting' ? 'Sending…' : leadCopy.submitLabel}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/50 text-sm">Contact us directly using the details on the left.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black text-white py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {brand?.logo ? (
              <img src={brand.logo} alt={brandName} className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: grad }}>
                {brandName.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-sm">{brandName}</span>
          </div>
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            {["About", "Shop", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
