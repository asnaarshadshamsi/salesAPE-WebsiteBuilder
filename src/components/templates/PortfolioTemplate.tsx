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
  Github,
  ExternalLink,
  User,
  Briefcase,
  Award,
  ArrowRight,
  Download,
} from "lucide-react";

export function PortfolioTemplate({
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
      {/* Hero Section - Portfolio Style */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-50 via-white to-gray-100">
          {/* Decorative shapes */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-linear-to-br from-violet-200 to-purple-200 rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-linear-to-br from-blue-200 to-cyan-200 rounded-full opacity-30 blur-3xl"></div>
        </div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 py-6">
          <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
            <a href="#" className="text-xl font-bold text-gray-900">
              {business.name.split(" ")[0]}
              <span className="text-violet-600">.</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="#work" className="text-gray-600 hover:text-gray-900 transition-colors">Work</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
                Available for freelance
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {site.headline}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {site.subheadline || business.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href="#work"
                  className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  View My Work
                  <ArrowRight className="w-5 h-5" />
                </a>
                {business.calendlyUrl ? (
                  <a
                    href={business.calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Call
                  </a>
                ) : (
                  <a
                    href="#contact"
                    className="px-8 py-4 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Get in Touch
                  </a>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {business.socialLinks?.github && (
                  <a
                    href={business.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks?.linkedin && (
                  <a
                    href={business.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-blue-600 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks?.twitter && (
                  <a
                    href={business.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-blue-400 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks?.instagram && (
                  <a
                    href={business.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-linear-to-br hover:from-purple-500 hover:to-pink-500 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Profile Image/Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-r from-violet-200 to-purple-200 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative">
                {business.heroImage ? (
                  <img
                    src={business.heroImage}
                    alt={business.name}
                    className="w-full aspect-square object-cover rounded-3xl shadow-2xl"
                  />
                ) : business.logo ? (
                  <div className="w-full aspect-square bg-linear-to-br from-violet-100 to-purple-100 rounded-3xl shadow-2xl flex items-center justify-center">
                    <img
                      src={business.logo}
                      alt={business.name}
                      className="w-1/2 h-1/2 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-linear-to-br from-violet-100 to-purple-100 rounded-3xl shadow-2xl flex items-center justify-center">
                    <User className="w-32 h-32 text-violet-300" />
                  </div>
                )}

                {/* Floating badges */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">5+</div>
                      <div className="text-sm text-gray-500">Years Exp.</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">50+</div>
                      <div className="text-sm text-gray-500">Projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills/Features Section */}
      {site.features && site.features.length > 0 && (
        <section id="about" className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-violet-600 font-semibold uppercase tracking-wider mb-2">What I Do</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Skills & Expertise
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {business.description || site.aboutText}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {site.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-100 group-hover:bg-violet-500 flex items-center justify-center mb-4 transition-colors">
                    <Briefcase className="w-6 h-6 text-violet-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Work/Portfolio Section */}
      {hasProducts && (
        <section id="work" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-violet-600 font-semibold uppercase tracking-wider mb-2">Portfolio</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Selected Work
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {products.map((project) => (
                <div
                  key={project.id}
                  className="group relative overflow-hidden rounded-2xl bg-gray-100"
                >
                  <div className="aspect-video">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-violet-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      {project.category && (
                        <p className="text-violet-400 text-sm font-medium mb-2">{project.category}</p>
                      )}
                      <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-300 text-sm line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>

                  {/* External link */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white">
                    <ExternalLink className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-violet-600 font-semibold uppercase tracking-wider mb-2">Testimonials</p>
              <h2 className="text-4xl font-bold text-gray-900">What Clients Say</h2>
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
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
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
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-violet-600 font-semibold uppercase tracking-wider mb-2">Get in Touch</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Let's Work Together
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Have a project in mind? I'd love to hear about it. Send me a message and let's create something amazing together.
              </p>

              <div className="space-y-6">
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-violet-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-violet-100 group-hover:bg-violet-500 flex items-center justify-center transition-colors">
                      <Mail className="w-6 h-6 text-violet-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email Me</div>
                      <div className="font-semibold text-lg">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-violet-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-violet-100 group-hover:bg-violet-500 flex items-center justify-center transition-colors">
                      <Phone className="w-6 h-6 text-violet-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Call Me</div>
                      <div className="font-semibold text-lg">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-semibold text-lg">{business.address}{business.city ? `, ${business.city}` : ""}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-10 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-violet-400 rounded-xl"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-violet-400 rounded-xl"
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  className="bg-white border-gray-200 focus:border-violet-400 rounded-xl"
                />
                <Textarea
                  placeholder="Tell me about your project..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-white border-gray-200 focus:border-violet-400 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-semibold"
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold">
                {business.name.split(" ")[0]}
                <span className="text-violet-400">.</span>
              </span>
            </div>
            <div className="flex items-center gap-4 mb-6 md:mb-0">
              {business.socialLinks?.github && (
                <a href={business.socialLinks.github} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              )}
              {business.socialLinks?.linkedin && (
                <a href={business.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {business.socialLinks?.twitter && (
                <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-400 flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
              <p className="mt-1">
                Powered by{" "}
                <a href="/" className="text-violet-400 hover:text-violet-300 transition-colors">
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
