"use client";

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
  Home,
  Building,
  Key,
  DollarSign,
  Bed,
  Bath,
  Square,
  ChevronRight,
} from "lucide-react";

export function RealEstateTemplate({
  site,
  business,
  products,
  formState,
  formData,
  onFormChange,
  onFormSubmit,
}: TemplateProps) {
  const hasProducts = products && products.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Real Estate Style */}
      <section
        className="relative min-h-screen flex items-center"
        style={{
          background: business.heroImage
            ? `linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 50%, rgba(15,23,42,0.4) 100%), url(${business.heroImage}) center/cover`
            : `linear-gradient(135deg, ${business.primaryColor} 0%, ${business.secondaryColor} 100%)`,
        }}
      >
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 py-6">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-12 h-12 object-contain rounded-lg bg-white/10 backdrop-blur p-1"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-white">{business.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#properties" className="text-white/80 hover:text-white transition-colors">Properties</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-amber-400">
                  <Phone className="w-4 h-4" />
                  {business.phone}
                </a>
              )}
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur border border-amber-500/30 rounded-full text-amber-400 text-sm mb-6">
              <Key className="w-4 h-4" />
              Your Dream Home Awaits
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {site.headline}
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {site.subheadline || business.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#properties"
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                View Properties
              </a>
              {business.calendlyUrl ? (
                <a
                  href={business.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-white/30 text-white hover:bg-white/10 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Viewing
                </a>
              ) : (
                <a
                  href="#contact"
                  className="px-8 py-4 border border-white/30 text-white hover:bg-white/10 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Contact Agent
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">500+</div>
                <div className="text-sm text-slate-400">Properties Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">15+</div>
                <div className="text-sm text-slate-400">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">98%</div>
                <div className="text-sm text-slate-400">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">50M+</div>
                <div className="text-sm text-slate-400">In Sales Volume</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      {hasProducts && (
        <section id="properties" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <p className="text-amber-500 font-semibold uppercase tracking-wider mb-2">Featured Listings</p>
                <h2 className="text-4xl font-bold text-slate-900">
                  Available Properties
                </h2>
              </div>
              <a href="#contact" className="mt-4 md:mt-0 text-amber-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View All Listings <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((property) => (
                <div
                  key={property.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100"
                >
                  <div className="relative h-64 overflow-hidden">
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <Home className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                    {property.featured && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-slate-900 text-sm font-semibold rounded-full">
                        Featured
                      </div>
                    )}
                    {property.price && (
                      <div className="absolute bottom-4 left-4 px-4 py-2 bg-slate-900/90 backdrop-blur text-white font-bold rounded-lg">
                        ${property.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{property.name}</h3>
                    {property.description && (
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">{property.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-slate-600 text-sm border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>3 Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>2 Baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>1,500 sqft</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About/Services Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-500 font-semibold uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Your Trusted Real Estate Partner
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {business.description || site.aboutText || "We're dedicated to helping you find the perfect property. With years of experience and local expertise, we make buying and selling real estate simple and stress-free."}
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {site.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Key className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{feature}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-amber-200/50 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  {business.logo ? (
                    <img src={business.logo} alt={business.name} className="w-16 h-16 rounded-xl object-contain" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-amber-500 flex items-center justify-center">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{business.name}</h3>
                    <p className="text-slate-500">Licensed Real Estate Professionals</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {business.phone && (
                    <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-slate-700 hover:text-amber-600 transition-colors">
                      <Phone className="w-5 h-5" />
                      {business.phone}
                    </a>
                  )}
                  {business.email && (
                    <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-slate-700 hover:text-amber-600 transition-colors">
                      <Mail className="w-5 h-5" />
                      {business.email}
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <MapPin className="w-5 h-5" />
                      {business.address}{business.city ? `, ${business.city}` : ""}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
                  {business.socialLinks?.facebook && (
                    <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks?.instagram && (
                    <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks?.linkedin && (
                    <a href={business.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-700 hover:text-white flex items-center justify-center transition-colors">
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
        <section className="py-24 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-amber-400 font-semibold uppercase tracking-wider mb-2">Testimonials</p>
              <h2 className="text-4xl font-bold text-white">What Our Clients Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-2xl"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">Verified Client</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-amber-500 font-semibold uppercase tracking-wider mb-2">Get in Touch</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Ready to Find Your Dream Home?
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Contact us today to schedule a viewing or discuss your real estate needs. We're here to help you every step of the way.
              </p>

              <div className="space-y-6">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-slate-700 hover:text-amber-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-amber-100 group-hover:bg-amber-500 flex items-center justify-center transition-colors">
                      <Phone className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Call Us</div>
                      <div className="font-semibold text-lg">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-slate-700 hover:text-amber-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-amber-100 group-hover:bg-amber-500 flex items-center justify-center transition-colors">
                      <Mail className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Email Us</div>
                      <div className="font-semibold text-lg">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-slate-700">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Visit Our Office</div>
                      <div className="font-semibold text-lg">{business.address}{business.city ? `, ${business.city}` : ""}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 p-10 rounded-2xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h3>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-slate-200 focus:border-amber-400 rounded-lg"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-white border-slate-200 focus:border-amber-400 rounded-lg"
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  className="bg-white border-slate-200 focus:border-amber-400 rounded-lg"
                />
                <Textarea
                  placeholder="Tell us about your real estate needs..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-white border-slate-200 focus:border-amber-400 rounded-lg"
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-4 rounded-lg font-semibold"
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
                  <p className="text-red-500 text-sm text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Building className="w-5 h-5 text-slate-900" />
                </div>
              )}
              <span className="text-xl font-bold">{business.name}</span>
            </div>
            <div className="text-slate-400 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
              <p className="mt-1">
                Powered by{" "}
                <a href="/" className="text-amber-400 hover:text-amber-300 transition-colors">
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
