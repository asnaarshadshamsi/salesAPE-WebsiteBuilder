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
  Clock,
  Sparkles,
  Heart,
  Scissors,
  Flower2,
} from "lucide-react";

export function BeautyTemplate({
  site,
  business,
  products,
  formState,
  formData,
  onFormChange,
  onFormSubmit,
}: TemplateProps) {
  const hasProducts = products && products.length > 0;

  // Group products/services by category
  const serviceCategories = products.reduce((acc, product) => {
    const category = product.category || "Services";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50 to-pink-50">
      {/* Hero Section - Beauty/Salon Style */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: business.heroImage
            ? `linear-gradient(to bottom, rgba(244,114,182,0.3), rgba(251,207,232,0.5)), url(${business.heroImage}) center/cover`
            : `linear-gradient(135deg, ${business.primaryColor}20 0%, ${business.secondaryColor}40 50%, #fce7f3 100%)`,
        }}
      >
        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 animate-pulse">
            <Sparkles className="w-16 h-16 text-pink-300/40" />
          </div>
          <div className="absolute top-40 right-20 animate-pulse delay-300">
            <Heart className="w-12 h-12 text-rose-300/40" />
          </div>
          <div className="absolute bottom-32 left-20 animate-pulse delay-500">
            <Flower2 className="w-20 h-20 text-pink-200/40" />
          </div>
          <div className="absolute bottom-20 right-10 animate-pulse delay-700">
            <Sparkles className="w-14 h-14 text-rose-200/40" />
          </div>
        </div>

        {/* Elegant curved shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full">
            <path
              fill="#fff"
              d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
            />
          </svg>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logo */}
          {business.logo ? (
            <img
              src={business.logo}
              alt={business.name}
              className="w-28 h-28 mx-auto mb-8 rounded-full border-4 border-white shadow-2xl object-contain bg-white p-2"
            />
          ) : (
            <div className="w-28 h-28 mx-auto mb-8 rounded-full border-4 border-white shadow-2xl bg-linear-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Scissors className="w-12 h-12 text-white" />
            </div>
          )}

          <p className="text-pink-600 uppercase tracking-[0.4em] text-sm font-medium mb-3">
            ✨ Welcome to ✨
          </p>
          <h1 className="text-5xl sm:text-7xl font-serif font-bold bg-linear-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-6">
            {business.name}
          </h1>
          <p className="text-xl sm:text-2xl text-pink-700/80 font-light mb-10 max-w-2xl mx-auto">
            {site.headline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#services"
              className="px-8 py-4 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-xl shadow-pink-500/30"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              View Services
            </a>
            {business.calendlyUrl ? (
              <a
                href={business.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-pink-400 text-pink-600 hover:bg-pink-500 hover:text-white hover:border-pink-500 font-semibold rounded-full transition-all shadow-lg"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Book Appointment
              </a>
            ) : (
              <a
                href="#contact"
                className="px-8 py-4 border-2 border-pink-400 text-pink-600 hover:bg-pink-500 hover:text-white hover:border-pink-500 font-semibold rounded-full transition-all shadow-lg"
              >
                <Send className="w-5 h-5 inline mr-2" />
                Get in Touch
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      {(business.description || site.aboutText) && (
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-0.5 bg-linear-to-r from-pink-400 to-rose-400"></div>
                  <span className="text-pink-500 font-medium uppercase tracking-wider text-sm">About Us</span>
                </div>
                <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">
                  Where Beauty Meets Excellence
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  {business.description || site.aboutText}
                </p>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-500">500+</div>
                    <div className="text-sm text-gray-500">Happy Clients</div>
                  </div>
                  <div className="w-px h-12 bg-pink-200"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-500">5★</div>
                    <div className="text-sm text-gray-500">Top Rated</div>
                  </div>
                  <div className="w-px h-12 bg-pink-200"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-500">10+</div>
                    <div className="text-sm text-gray-500">Years Exp</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-linear-to-r from-pink-200 to-rose-200 rounded-3xl blur-xl opacity-50"></div>
                <div className="relative grid grid-cols-2 gap-4">
                  {site.features.slice(0, 4).map((feature, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100"
                    >
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-pink-500" />
                      </div>
                      <p className="font-medium text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services/Menu Section */}
      {hasProducts && (
        <section id="services" className="py-24 bg-linear-to-b from-pink-50 to-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-pink-500 font-medium uppercase tracking-wider mb-2">Our Services</p>
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">
                Treatments & Pricing
              </h2>
              <div className="w-24 h-1 bg-linear-to-r from-pink-400 to-rose-400 mx-auto rounded-full"></div>
            </div>

            {Object.entries(serviceCategories).map(([category, items]) => (
              <div key={category} className="mb-12">
                <h3 className="text-2xl font-serif font-semibold text-pink-600 mb-6 flex items-center gap-3">
                  <Flower2 className="w-6 h-6" />
                  {category}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((service) => (
                    <div
                      key={service.id}
                      className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-pink-100 hover:border-pink-300"
                    >
                      {service.image && (
                        <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800 text-lg">{service.name}</h4>
                        {service.price && (
                          <span className="text-pink-500 font-bold text-lg">
                            ${service.price}
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-gray-500 text-sm">{service.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Opening Hours */}
      {business.openingHours && Object.keys(business.openingHours).length > 0 && (
        <section className="py-20 bg-linear-to-r from-pink-500 to-rose-500">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Clock className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold text-white mb-8">Opening Hours</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(business.openingHours).map(([day, hours]) => (
                <div key={day} className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
                  <div className="font-semibold capitalize">{day}</div>
                  <div className="text-white/80 text-sm">{hours as string}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-pink-500 font-medium uppercase tracking-wider mb-2">Reviews</p>
              <h2 className="text-4xl font-serif font-bold text-gray-800">What Our Clients Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="relative bg-linear-to-br from-pink-50 to-rose-50 p-8 rounded-2xl"
                >
                  <div className="absolute -top-4 left-8 text-6xl text-pink-300">"</div>
                  <div className="flex gap-1 mb-4 pt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-pink-400 text-pink-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-6">{testimonial.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-pink-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-pink-500 font-medium uppercase tracking-wider mb-2">Get in Touch</p>
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">
                Book Your Beauty Experience
              </h2>
              <p className="text-gray-600 mb-8">
                Ready to treat yourself? Contact us to schedule your appointment or ask any questions.
              </p>

              <div className="space-y-6">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-pink-500 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-full bg-pink-100 group-hover:bg-pink-500 flex items-center justify-center transition-colors">
                      <Phone className="w-6 h-6 text-pink-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Call Us</div>
                      <div className="font-semibold">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-pink-500 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-full bg-pink-100 group-hover:bg-pink-500 flex items-center justify-center transition-colors">
                      <Mail className="w-6 h-6 text-pink-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email Us</div>
                      <div className="font-semibold">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Visit Us</div>
                      <div className="font-semibold">{business.address}{business.city ? `, ${business.city}` : ""}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {business.socialLinks && (
                <div className="mt-8 flex gap-4">
                  {business.socialLinks.instagram && (
                    <a
                      href={business.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks.facebook && (
                    <a
                      href={business.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-white p-10 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">Send us a Message</h3>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-pink-50 border-pink-200 focus:border-pink-400 rounded-xl"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-pink-50 border-pink-200 focus:border-pink-400 rounded-xl"
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  className="bg-pink-50 border-pink-200 focus:border-pink-400 rounded-xl"
                />
                <Textarea
                  placeholder="Tell us about the services you're interested in..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-pink-50 border-pink-200 focus:border-pink-400 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-pink-500/30"
                >
                  {formState === "loading" ? (
                    "Sending..."
                  ) : formState === "success" ? (
                    "Message Sent! ✨"
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-full object-contain bg-white p-1" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-xl font-serif font-bold">{business.name}</span>
          </div>
          <p className="text-gray-400 mb-6">{site.subheadline}</p>
          <div className="border-t border-gray-800 pt-6 text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
            <p className="mt-2">
              Powered by{" "}
              <a href="/" className="text-pink-400 hover:text-pink-300 transition-colors">
                Hack Squad
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
