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
  Heart,
  Stethoscope,
  Activity,
  Shield,
  Users,
  Award,
  CheckCircle,
} from "lucide-react";

export function HealthcareTemplate({
  site,
  business,
  products,
  formState,
  formData,
  onFormChange,
  onFormSubmit,
}: TemplateProps) {
  const hasServices = business.services.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-teal-600" />
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">{business.name}</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-teal-600 transition-colors">Services</a>
              <a href="#about" className="text-gray-600 hover:text-teal-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-teal-600 transition-colors">Contact</a>
              {business.calendlyUrl ? (
                <a
                  href={business.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors"
                >
                  Book Appointment
                </a>
              ) : (
                <a href="#contact" className="px-6 py-2 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors">
                  Contact Us
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Caring for Your Health
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {site.headline}
              </h1>
              {site.subheadline && (
                <p className="text-xl text-gray-600 mb-8">
                  {site.subheadline}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={business.calendlyUrl || "#contact"}
                  className="px-8 py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-center"
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  {site.ctaText}
                </a>
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="px-8 py-4 border-2 border-teal-600 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-colors text-center"
                  >
                    <Phone className="w-5 h-5 inline mr-2" />
                    Call Now
                  </a>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">Licensed & Certified</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">Award Winning</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">10,000+ Patients</span>
                </div>
              </div>
            </div>

            {business.heroImage && (
              <div className="relative">
                <div className="absolute inset-0 bg-teal-200 rounded-3xl transform rotate-3" />
                <img
                  src={business.heroImage}
                  alt={business.name}
                  className="relative rounded-3xl shadow-2xl w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      {site.features.length > 0 && (
        <section className="bg-teal-600 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
              {site.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 shrink-0" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {hasServices && (
        <section id="services" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-teal-600 font-semibold mb-2">Our Services</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Healthcare Solutions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide a wide range of medical services to ensure your health and well-being.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {business.services.map((service, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all group hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
                    <Activity className="w-8 h-8 text-teal-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service}</h3>
                  <p className="text-gray-600">
                    Professional care delivered with compassion and expertise.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-teal-600 font-semibold mb-2">About Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Health is Our Priority
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {site.aboutText || business.description || `At ${business.name}, we are committed to providing exceptional healthcare services. Our team of experienced professionals uses the latest technology and evidence-based practices to deliver the best possible care.`}
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-3xl font-bold text-teal-600 mb-1">15+</div>
                  <div className="text-gray-600 text-sm">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-3xl font-bold text-teal-600 mb-1">10k+</div>
                  <div className="text-gray-600 text-sm">Happy Patients</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-3xl font-bold text-teal-600 mb-1">50+</div>
                  <div className="text-gray-600 text-sm">Specialists</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <div className="text-3xl font-bold text-teal-600 mb-1">24/7</div>
                  <div className="text-gray-600 text-sm">Emergency Care</div>
                </div>
              </div>
            </div>
            {business.heroImage && (
              <div className="order-1 lg:order-2">
                <img
                  src={business.heroImage}
                  alt={business.name}
                  className="rounded-2xl shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {site.testimonials.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-teal-600 font-semibold mb-2">Testimonials</p>
              <h2 className="text-4xl font-bold text-gray-900">Patient Stories</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="bg-gray-50 p-8 rounded-2xl">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-5 h-5"
                        fill={s <= (t.rating || 5) ? "#0d9488" : "none"}
                        stroke="#0d9488"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-teal-600 font-semibold">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-teal-600 font-semibold mb-2">Contact Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Schedule Your Visit
              </h2>
              <p className="text-gray-600 mb-8">
                Take the first step towards better health. Contact us to schedule an appointment.
              </p>

              <div className="space-y-6">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-4 text-gray-700 hover:text-teal-600 transition-colors">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold">{business.phone}</p>
                    </div>
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-4 text-gray-700 hover:text-teal-600 transition-colors">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold">{business.email}</p>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">{business.address}{business.city ? `, ${business.city}` : ""}</p>
                    </div>
                  </div>
                )}
              </div>

              {business.openingHours && (
                <div className="mt-8 p-6 bg-white rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    Office Hours
                  </h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(business.openingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{day}</span>
                        <span className="text-gray-900 font-medium">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Request an Appointment</h3>
              <form onSubmit={onFormSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
                <Textarea
                  label="How can we help you?"
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows={4}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={formState === "loading"}
                  style={{ backgroundColor: "#0d9488" }}
                >
                  {formState === "success" ? "Request Sent!" : formState === "loading" ? "Sending..." : "Request Appointment"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {business.logo ? (
                  <img src={business.logo} alt={business.name} className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
                ) : (
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-xl font-bold">{business.name}</span>
              </div>
              <p className="text-gray-400 mb-4">
                {business.description || "Providing quality healthcare services with compassion and excellence."}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                {business.phone && <p>{business.phone}</p>}
                {business.email && <p>{business.email}</p>}
                {business.address && <p>{business.address}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {business.socialLinks?.instagram && (
                  <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks?.facebook && (
                  <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks?.twitter && (
                  <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
