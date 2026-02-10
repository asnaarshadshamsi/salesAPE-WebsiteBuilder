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
  Twitter,
  Linkedin,
  Github,
  Rocket,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Check,
  Play,
  Sparkles,
  BarChart3,
  Users,
} from "lucide-react";

export function StartupTemplate({
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold">{business.name}</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors">About</a>
              <a
                href="#contact"
                className="px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>New: AI-Powered Features</span>
              <ArrowRight className="w-4 h-4" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-linear-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                {site.headline}
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              {site.subheadline || business.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="#contact"
                className="group px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              {business.calendlyUrl ? (
                <a
                  href={business.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-slate-700 text-white hover:bg-slate-800 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </a>
              ) : (
                <a
                  href="#features"
                  className="px-8 py-4 border border-slate-700 text-white hover:bg-slate-800 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Learn More
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">10K+</div>
                <div className="text-slate-500 text-sm mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">99.9%</div>
                <div className="text-slate-500 text-sm mt-1">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">4.9★</div>
                <div className="text-slate-500 text-sm mt-1">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {site.features && site.features.length > 0 && (
        <section id="features" className="py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-cyan-400 font-semibold uppercase tracking-wider mb-4">Features</p>
              <h2 className="text-4xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Powerful features designed to help you scale your business faster.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {site.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:bg-slate-800"
                >
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:from-cyan-500 group-hover:to-blue-500 transition-all">
                    {idx === 0 && <Zap className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />}
                    {idx === 1 && <Shield className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />}
                    {idx === 2 && <Globe className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />}
                    {idx === 3 && <BarChart3 className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature}</h3>
                  <div className="w-8 h-0.5 bg-cyan-500/50 group-hover:w-full transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing/Products Section */}
      {hasProducts && (
        <section id="pricing" className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-cyan-400 font-semibold uppercase tracking-wider mb-4">Pricing</p>
              <h2 className="text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-slate-400">
                Choose the plan that works best for you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {products.slice(0, 3).map((product, idx) => (
                <div
                  key={product.id}
                  className={`relative p-8 rounded-2xl transition-all ${
                    idx === 1
                      ? "bg-linear-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 scale-105"
                      : "bg-slate-800/50 border border-slate-700/50 hover:border-slate-600"
                  }`}
                >
                  {idx === 1 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-cyan-500 to-blue-500 text-sm font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-slate-400 text-sm mb-6">{product.description}</p>
                  )}
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${product.price || 0}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {["Unlimited projects", "Priority support", "Advanced analytics", "Custom integrations"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-300">
                        <Check className="w-5 h-5 text-cyan-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                      idx === 1
                        ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30"
                        : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-cyan-400 font-semibold uppercase tracking-wider mb-4">About Us</p>
              <h2 className="text-4xl font-bold mb-6">
                Building the Future of Technology
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {business.description || site.aboutText || "We're a team of passionate innovators committed to building products that make a difference. Our mission is to empower businesses with cutting-edge technology."}
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Users className="w-8 h-8 text-cyan-400 mb-3" />
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-slate-500 text-sm">Team Members</div>
                </div>
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Globe className="w-8 h-8 text-cyan-400 mb-3" />
                  <div className="text-2xl font-bold">30+</div>
                  <div className="text-slate-500 text-sm">Countries</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-slate-800/80 border border-slate-700/50 rounded-2xl p-8">
                {business.heroImage ? (
                  <img
                    src={business.heroImage}
                    alt={business.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-64 bg-linear-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                    <Rocket className="w-24 h-24 text-cyan-500/50" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-cyan-400 font-semibold uppercase tracking-wider mb-4">Testimonials</p>
              <h2 className="text-4xl font-bold">Loved by Teams Worldwide</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-cyan-400 text-cyan-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">Customer</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact/CTA Section */}
      <section id="contact" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-cyan-400 font-semibold uppercase tracking-wider mb-4">Get Started</p>
              <h2 className="text-4xl font-bold mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Join thousands of companies already using our platform. Get in touch to learn how we can help you grow.
              </p>

              <div className="space-y-6">
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-slate-300 hover:text-cyan-400 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Email</div>
                      <div>{business.email}</div>
                    </div>
                  </a>
                )}
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-slate-300 hover:text-cyan-400 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Phone</div>
                      <div>{business.phone}</div>
                    </div>
                  </a>
                )}
              </div>

              {/* Social Links */}
              {business.socialLinks && (
                <div className="mt-8 flex gap-4">
                  {business.socialLinks.twitter && (
                    <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-500 flex items-center justify-center transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks.linkedin && (
                    <a href={business.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-700 flex items-center justify-center transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks.github && (
                    <a href={business.socialLinks.github} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-slate-800/50 border border-slate-700/50 p-10 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-900 border-slate-700 focus:border-cyan-500 rounded-xl text-white placeholder:text-slate-500"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-slate-900 border-slate-700 focus:border-cyan-500 rounded-xl text-white placeholder:text-slate-500"
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  className="bg-slate-900 border-slate-700 focus:border-cyan-500 rounded-xl text-white placeholder:text-slate-500"
                />
                <Textarea
                  placeholder="Tell us about your project..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-slate-900 border-slate-700 focus:border-cyan-500 rounded-xl text-white placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold"
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
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-bold">{business.name}</span>
            </div>
            <div className="text-slate-500 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
              <p className="mt-1">
                Powered by{" "}
                <a href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
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
