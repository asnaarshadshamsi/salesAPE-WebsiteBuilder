"use client";

/**
 * FoodTemplate – URL-scraper template for restaurants, cafes, bakeries & catering.
 * Warm, rich, food-photography-first design.
 */

import React, { useState } from "react";
import type { BusinessData } from "../types/landing";
import { createLead } from "@/actions/leads";
import {
  Phone, Mail, MapPin, Clock, Star, Instagram, Facebook, Menu, X,
  ChefHat, Utensils, Heart, ArrowRight, Flame,
} from "lucide-react";

interface Props { data: BusinessData; siteId?: string }

function getFoodLeadCopy(businessType: string, brandName?: string) {
  const name = brandName || 'us';
  const map: Record<string, { eyebrow: string; heading: string; subheading: string; messagePlaceholder: string; submitLabel: string; successTitle: string; successMessage: string }> = {
    restaurant: { eyebrow: 'Reservations', heading: 'Reserve Your Table', subheading: "Join us for an unforgettable dining experience. We'd love to have you.", messagePlaceholder: 'Party size, preferred date/time, or any special occasion & dietary requirements…', submitLabel: 'Reserve Table', successTitle: 'Reservation Received!', successMessage: "We'll confirm your table shortly." },
    cafe: { eyebrow: 'Order or Enquiry', heading: 'Drop Us a Message', subheading: "Questions, bulk orders, or just want to say hello? We're here.", messagePlaceholder: 'Your message or order details…', submitLabel: 'Send Message', successTitle: 'Message Sent!', successMessage: "We'll get back to you shortly." },
    bakery: { eyebrow: 'Custom Order', heading: 'Order a Custom Cake', subheading: "Birthdays, weddings, celebrations — let us bake something special just for you.", messagePlaceholder: 'Describe your cake — flavour, design, occasion and required date…', submitLabel: 'Place Order', successTitle: 'Order Placed!', successMessage: 'Our bakers will be in touch to confirm your order.' },
    catering: { eyebrow: 'Catering Enquiry', heading: 'Catering for Your Event', subheading: "From intimate dinners to large corporate events — let's make your occasion delicious.", messagePlaceholder: 'Event date, number of guests, cuisine preferences…', submitLabel: 'Request a Quote', successTitle: 'Enquiry Received!', successMessage: 'Our team will send you a personalised quote within 24 hours.' },
  };
  return map[businessType] || { eyebrow: 'Get in Touch', heading: `Visit ${name}`, subheading: "We'd love to welcome you. Drop us a message anytime.", messagePlaceholder: 'Party size, preferred date/time, or any other enquiry…', submitLabel: 'Send Message', successTitle: 'Message Sent!', successMessage: "We'll get back to you shortly." };
}

export default function FoodTemplate({ data, siteId }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { brand, hero, about, services, testimonials, contact, footer, nav, galleryImages } = data as any;

  const primary = brand?.primaryColor || "#ea580c";
  const secondary = brand?.secondaryColor || "#f97316";
  const grad = `linear-gradient(135deg, ${primary}, ${secondary})`;

  // Sanitise brand name: decode HTML entities and strip page-title separators
  const rawBrandName: string = brand?.name || "";
  const brandName = rawBrandName
    .replace(/&ndash;/gi, "\u2013").replace(/&mdash;/gi, "\u2014").replace(/&amp;/gi, "&")
    .replace(/\s*[\u2013\u2014|\u00b7:]{1,2}\s*.+$/, "")
    .replace(/\s+-\s+.+$/, "")
    .trim() || rawBrandName;

  const images: string[] = galleryImages || [];
  // nav.links may be string[] or { label: string; href?: string }[] — normalise to string[]
  const rawNavLinks: unknown[] = nav?.links || ["Home", "Menu", "About", "Gallery", "Contact"];
  const navLinks: string[] = rawNavLinks.map((l: unknown) =>
    typeof l === "string" ? l : (l as any)?.label || (l as any)?.text || String(l)
  );

  const menuItems = services?.items || [];

  // Lead form
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const foodBusinessType = ((brand?.businessType || '') as string).toLowerCase();
  // Use AI-generated lead form copy if available, fall back to static type-based copy
  const leadCopy = (data.leadForm?.heading)
    ? {
        eyebrow:            data.leadForm.eyebrow            || 'Reservations',
        heading:            data.leadForm.heading,
        subheading:         data.leadForm.subheading          || '',
        messagePlaceholder: data.leadForm.messagePlaceholder  || 'Party size, preferred date/time…',
        submitLabel:        data.leadForm.submitLabel          || 'Send Message',
        successTitle:       data.leadForm.successTitle         || 'Message Sent!',
        successMessage:     data.leadForm.successMessage       || "We'll be in touch shortly.",
      }
    : getFoodLeadCopy(foodBusinessType, brandName);

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
    <div className="min-h-screen bg-[#faf9f7] font-sans">

      {/* ── Sticky Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#1a0f07]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            {brand?.logo ? (
              <img src={brand.logo} alt={brandName} className="h-9 w-auto object-contain max-w-[180px]" />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: grad }}>
                  <ChefHat size={18} />
                </div>
                <span className="text-xl font-bold text-white tracking-tight truncate">{brandName}</span>
              </>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link: string) => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors tracking-wide">
                {link}
              </a>
            ))}
          </div>

          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{ background: grad }}>
            Reserve Table
          </button>

          <button className="md:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-[#1a0f07] border-t border-white/10 px-6 py-4 space-y-3">
            {navLinks.map((link: string) => (
              <a key={link} href={`#${link.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="block text-white/80 font-medium py-1.5 hover:text-orange-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="home" className="relative min-h-screen flex items-end overflow-hidden">
        {hero?.image ? (
          <div className="absolute inset-0">
            <img src={hero.image} alt="hero" className="w-full h-full object-cover" />
            {/* Bottom gradient for text legibility */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to top, rgba(15,8,2,0.92) 0%, rgba(15,8,2,0.55) 45%, rgba(15,8,2,0.15) 100%)"
            }} />
          </div>
        ) : (
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, #1c0a02 0%, #2d1307 50%, #1c0a02 100%)"
          }}>
            <div className="absolute inset-0 opacity-40"
              style={{ backgroundImage: `radial-gradient(ellipse 60% 55% at 50% 40%, ${primary}60, transparent 65%)` }} />
          </div>
        )}

        {/* Floating dishes graphic dots */}
        <div className="absolute top-1/4 right-16 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute top-1/3 right-24 w-40 h-40 rounded-full border border-white/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20 pt-40 w-full">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[brand?.businessType || "Restaurant", "Est. " + new Date().getFullYear(), brand?.tagline?.split(" ")[0]].filter(Boolean).map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border border-white/15 text-white/60 bg-white/5">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-[1.05] tracking-tight">
            {hero?.headline || brandName}
          </h1>
          <p className="text-xl text-white/65 max-w-xl mb-10 leading-relaxed">
            {hero?.subheadline || brand?.tagline || "Where every dish tells a story."}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3.5 rounded-full font-bold text-white flex items-center gap-2 shadow-2xl hover:scale-105 transition-all duration-300"
              style={{ background: grad }}>
              <Utensils size={16} /> View Menu
            </button>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3.5 rounded-full font-semibold text-white flex items-center gap-2 border-2 border-white/25 hover:bg-white/10 transition-all duration-300">
              Reserve a Table <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs">
          <span className="tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* ── Features strip ── */}
      <div className="bg-[#1a0f07]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-wrap justify-center divide-x divide-white/10">
            {[
              { icon: <Flame size={15} />, label: "Fresh Ingredients" },
              { icon: <Heart size={15} />, label: "Made with Love" },
              { icon: <ChefHat size={15} />, label: "Expert Chefs" },
              { icon: <Utensils size={15} />, label: "Signature Dishes" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-8 py-2 text-white/50 text-xs font-semibold uppercase tracking-wider">
                <span style={{ color: primary }}>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu / Signature Dishes ── */}
      {menuItems.length > 0 && (
        <section id="menu" className="py-24 bg-[#faf9f7]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>
                {services?.eyebrow || "Handcrafted With Passion"}
              </p>
              {services?.title ? (
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                  {services.title}
                </h2>
              ) : (
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                  Our <span className="italic" style={{ backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                    Signature
                  </span> Menu
                </h2>
              )}
              <p className="text-gray-500 max-w-lg mx-auto">
                {services?.subtitle || "Every dish is crafted with care to delight your senses."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems.map((item: any, i: number) => (
                <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-400 hover:-translate-y-1.5 border border-amber-50">
                  <div className="overflow-hidden aspect-video">
                    <img
                      src={item.image || images[i % Math.max(images.length, 1)] || hero?.image || ""}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.title}</h3>
                      {item.price && (
                        <span className="text-lg font-black shrink-0 ml-2" style={{ color: primary }}>
                          {typeof item.price === "number" ? `$${item.price}` : item.price}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                        {item.description &&
                         !item.description.toLowerCase().includes('solutions tailored to your needs') &&
                         !item.description.toLowerCase().includes('personalized solutions') &&
                         !item.description.toLowerCase().includes('complete satisfaction')
                          ? item.description
                          : `Enjoy our ${item.title.toLowerCase()} — crafted to deliver an exceptional dining experience every time.`}
                      </p>
                    {i === 0 && (
                      <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${primary}15`, color: primary }}>
                        ⭐ Chef's Special
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About ── */}
      {about && (
        <section id="about" className="py-24" style={{ background: "#fff8f3" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <img
                  src={about.image || images[0] || hero?.image || ""}
                  alt="About"
                  className="w-full h-[520px] object-cover rounded-3xl shadow-2xl"
                />
                {/* Decorative overlay card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 flex items-center gap-4 max-w-[220px]">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: grad }}>
                    <ChefHat size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Experience</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">Authentic Flavors, Timeless Recipes</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>Our Story</p>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                  {about.title || `A Passion for${'\n'}Great Food`}
                </h2>
                <div className="space-y-4">
                  {(about.description || "")
                    .split(/\n\n|\n/)
                    .map((p: string) => p.trim())
                    .filter((p: string) => {
                      if (!p || p.length < 20) return false;
                      // Drop lines that are clearly scraped nav / CTA noise
                      const noise = [
                        'order now', 'download now', 'learn more', 'browse our menu',
                        'order online', 'find out', 'view menu', 'sign in', 'sign up',
                        'privacy policy', 'terms', 'cookie', '[…]', 'mcdelivery',
                        'mccafé', 'mccafe', 'our app', 'trending now', 'careers',
                      ];
                      return !noise.some(n => p.toLowerCase().includes(n));
                    })
                    .slice(0, 4)
                    .map((para: string, i: number) => (
                      <p key={i} className="text-gray-600 text-lg leading-relaxed">{para}</p>
                    ))}
                </div>
                {/* Values */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: <Flame size={18} />, title: "Fresh Daily", desc: "Ingredients sourced every morning" },
                    { icon: <Heart size={18} />, title: "Family Recipes", desc: "Passed down through generations" },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="bg-white rounded-2xl p-4 border border-orange-50 shadow-sm">
                      <div className="mb-2" style={{ color: primary }}>{icon}</div>
                      <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
                      <p className="text-gray-400 text-xs">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ── */}
      {images.length >= 2 && (
        <section id="gallery" className="py-20 bg-[#faf9f7]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                Inside Our <span className="italic" style={{ backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Kitchen</span>
              </h2>
            </div>
            {/* Mosaic layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[160px]">
              {images.slice(0, 6).map((src: string, i: number) => {
                const isWide = i === 0 || i === 5;
                return (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-2xl ${isWide ? "col-span-2" : "col-span-1"} row-span-1`}
                  >
                    <img src={src} alt={`gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {testimonials?.items?.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Guest <span className="italic" style={{ backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Reviews</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.items.map((t: any, i: number) => (
                <div key={i} className="bg-[#faf9f7] rounded-2xl p-6 border border-orange-50">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.author} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: grad }}>
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
      <section id="contact" className="py-24" style={{ background: "#1a0f07" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {leadStatus === 'success' ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold" style={{ background: grad }}>✓</div>
              <h2 className="text-3xl font-bold text-white mb-3">{leadCopy.successTitle}</h2>
              <p className="text-white/55 text-lg max-w-md mx-auto mb-8">{leadCopy.successMessage}</p>
              <button onClick={() => { setLeadStatus('idle'); setLeadForm({ name: '', email: '', phone: '', message: '' }); }}
                className="px-8 py-3 rounded-full font-semibold text-white border border-white/20 hover:bg-white/10 transition-all">
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left */}
              <div className="lg:pt-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>{leadCopy.eyebrow}</p>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">{leadCopy.heading}</h2>
                <p className="text-white/55 text-lg leading-relaxed mb-10">{leadCopy.subheading}</p>

                <div className="space-y-4">
                  {contact?.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-4 group">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: grad }}>
                        <Phone size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Call for Reservations</p>
                        <p className="font-semibold text-white text-sm group-hover:underline">{contact.phone}</p>
                      </div>
                    </a>
                  )}
                  {contact?.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-4 group">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: grad }}>
                        <Mail size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Email Us</p>
                        <p className="font-semibold text-white text-sm group-hover:underline">{contact.email}</p>
                      </div>
                    </a>
                  )}
                  {(contact?.address || contact?.city) && (
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: grad }}>
                        <MapPin size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Find Us</p>
                        <p className="font-semibold text-white text-sm">{[contact.address, contact.city].filter(Boolean).join(", ")}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/40 text-xs mt-8">
                  <Clock size={13} /> Open for dine-in, takeaway &amp; catering
                </div>

                {footer?.socialLinks && (
                  <div className="flex gap-3 mt-6">
                    {footer.socialLinks.instagram && (
                      <a href={footer.socialLinks.instagram} target="_blank" rel="noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                        <Instagram size={17} />
                      </a>
                    )}
                    {footer.socialLinks.facebook && (
                      <a href={footer.socialLinks.facebook} target="_blank" rel="noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                        <Facebook size={17} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right — lead form */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                {siteId ? (
                  <form onSubmit={handleLeadSubmit} className="space-y-5">
                    <h3 className="text-lg font-bold text-white mb-1">{leadCopy.submitLabel === 'Reserve Table' ? 'Your Reservation Details' : 'Your Details'}</h3>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-widest mb-2">Full Name *</label>
                      <input
                        required
                        value={leadForm.name}
                        onChange={e => setLeadForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
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

      {/* ── Footer bar ── */}
      <footer style={{ background: "#0f0802" }} className="text-white py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-sm">{brandName}</span>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            {["Menu", "About", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
