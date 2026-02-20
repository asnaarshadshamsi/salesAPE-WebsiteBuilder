"use client";

/**
 * EcommerceTemplate
 * Purpose-built for fashion, retail, jewelry, perfume, and product-first
 * businesses scraped via URL scraper. Distinct from AI chatbot template.
 */

import React, { useState } from "react";
import { BusinessData } from "../../types/landing";
import {
  ShoppingBag, Star, ChevronRight, Instagram, Facebook, Twitter,
  Linkedin, Mail, Phone, MapPin, Heart, ArrowRight, Menu, X,
  Shield, Truck, RotateCcw, Tag,
} from "lucide-react";

interface EcommerceTemplateProps {
  siteId?: string;
  data: BusinessData;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function hex2rgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EcommerceTemplate({ data, siteId }: EcommerceTemplateProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);

  const primary = data.brand.primaryColor || "#18181b";
  const secondary = data.brand.secondaryColor || "#a1a1aa";
  const rgb = hex2rgb(primary);

  const navLinks = data.nav?.links ?? [
    { label: "Collection", href: "#products" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    if (!siteId) { setFormSent(true); return; }
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, name: formState.name, email: formState.email, message: formState.message, source: "contact_form" }),
      });
    } catch { /* silently continue */ }
    setFormSent(true);
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Announcement bar ─────────────────────────────── */}
      <div className="py-2 text-center text-xs font-medium tracking-widest uppercase text-white"
        style={{ background: primary }}>
        Welcome to {data.brand.name} &nbsp;·&nbsp; Premium Quality Guaranteed
      </div>

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            {data.brand.logo ? (
              <img src={data.brand.logo} alt={data.brand.name} className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold tracking-tight" style={{ color: primary }}>{data.brand.name}</span>
            )}
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#products"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: primary }}>
              <ShoppingBag size={15} /> Shop Now
            </a>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="block text-gray-700 font-medium py-1"
                onClick={() => setMobileOpen(false)}>{l.label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, rgba(${rgb},0.06) 0%, #fff 60%)` }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border"
              style={{ color: primary, borderColor: primary, background: `rgba(${rgb},0.07)` }}>
              {data.brand.tagline || "New Collection Available"}
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {data.hero.headline}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
              {data.hero.subheadline}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105"
                style={{ background: primary }}>
                <ShoppingBag size={18} /> {data.hero.cta?.label || "Shop the Collection"}
              </a>
              <a href="#about"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold border-2 text-gray-700 hover:bg-gray-50 transition-all"
                style={{ borderColor: primary + "40" }}>
                Our Story <ChevronRight size={16} />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-500">
              {[
                { icon: <Truck size={15} />, text: "Free Shipping" },
                { icon: <RotateCcw size={15} />, text: "Easy Returns" },
                { icon: <Shield size={15} />, text: "Secure Checkout" },
              ].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">{t.icon}{t.text}</span>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl rotate-3 opacity-20"
              style={{ background: `linear-gradient(135deg,${primary},${secondary})` }} />
            <img
              src={data.hero.image || data.galleryImages?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"}
              alt={data.brand.name}
              className="relative z-10 w-full h-[480px] object-cover rounded-3xl shadow-2xl"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-5 z-20 bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill={primary} style={{ color: primary }} />)}</div>
                <span className="text-xs font-semibold text-gray-700">Trusted by 1000+ Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category / feature strip ──────────────────── */}
      {data.features?.items && data.features.items.length > 0 && (
        <section className="border-y border-gray-100 py-10" style={{ background: `rgba(${rgb},0.03)` }}>
          <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.features.items.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: primary }}>
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Products ─────────────────────────────────── */}
      {data.products && data.products.items.length > 0 && (
        <section id="products" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {data.products.title || "Our Collection"}
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">{data.products.subtitle || "Explore our carefully curated selection"}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {data.products.items.map((p, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl bg-gray-50 mb-4">
                    <img
                      src={p.image || data.galleryImages?.[i % (data.galleryImages?.length || 1)] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"}
                      alt={p.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.salePrice && p.price && p.salePrice < p.price && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white bg-red-500">SALE</span>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Heart size={14} className="text-gray-600" />
                    </button>
                  </div>
                  <div>
                    {p.category && <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{p.category}</p>}
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:underline">{p.name}</h3>
                    {p.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>}
                    <div className="flex items-center gap-2">
                      {p.salePrice && p.price && p.salePrice < p.price ? (
                        <>
                          <span className="font-bold text-red-500">${p.salePrice}</span>
                          <span className="text-gray-400 line-through text-sm">${p.price}</span>
                        </>
                      ) : p.price ? (
                        <span className="font-bold" style={{ color: primary }}>${p.price}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery strip ──────────────────────────────── */}
      {data.galleryImages && data.galleryImages.length >= 3 && (
        <section className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.galleryImages.slice(0, 4).map((img, i) => (
              <div key={i} className="overflow-hidden aspect-square">
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── About / Brand Story ───────────────────────── */}
      {data.about && (
        <section id="about" className="py-24" style={{ background: `rgba(${rgb},0.04)` }}>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={data.about.image || data.galleryImages?.[1] || data.hero.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"}
                alt="About"
                className="w-full h-[420px] object-cover rounded-3xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: primary }}>Our Story</span>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
                {data.about.title || `About ${data.brand.name}`}
              </h2>
              {data.about.description.split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>
              ))}
              {data.stats?.items && (
                <div className="grid grid-cols-3 gap-5 mt-8 pt-8 border-t border-gray-200">
                  {data.stats.items.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl font-bold" style={{ color: primary }}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Services / Categories ─────────────────────── */}
      {data.services && data.services.items.length > 0 && (
        <section id="services" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.services.title || "What We Offer"}</h2>
              <p className="text-gray-500 max-w-xl mx-auto">{data.services.subtitle || "Discover everything we have to offer"}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.services.items.slice(0, 6).map((s, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white p-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `rgba(${rgb},0.1)` }}>
                    <ShoppingBag size={20} style={{ color: primary }} />
                  </div>
                  {s.image && (
                    <img src={s.image} alt={s.title} className="w-full h-36 object-cover rounded-xl mb-4" />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────── */}
      {data.testimonials && data.testimonials.items.length > 0 && (
        <section className="py-24" style={{ background: `rgba(${rgb},0.04)` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.testimonials.title || "What Our Customers Say"}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.testimonials.items.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="flex mb-4">{[...Array(5)].map((_, j) => <Star key={j} size={14} fill={primary} style={{ color: primary }} />)}</div>
                  <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: primary }}>{t.author.charAt(0)}</div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.author}</p>
                      {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ───────────────────────────────── */}
      {data.cta && (
        <section className="py-20 text-white text-center" style={{ background: `linear-gradient(135deg,${primary},${secondary})` }}>
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-4">{data.cta.title}</h2>
            {data.cta.description && <p className="text-white/80 text-lg mb-8">{data.cta.description}</p>}
            <a href={data.cta.buttonHref || "#products"}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg bg-white hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl"
              style={{ color: primary }}>
              {data.cta.buttonLabel || "Shop Now"} <ArrowRight size={18} />
            </a>
          </div>
        </section>
      )}

      {/* ── Contact ──────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">Have a question about our products or need help with your order? We'd love to hear from you.</p>
            <div className="space-y-4">
              {data.contact?.phone && (
                <a href={`tel:${data.contact.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: primary }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Phone</p>
                    <p className="font-semibold text-gray-800">{data.contact.phone}</p>
                  </div>
                </a>
              )}
              {data.contact?.email && (
                <a href={`mailto:${data.contact.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: primary }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email</p>
                    <p className="font-semibold text-gray-800">{data.contact.email}</p>
                  </div>
                </a>
              )}
              {(data.contact?.address || data.contact?.city) && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: primary }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Address</p>
                    <p className="font-semibold text-gray-800">{[data.contact.address, data.contact.city].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 rounded-3xl p-8">
            {formSent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                  style={{ background: primary }}>✓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h3>
                <input
                  type="text" placeholder="Your Name" required value={formState.name}
                  onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 text-sm"
                  style={{ "--tw-ring-color": primary + "40" } as React.CSSProperties}
                />
                <input
                  type="email" placeholder="Email Address" required value={formState.email}
                  onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 text-sm"
                />
                <textarea
                  placeholder="How can we help you?" rows={4} value={formState.message}
                  onChange={(e) => setFormState((p) => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 text-sm resize-none"
                />
                <button type="submit"
                  className="w-full py-4 rounded-full font-bold text-white transition-all hover:opacity-90"
                  style={{ background: primary }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="text-gray-400 py-12 border-t border-gray-100 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {data.brand.logo ? (
                <img src={data.brand.logo} alt={data.brand.name} className="h-9 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold text-white">{data.brand.name}</span>
              )}
            </div>
            <p className="text-sm leading-relaxed mb-5">{data.footer?.description || data.brand.tagline || "Premium quality products delivered to your door."}</p>
            <div className="flex gap-3">
              {data.footer?.socials?.map(({ platform, href }) => (
                <a key={platform} href={href} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  {platform === "instagram" && <Instagram size={15} />}
                  {platform === "facebook" && <Facebook size={15} />}
                  {platform === "twitter" && <Twitter size={15} />}
                  {platform === "linkedin" && <Linkedin size={15} />}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {(data.footer?.links ?? navLinks).map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-sm">
              {data.contact?.phone && <p>{data.contact.phone}</p>}
              {data.contact?.email && <p>{data.contact.email}</p>}
              {data.contact?.city && <p>{data.contact.city}</p>}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
          {data.footer?.copyright || `© ${new Date().getFullYear()} ${data.brand.name}. All rights reserved.`}
        </div>
      </footer>
    </div>
  );
}
