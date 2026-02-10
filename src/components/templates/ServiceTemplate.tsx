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
  Clock,
  CheckCircle,
  Shield,
  Users,
  Wrench,
  Award,
  ArrowRight,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

export function ServiceTemplate({
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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Service Provider Style */}
      <section
        className="relative min-h-[90vh] flex items-center"
        style={{
          background: business.heroImage
            ? `linear-gradient(to right, rgba(30,58,138,0.95) 0%, rgba(30,64,175,0.85) 100%), url(${business.heroImage}) center/cover`
            : `linear-gradient(135deg, ${business.primaryColor} 0%, ${business.secondaryColor} 100%)`,
        }}
      >
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

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
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-white">{business.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-white/80 hover:text-white transition-colors">Services</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              )}
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
          <div className="max-w-3xl">
            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                Licensed & Insured
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                Available 24/7
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-sm">
                <ThumbsUp className="w-4 h-4 text-blue-400" />
                Satisfaction Guaranteed
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {site.headline}
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {site.subheadline || business.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href="#contact"
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Get Free Quote
              </a>
              {business.calendlyUrl ? (
                <a
                  href={business.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Service
                </a>
              ) : (
                <a
                  href={`tel:${business.phone || ""}`}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20"
                >
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </a>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-3xl font-bold text-white">15+</div>
                <div className="text-blue-200 text-sm">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">5000+</div>
                <div className="text-blue-200 text-sm">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-blue-200 text-sm flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {hasProducts && (
        <section id="services" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">What We Offer</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Services
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional services tailored to meet your needs. Quality workmanship guaranteed.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((service) => {
                // Find AI-generated description for this service if available
                const aiDescription = site.serviceDescriptions?.find(
                  (sd) => sd.name.toLowerCase() === service.name.toLowerCase()
                );
                const displayDescription = aiDescription?.description || service.description;
                
                return (
                  <div
                    key={service.id}
                    className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100"
                  >
                    {service.image && (
                      <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                    {displayDescription && (
                      <p className="text-gray-600 mb-4">{displayDescription}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {service.price && (
                        <span className="text-2xl font-bold text-blue-600">
                          From ${service.price}
                        </span>
                      )}
                      <a
                        href="#contact"
                        className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Learn More <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {site.tagline || "Trusted Professionals at Your Service"}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {business.description || site.aboutText || "We pride ourselves on delivering exceptional service with a commitment to quality, reliability, and customer satisfaction."}
              </p>

              <div className="space-y-4">
                {/* Use AI-generated value propositions if available, otherwise use features */}
                {(site.valuePropositions && site.valuePropositions.length > 0
                  ? site.valuePropositions.slice(0, 4)
                  : site.features.slice(0, 4)
                ).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-600 p-8 rounded-2xl text-white">
                <Shield className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Licensed & Insured</h3>
                <p className="text-blue-100 text-sm">Fully licensed with comprehensive insurance coverage</p>
              </div>
              <div className="bg-amber-500 p-8 rounded-2xl text-white">
                <Clock className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Fast Response</h3>
                <p className="text-amber-100 text-sm">Quick response times and same-day service available</p>
              </div>
              <div className="bg-green-600 p-8 rounded-2xl text-white">
                <Award className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
                <p className="text-green-100 text-sm">100% satisfaction guarantee on all work</p>
              </div>
              <div className="bg-purple-600 p-8 rounded-2xl text-white">
                <Users className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Expert Team</h3>
                <p className="text-purple-100 text-sm">Skilled professionals with years of experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">Customer Reviews</p>
              <h2 className="text-4xl font-bold text-gray-900">What Our Clients Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">Verified Customer</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Need Help? We're Just a Call Away!
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Contact us now for fast, reliable service. Free estimates available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                {business.phone}
              </a>
            )}
            <a
              href="#contact"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Request Quote
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">Contact Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Get Your Free Quote Today
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Fill out the form and we'll get back to you as soon as possible. Free estimates, no obligation.
              </p>

              <div className="space-y-6">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                      <Phone className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Call Us</div>
                      <div className="font-bold text-lg">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                      <Mail className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email Us</div>
                      <div className="font-bold text-lg">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Service Area</div>
                      <div className="font-bold text-lg">{business.address}{business.city ? `, ${business.city}` : ""}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Hours */}
              {business.openingHours && Object.keys(business.openingHours).length > 0 && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Business Hours
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(business.openingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{day}</span>
                        <span className="font-medium text-gray-900">{hours as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-10 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request a Free Quote</h3>
              <p className="text-gray-600 mb-6">We typically respond within 1 hour</p>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  required
                  className="bg-white border-gray-200 focus:border-blue-400 rounded-xl"
                />
                <Textarea
                  placeholder="Describe your project or service needed..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-white border-gray-200 focus:border-blue-400 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold"
                >
                  {formState === "loading" ? (
                    "Sending..."
                  ) : formState === "success" ? (
                    "Request Sent! ✓"
                  ) : (
                    <>
                      <Send className="w-5 h-5 inline mr-2" />
                      Get Free Quote
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold">{business.name}</span>
            </div>
            {business.socialLinks && (
              <div className="flex gap-4 mb-6 md:mb-0">
                {business.socialLinks.facebook && (
                  <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks.instagram && (
                  <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
              <p className="mt-1">
                Powered by{" "}
                <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
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
