"use client";

import React from "react";
import { TemplateProps } from "./types";
import { Button, Input, Textarea } from "@/components/ui";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Send,
  Star,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Dribbble,
  Palette,
  Layers,
  Zap,
  Target,
  ArrowUpRight,
  Code,
  PenTool,
  Monitor,
} from "lucide-react";

export function AgencyTemplate({
  site,
  business,
  products,
  formState,
  formData,
  onFormChange,
  onFormSubmit,
}: TemplateProps) {
  const hasProducts = products && products.length > 0;
  const hasGallery = business.galleryImages && business.galleryImages.length > 0;
  
  // Use business colors or fallback to purple/pink
  const primaryColor = business.primaryColor || '#8b5cf6';
  const secondaryColor = business.secondaryColor || '#ec4899';
  
  // Convert hex to RGB for opacity usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 };
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Agency/Studio Style */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-black via-gray-900 to-black">
          <div 
            className="absolute top-0 left-1/4 w-125 h-125 rounded-full blur-[120px] animate-pulse"
            style={{ backgroundColor: `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` }}
          ></div>
          <div 
            className="absolute bottom-0 right-1/4 w-100 h-100 rounded-full blur-[100px] animate-pulse delay-1000"
            style={{ backgroundColor: `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2)` }}
          ></div>
          <div 
            className="absolute top-1/2 right-0 w-75 h-75 rounded-full blur-[80px] animate-pulse delay-500"
            style={{ backgroundColor: `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` }}
          ></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}></div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 py-6">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`
                  }}
                >
                  <Layers className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold">{business.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#work" className="text-gray-400 hover:text-white transition-colors">Work</a>
              <a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a
                href="#contact"
                className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
              >
                Let's Talk
              </a>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
          <div className="max-w-4xl">
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-8">
              <div 
                className="w-12 h-px"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                }}
              ></div>
              <span className="text-gray-400 uppercase tracking-widest text-sm">Creative Agency</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1]">
              <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                {site.headline}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
              {site.subheadline || business.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href="#work"
                className="group px-8 py-4 text-white font-semibold rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 0 0 0 rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 25px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 0 rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`;
                }}
              >
                View Our Work
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
              {business.calendlyUrl ? (
                <a
                  href={business.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-gray-700 text-white hover:border-gray-500 hover:bg-white/5 font-semibold rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book a Call
                </a>
              ) : (
                <a
                  href="#contact"
                  className="px-8 py-4 border border-gray-700 text-white hover:border-gray-500 hover:bg-white/5 font-semibold rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Start a Project
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-linear-to-b from-gray-500 to-transparent"></div>
        </div>
      </section>

      {/* Services Section */}
      {site.features && site.features.length > 0 && (
        <section id="services" className="py-32 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
              <div>
              <p 
                className="font-medium uppercase tracking-widest mb-4"
                style={{ color: primaryColor }}
              >
                What We Do
              </p>
                <h2 className="text-5xl font-bold">
                  Services & Capabilities
                </h2>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                We bring together design, technology, and strategy to create digital experiences that drive results and inspire action.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {site.features.slice(0, 4).map((feature, idx) => {
                const [isHovered, setIsHovered] = React.useState(false);
                return (
                  <div
                    key={idx}
                    className="group p-8 rounded-2xl border bg-gray-900/50 hover:bg-gray-900 transition-all"
                    style={{
                      borderColor: isHovered ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)` : 'rgb(31, 41, 55)',
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all"
                      style={{
                        background: isHovered 
                          ? `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`
                          : `linear-gradient(to bottom right, rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2), rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2))`
                      }}
                    >
                      {idx === 0 && <PenTool className="w-6 h-6 text-white transition-colors" />}
                      {idx === 1 && <Code className="w-6 h-6 text-white transition-colors" />}
                      {idx === 2 && <Monitor className="w-6 h-6 text-white transition-colors" />}
                      {idx === 3 && <Target className="w-6 h-6 text-white transition-colors" />}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature}</h3>
                    <div 
                      className="h-px transition-all duration-500"
                      style={{
                        width: isHovered ? '100%' : '2rem',
                        backgroundColor: primaryColor
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Work/Portfolio Section */}
      {hasProducts && (
        <section id="work" className="py-32 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
              <div>
              <p 
                className="font-medium uppercase tracking-widest mb-4"
                style={{ color: primaryColor }}
              >
                Selected Work
              </p>
                <h2 className="text-5xl font-bold">Our Portfolio</h2>
              </div>
              <a
                href="#contact"
                className="mt-6 md:mt-0 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                Start Your Project <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {products.map((project, idx) => (
                <div
                  key={project.id}
                  className={`group relative overflow-hidden rounded-2xl ${idx === 0 ? "md:col-span-2 h-125" : "h-100"}`}
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`,
                        opacity: 0.8
                      }}
                    >
                      <Palette className="w-24 h-24 text-white/20" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <p 
                        className="text-sm font-medium mb-2"
                        style={{ color: primaryColor }}
                      >
                        {project.category || "Project"}
                      </p>
                      <h3 className="text-2xl font-bold mb-2">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-400 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Corner Badge */}
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {hasGallery && (
        <section className="py-32 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p 
                className="font-medium uppercase tracking-widest mb-4"
                style={{ color: primaryColor }}
              >
                Gallery
              </p>
              <h2 className="text-5xl font-bold">Visual Showcase</h2>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {business.galleryImages.map((image, idx) => (
                <div
                  key={idx}
                  className="break-inside-avoid group relative overflow-hidden rounded-xl"
                >
                  <img
                    src={image}
                    alt={`Gallery image ${idx + 1}`}
                    className="w-full h-auto rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                    style={{
                      background: `linear-gradient(to top, rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3), transparent)`
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About/Stats Section */}
      <section id="about" className="py-32 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p 
                className="font-medium uppercase tracking-widest mb-4"
                style={{ color: primaryColor }}
              >
                About Us
              </p>
              <h2 className="text-5xl font-bold mb-6">
                {business.name}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {business.description || site.aboutText || "We're a creative agency passionate about crafting unique digital experiences. Our team combines strategy, design, and technology to help brands stand out in the digital landscape."}
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div 
                    className="text-5xl font-bold bg-clip-text text-transparent"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    100+
                  </div>
                  <div className="text-gray-500 mt-2">Projects Delivered</div>
                </div>
                <div>
                  <div 
                    className="text-5xl font-bold bg-clip-text text-transparent"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    50+
                  </div>
                  <div className="text-gray-500 mt-2">Happy Clients</div>
                </div>
                <div>
                  <div 
                    className="text-5xl font-bold bg-clip-text text-transparent"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    5+
                  </div>
                  <div className="text-gray-500 mt-2">Years Experience</div>
                </div>
                <div>
                  <div 
                    className="text-5xl font-bold bg-clip-text text-transparent"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    15+
                  </div>
                  <div className="text-gray-500 mt-2">Awards Won</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div 
                className="absolute -inset-4 rounded-3xl blur-xl"
                style={{
                  background: `linear-gradient(to right, rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2), rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2))`
                }}
              ></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-8">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-full h-64 object-contain mb-6"
                  />
                ) : business.heroImage ? (
                  <img
                    src={business.heroImage}
                    alt={business.name}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div 
                    className="w-full h-64 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: `linear-gradient(to bottom right, rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.2), rgba(${hexToRgb(secondaryColor).r}, ${hexToRgb(secondaryColor).g}, ${hexToRgb(secondaryColor).b}, 0.2))`
                    }}
                  >
                    <Layers 
                      className="w-24 h-24"
                      style={{ color: `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.5)` }}
                    />
                  </div>
                )}
                
                <div className="flex gap-4">
                  {business.socialLinks?.instagram && (
                    <a 
                      href={business.socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center transition-all"
                      onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks?.twitter && (
                    <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-gray-800 hover:bg-blue-500 flex items-center justify-center transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks?.linkedin && (
                    <a href={business.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-gray-800 hover:bg-blue-700 flex items-center justify-center transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="py-32 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="font-medium uppercase tracking-widest mb-4" style={{ color: primaryColor }}>Client Love</p>
              <h2 className="text-5xl font-bold">What Clients Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-gray-800 bg-gray-900/50"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5"
                        style={{ fill: primaryColor, color: primaryColor }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                      style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">Client</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="font-medium uppercase tracking-widest mb-4" style={{ color: primaryColor }}>Get in Touch</p>
              <h2 className="text-5xl font-bold mb-6">
                Let's Create Something Amazing
              </h2>
              <p className="text-gray-400 text-lg mb-12">
                Ready to bring your vision to life? We'd love to hear about your project and discuss how we can help.
              </p>

              <div className="space-y-6">
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors group"
                  >
                    <div 
                      className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center transition-all"
                      onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email Us</div>
                      <div className="text-lg">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors group"
                  >
                    <div 
                      className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center transition-all"
                      onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Call Us</div>
                      <div className="text-lg">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Visit Us</div>
                      <div className="text-lg">{business.address}{business.city ? `, ${business.city}` : ""}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">Start a Project</h3>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-gray-800 border-gray-700 rounded-lg text-white placeholder:text-gray-500"
                    style={{ '--focus-border-color': primaryColor } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-gray-800 border-gray-700 rounded-lg text-white placeholder:text-gray-500"
                    onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  className="bg-gray-800 border-gray-700 rounded-lg text-white placeholder:text-gray-500"
                  onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
                <Textarea
                  placeholder="Tell us about your project..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-gray-800 border-gray-700 rounded-lg text-white placeholder:text-gray-500"
                  onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full text-white py-4 rounded-lg font-semibold transition-all"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                  }}
                  onMouseEnter={(e) => {
                    const rgb1 = hexToRgb(primaryColor);
                    const rgb2 = hexToRgb(secondaryColor);
                    e.currentTarget.style.background = `linear-gradient(to right, rgb(${Math.max(0, rgb1.r - 20)}, ${Math.max(0, rgb1.g - 20)}, ${Math.max(0, rgb1.b - 20)}), rgb(${Math.max(0, rgb2.r - 20)}, ${Math.max(0, rgb2.g - 20)}, ${Math.max(0, rgb2.b - 20)}))`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`;
                  }}
                >
                  {formState === "loading" ? (
                    "Sending..."
                  ) : formState === "success" ? (
                    "Message Sent! ✓"
                  ) : (
                    <>
                      <Send className="w-5 h-5 inline mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                {formState === "error" && (
                  <p className="text-red-400 text-sm text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-8 h-8 object-contain" />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                >
                  <Layers className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-bold">{business.name}</span>
            </div>
            <div className="text-gray-500 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
              <p className="mt-1">
                Powered by{" "}
                <a 
                  href="/" 
                  className="transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => {
                    const rgb = hexToRgb(primaryColor);
                    e.currentTarget.style.color = `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`;
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.color = primaryColor}
                >
                  Hack Squad
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
