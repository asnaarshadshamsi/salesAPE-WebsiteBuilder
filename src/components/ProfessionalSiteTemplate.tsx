/**
 * Professional Website Template System
 * Premium, conversion-focused designs for all business types
 * Includes: Hero, About, Services, Products, Gallery, Testimonials, Booking/Contact Form, Footer
 */

"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import {
  Star, Phone, Mail, MapPin, Clock, ChevronRight, Check, Quote,
  Heart, Instagram, Facebook, Twitter, Linkedin, Menu, X, Play,
  Award, Shield, Zap, Send, User, Calendar, MessageSquare,
} from "lucide-react";
import { BusinessType } from "@/types/business";
import { generateBusinessTheme, getBusinessTypeClasses, BusinessTypeTheme } from "@/lib/theme";
import BusinessImageService from "@/services/business-image.service";
import EnhancedContentGenerator from "@/services/enhanced-content-generator.service";

// ── Interfaces ───────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  salePrice: number | null;
  image: string | null;
  category: string | null;
  featured: boolean;
}

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
  image?: string;
  role?: string;
}

interface ServiceDescription {
  name: string;
  description: string;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  dribbble?: string;
}

export interface ProfessionalSiteTemplateProps {
  site: {
    id: string;
    slug?: string;
    headline: string;
    subheadline: string | null;
    aboutText: string | null;
    ctaText: string;
    features: string[];
    testimonials: Testimonial[];
    variant: "A" | "B";
    tagline?: string | null;
    valuePropositions?: string[];
    serviceDescriptions?: ServiceDescription[];
  };
  business: {
    name: string;
    description: string | null;
    logo: string | null;
    heroImage: string | null;
    galleryImages: string[];
    primaryColor: string;
    secondaryColor: string;
    businessType: string;
    services: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    calendlyUrl: string | null;
    socialLinks: SocialLinks | null;
    openingHours: Record<string, string> | null;
  };
  products: Product[];
}

// ── Booking Form State ───────────────────────────────────────────────────────

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// ── Nav Label helper ─────────────────────────────────────────────────────────

function getNavSubtitle(businessType: string): string {
  const map: Record<string, string> = {
    perfume: 'Luxury Fragrances',
    flowershop: 'Fresh Flowers Daily',
    cafe: 'Premium Coffee',
    spa: 'Wellness & Beauty',
    restaurant: 'Culinary Excellence',
    beauty: 'Beauty & Style',
    fitness: 'Fitness & Wellness',
    gym: 'Strength & Performance',
    yoga: 'Mind & Body Balance',
    jewelry: 'Fine Jewellery',
    photography: 'Visual Storytelling',
    barbershop: 'Expert Grooming',
    dental: 'Dental Excellence',
    hotel: 'Luxury Hospitality',
    law: 'Legal Excellence',
    accounting: 'Financial Expertise',
    healthcare: 'Compassionate Care',
    cleaning: 'Spotless Results',
    petcare: 'Pet Wellbeing',
    events: 'Event Excellence',
    catering: 'Culinary Events',
    tech: 'Technology Solutions',
    startup: 'Innovation Hub',
    consulting: 'Strategic Advisory',
    bakery: 'Artisan Baking',
    realestate: 'Property Experts',
    education: 'Learning Excellence',
    ecommerce: 'Premium Products',
    agency: 'Creative Agency',
  };
  return map[businessType] || 'Professional Service';
}

// ── Service Icons ────────────────────────────────────────────────────────────

const serviceIcons = [
  <Zap key="zap" />, <Heart key="heart" />, <Award key="award" />,
  <Shield key="shield" />, <Star key="star" />, <Check key="check" />,
];

// ── Main Component ────────────────────────────────────────────────────────────

export function ProfessionalSiteTemplate({ site, business, products }: ProfessionalSiteTemplateProps) {
  const [heroImage, setHeroImage] = useState<string>(business.heroImage || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(business.galleryImages || []);
  const [isLoading, setIsLoading] = useState(!business.heroImage || business.galleryImages.length === 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '', email: '', phone: '', service: business.services[0] || '', date: '', time: '', message: '',
  });
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [scrolled, setScrolled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const businessType = business.businessType as BusinessType;

  const theme = useMemo(() =>
    generateBusinessTheme(business.primaryColor, business.secondaryColor, businessType),
    [business.primaryColor, business.secondaryColor, businessType]);

  const classes = useMemo(() => getBusinessTypeClasses(businessType), [businessType]);

  const enhancedContent = useMemo(() => ({
    headline: site.headline || EnhancedContentGenerator.generateHeadline(business.name, businessType),
    subheadline: site.subheadline || EnhancedContentGenerator.generateSubheadline(business.name, businessType),
    aboutText: site.aboutText || EnhancedContentGenerator.generateAboutText(business.name, businessType, business.city || undefined),
    ctaText: site.ctaText || EnhancedContentGenerator.generateCTAText(businessType, 'primary'),
    secondaryCTA: EnhancedContentGenerator.generateCTAText(businessType, 'secondary'),
    serviceDescriptions: site.serviceDescriptions?.length
      ? site.serviceDescriptions
      : EnhancedContentGenerator.generateServiceDescriptions(businessType, business.services),
    valuePropositions: site.valuePropositions?.length
      ? site.valuePropositions
      : EnhancedContentGenerator.generateValuePropositions(business.name, businessType),
    seoDescription: EnhancedContentGenerator.generateSEODescription(business.name, businessType, business.city || undefined),
  }), [site, business, businessType]);

  useEffect(() => {
    async function loadImages() {
      if (!business.heroImage || business.galleryImages.length === 0) {
        try {
          const [newHero, newGallery] = await Promise.all([
            business.heroImage ? Promise.resolve(business.heroImage) : BusinessImageService.getHeroImage(businessType),
            business.galleryImages.length > 0 ? Promise.resolve(business.galleryImages) : BusinessImageService.getGalleryImages(businessType, 8),
          ]);
          if (!business.heroImage) setHeroImage(newHero);
          if (business.galleryImages.length === 0) setGalleryImages(newGallery);
        } catch {
          setHeroImage('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80');
          setGalleryImages([
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadImages();
  }, [businessType, business.heroImage, business.galleryImages]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // ── Form handlers ─────────────────────────────────────────────────────────

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      // Always save the lead first — this triggers owner notification email
      // AND auto-response email to the user (which includes the Calendly booking link if set)
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          preferredDate: formData.date,
          preferredTime: formData.time,
          message: formData.message,
          source: business.calendlyUrl ? 'calendly_form' : 'booking_form',
        }),
      });
      if (res.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', service: business.services[0] || '', date: '', time: '', message: '' });
        // If Calendly is configured, open it so user can pick a slot right away
        if (business.calendlyUrl) {
          window.open(business.calendlyUrl, '_blank');
        }
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Creating your stunning website…</p>
        </div>
      </div>
    );
  }

  const grad = `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
  const navBg = scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-transparent';

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Global Styles ─────────────────────────────────────────────── */}
      <style jsx global>{`
        .gradient-text {
          background: ${grad};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hover-lift {
          transition: transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease;
        }
        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out forwards; }
        .s1{animation-delay:.1s} .s2{animation-delay:.2s}
        .s3{animation-delay:.3s} .s4{animation-delay:.4s} .s5{animation-delay:.5s}
        .underline-hover { position:relative; }
        .underline-hover::after {
          content:''; position:absolute; bottom:-2px; left:0;
          width:0; height:2px;
          background: ${grad};
          transition: width .25s ease;
        }
        .underline-hover:hover::after { width:100%; }
        .glass {
          backdrop-filter: blur(20px);
          background: rgba(255,255,255,0.92);
          border-bottom: 1px solid rgba(255,255,255,0.4);
        }
      `}</style>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
        <div className={`${scrolled ? '' : 'glass'}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">

            {/* Brand */}
            <div className="flex items-center gap-4">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="h-12 w-auto" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: grad }}>
                  <span className="text-white font-bold text-xl">{business.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-xl font-bold text-gray-900">{business.name}</p>
                <p className="text-sm text-gray-500">{getNavSubtitle(businessType)}</p>
              </div>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {['About', 'Services', 'Gallery', 'Contact'].map(item => (
                <a key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-gray-900 font-medium underline-hover transition-colors">
                  {item}
                </a>
              ))}
              {products.length > 0 && (
                <a href="#products" className="text-gray-700 hover:text-gray-900 font-medium underline-hover transition-colors">Products</a>
              )}
              <button
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-full font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ background: grad }}>
                {enhancedContent.ctaText}
              </button>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileMenuOpen(v => !v)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden glass border-t border-white/20 px-6 py-4 space-y-4">
              {['About', 'Services', 'Gallery', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="block text-gray-700 font-medium hover:text-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              {products.length > 0 && (
                <a href="#products" className="block text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}>Products</a>
              )}
              <button
                className="w-full px-6 py-3 rounded-full font-semibold text-white"
                style={{ background: grad }}
                onClick={() => { setMobileMenuOpen(false); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}>
                {enhancedContent.ctaText}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* floating blobs */}
        <div className="absolute top-24 left-8 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm animate-bounce" style={{ animationDuration: '3.5s' }} />
        <div className="absolute bottom-32 right-12 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1s' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl fade-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 backdrop-blur-sm border border-white/25 bg-white/10">
            <span className="text-white/70 text-sm font-medium tracking-wide">Welcome to</span>
            <span className="text-white font-semibold text-sm">{business.name}</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-xl">
            {enhancedContent.headline}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed fade-up s2">
            {enhancedContent.subheadline}
          </p>

          <div className="fade-up s3 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 rounded-full font-bold text-lg text-white shadow-2xl transition-all duration-300 hover:scale-105 group flex items-center gap-2"
              style={{ background: grad }}>
              {enhancedContent.ctaText}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 rounded-full font-semibold text-lg text-white border-2 border-white/40 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 flex items-center gap-2 group">
              <Play size={18} className="group-hover:scale-110 transition-transform" />
              {enhancedContent.secondaryCTA}
            </button>
          </div>

          {/* Trust band */}
          <div className="fade-up s4 mt-16 flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
              <span className="text-sm font-medium">500+ Happy Clients</span>
            </div>
            <div className="flex items-center gap-2"><Shield size={15} /><span className="text-sm font-medium">100% Satisfaction Guaranteed</span></div>
            <div className="flex items-center gap-2"><Award size={15} /><span className="text-sm font-medium">Award-Winning Service</span></div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              About <span className="gradient-text">{business.name}</span>
            </h2>
            <div className="mb-8 space-y-4">
              {enhancedContent.aboutText.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-lg text-gray-600 leading-relaxed">{para}</p>
              ))}
            </div>

            <div className="space-y-3 mb-8">
              {enhancedContent.valuePropositions.map((v, i) => (
                <div key={i} className="flex items-center gap-3 fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: grad }}>
                    <Check size={13} className="text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{v}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ background: grad }}>
              {enhancedContent.ctaText}
            </button>
          </div>

          <div className="relative fade-up s2">
            <img src={galleryImages[0] || heroImage} alt="About" className="w-full h-96 object-cover rounded-3xl shadow-2xl" />
            <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm" />
            <div className="absolute -top-5 -left-5 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm" />
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────── */}
      {enhancedContent.serviceDescriptions.length > 0 && (
        <section id="services" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 fade-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Our <span className="gradient-text">Services</span>
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Comprehensive services crafted with care and expertise
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {enhancedContent.serviceDescriptions.map((svc, i) => (
                <div key={i} className="group hover-lift bg-white rounded-2xl p-8 shadow-md border border-gray-100 group-hover:border-purple-100 transition-all duration-300 fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)` }}>
                    {React.cloneElement(serviceIcons[i % serviceIcons.length] as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, {
                      className: 'w-7 h-7',
                      style: { color: theme.colors.primary },
                    })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-3">{svc.name}</h3>
                  <p className="text-gray-500 text-center leading-relaxed text-sm">{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Products ─────────────────────────────────────────────────── */}
      {products.length > 0 && (
        <section id="products" className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 fade-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Featured <span className="gradient-text">Products</span>
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Explore our carefully curated selection of premium products
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product, i) => (
                <div key={product.id} className="group hover-lift bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image || galleryImages[i % Math.max(galleryImages.length, 1)] || heroImage}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                    {product.featured && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: grad }}>Featured</span>
                    )}
                    {product.salePrice && product.price && product.salePrice < product.price && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500">Sale</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.salePrice && product.price && product.salePrice < product.price ? (
                          <>
                            <span className="font-bold text-lg" style={{ color: theme.colors.primary }}>${product.salePrice}</span>
                            <span className="text-gray-400 text-sm line-through">${product.price}</span>
                          </>
                        ) : (
                          <span className="font-bold text-lg" style={{ color: theme.colors.primary }}>
                            ${product.price ?? product.salePrice}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow hover:shadow-md transition-all duration-300 hover:scale-105"
                        style={{ background: grad }}>
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      {galleryImages.length > 0 && (
        <section id="gallery" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 fade-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Our <span className="gradient-text">Gallery</span>
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">A visual journey through our work</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl hover-lift fade-up"
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  <img src={img} alt={`Gallery ${i + 1}`}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-medium">View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      {site.testimonials.length > 0 && (
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 fade-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                What Our <span className="gradient-text">Clients Say</span>
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">Real experiences from real customers</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {site.testimonials.slice(0, 6).map((t, i) => (
                <div key={i} className="group hover-lift bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <Quote className="w-8 h-8 text-purple-200 mb-4" />
                  <p className="text-gray-600 italic leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: grad }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                      {t.rating && (
                        <div className="flex text-yellow-400 mt-1">
                          {[...Array(t.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Booking / Contact Form ────────────────────────────────────── */}
      <section id="booking" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left — contact info */}
            <div className="fade-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {business.calendlyUrl ? 'Book an Appointment' : 'Get in Touch'}
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Ready to experience the best of {getNavSubtitle(businessType).toLowerCase()}? Fill in your details and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-5 mb-8">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: grad }}>
                      <Phone size={20} className="text-white" />
                    </div>
                    <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p><p className="font-semibold text-gray-800 group-hover:underline">{business.phone}</p></div>
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: grad }}>
                      <Mail size={20} className="text-white" />
                    </div>
                    <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p><p className="font-semibold text-gray-800 group-hover:underline">{business.email}</p></div>
                  </a>
                )}
                {(business.address || business.city) && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: grad }}>
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Address</p><p className="font-semibold text-gray-800">{[business.address, business.city].filter(Boolean).join(', ')}</p></div>
                  </div>
                )}
              </div>

              {/* Opening hours */}
              {business.openingHours && (
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} style={{ color: theme.colors.primary }} />
                    <h4 className="font-semibold text-gray-800">Business Hours</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {Object.entries(business.openingHours).map(([day, hours]) => (
                      <React.Fragment key={day}>
                        <span className="text-gray-500 capitalize">{day}</span>
                        <span className="font-medium text-gray-700 text-right">{hours}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Social links */}
              {business.socialLinks && (
                <div className="flex gap-3 mt-6">
                  {business.socialLinks.instagram && (
                    <a href={business.socialLinks.instagram} target="_blank" rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-100 flex items-center justify-center transition-colors">
                      <Instagram size={18} className="text-gray-600" />
                    </a>
                  )}
                  {business.socialLinks.facebook && (
                    <a href={business.socialLinks.facebook} target="_blank" rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Facebook size={18} className="text-gray-600" />
                    </a>
                  )}
                  {business.socialLinks.twitter && (
                    <a href={business.socialLinks.twitter} target="_blank" rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-sky-100 flex items-center justify-center transition-colors">
                      <Twitter size={18} className="text-gray-600" />
                    </a>
                  )}
                  {business.socialLinks.linkedin && (
                    <a href={business.socialLinks.linkedin} target="_blank" rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Linkedin size={18} className="text-gray-600" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right — booking form */}
            <div className="fade-up s2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">
                {formStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ background: `linear-gradient(135deg, #22c55e, #16a34a)` }}>
                      <Check size={36} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message received!</h3>
                    <p className="text-gray-500 mb-6">
                      Thanks for reaching out. We&apos;ve sent you a confirmation email and our team will be in touch within 24 hours.
                    </p>
                    {business.calendlyUrl && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-sm text-blue-700 font-medium mb-3">📅 Want to book a time right now?</p>
                        <a
                          href={business.calendlyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 text-sm"
                          style={{ background: grad }}
                        >
                          Open Booking Calendar
                        </a>
                        <p className="text-xs text-blue-500 mt-2">A booking confirmation will be sent to your email automatically.</p>
                      </div>
                    )}
                    <button onClick={() => setFormStatus('idle')}
                      className="px-8 py-3 rounded-full font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all duration-300 text-sm">
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {business.calendlyUrl ? 'Book an Appointment' : 'Send Us a Message'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-8">
                      {business.calendlyUrl
                        ? 'Enter your details below. We\'ll save your enquiry and send you a booking link by email.'
                        : 'Fields marked * are required.'}
                    </p>

                    <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-5">
                      {/* Name & Email */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text" name="name" required placeholder="Full Name *"
                            value={formData.name} onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                            style={{ '--tw-ring-color': theme.colors.primary + '40' } as React.CSSProperties}
                          />
                        </div>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email" name="email" required placeholder="Email Address *"
                            value={formData.email} onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm" />
                        </div>
                      </div>

                      {/* Phone & Service */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel" name="phone" placeholder="Phone Number"
                            value={formData.phone} onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm" />
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="date" name="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.date} onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm" />
                        </div>
                        <div className="relative">
                          <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select name="time" value={formData.time} onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm bg-white appearance-none">
                            <option value="">Preferred Time</option>
                            {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="relative">
                        <MessageSquare size={16} className="absolute left-4 top-4 text-gray-400" />
                        <textarea
                          name="message" rows={4} placeholder="Tell us more about what you need…"
                          value={formData.message} onChange={handleFormChange}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm resize-none" />
                      </div>

                      {formStatus === 'error' && (
                        <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                          Something went wrong. Please try again or contact us directly.
                        </p>
                      )}

                      <button
                        type="submit" disabled={formStatus === 'submitting'}
                        className="w-full py-4 rounded-full font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-3"
                        style={{ background: grad }}>
                        {formStatus === 'submitting' ? (
                          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                        ) : (
                          <><Send size={18} /> {business.calendlyUrl ? 'Confirm & Open Calendar' : 'Send Message'}</>
                        )}
                      </button>

                      <p className="text-xs text-center text-gray-400 mt-2">
                        🔒 Your information is secure and will never be shared with third parties.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky CTA bar ───────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, #1e1b4b, #4c1d95, #831843)` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Experience <br />
            <span className="text-transparent" style={{ background: 'linear-gradient(90deg,#fde68a,#f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Excellence?
            </span>
          </h2>
          <p className="text-white/85 text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Join hundreds of satisfied clients who trust {business.name} for exceptional {getNavSubtitle(businessType).toLowerCase()}.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 rounded-full font-bold text-lg bg-white text-gray-900 hover:bg-gray-100 shadow-2xl transition-all duration-300 hover:scale-105">
              {enhancedContent.ctaText}
            </button>
            {business.phone && (
              <a href={`tel:${business.phone}`}
                className="px-10 py-4 rounded-full font-semibold text-lg text-white border-2 border-white/35 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3">
                <Phone size={20} /> Call {business.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-5">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="h-12 w-auto" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: grad }}>
                  <span className="text-white font-bold text-xl">{business.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold">{business.name}</h3>
                <p className="text-gray-400 text-sm">{enhancedContent.seoDescription}</p>
              </div>
            </div>
            <div className="space-y-3 text-gray-400">
              {business.address && <div className="flex gap-3 items-center"><MapPin size={16} /><span>{business.address}</span></div>}
              {business.phone && <div className="flex gap-3 items-center"><Phone size={16} /><a href={`tel:${business.phone}`} className="hover:text-white transition-colors">{business.phone}</a></div>}
              {business.email && <div className="flex gap-3 items-center"><Mail size={16} /><a href={`mailto:${business.email}`} className="hover:text-white transition-colors">{business.email}</a></div>}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              {['About', 'Services', 'Gallery', 'Contact'].map(l => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a></li>
              ))}
              {products.length > 0 && <li><a href="#products" className="hover:text-white transition-colors">Products</a></li>}
              <li>
                <button onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors text-left">
                  Book Appointment
                </button>
              </li>
            </ul>
          </div>

          {/* Social + Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-5">Connect</h4>
            <div className="flex gap-3 mb-6">
              {business.socialLinks?.instagram && (
                <a href={business.socialLinks.instagram} target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Instagram size={17} />
                </a>
              )}
              {business.socialLinks?.facebook && (
                <a href={business.socialLinks.facebook} target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Facebook size={17} />
                </a>
              )}
              {business.socialLinks?.twitter && (
                <a href={business.socialLinks.twitter} target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Twitter size={17} />
                </a>
              )}
              {business.socialLinks?.linkedin && (
                <a href={business.socialLinks.linkedin} target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Linkedin size={17} />
                </a>
              )}
            </div>
            {business.openingHours && (
              <div>
                <div className="flex items-center gap-2 mb-3 text-gray-300">
                  <Clock size={16} /><span className="font-medium text-sm">Business Hours</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                  {Object.entries(business.openingHours).map(([day, hours]) => (
                    <React.Fragment key={day}>
                      <span className="capitalize">{day}</span>
                      <span>{hours}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} {business.name}. All rights reserved. | Crafted with ❤️ by SalesAPE
        </div>
      </footer>
    </div>
  );
}
