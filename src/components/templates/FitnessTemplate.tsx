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
  Dumbbell,
  Heart,
  Flame,
  Timer,
  Trophy,
  Users,
  Target,
  Zap,
} from "lucide-react";

export function FitnessTemplate({
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
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Bold Fitness Style */}
      <section
        className="relative min-h-screen flex items-center"
        style={{
          background: business.heroImage
            ? `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%), url(${business.heroImage}) center/cover`
            : `linear-gradient(135deg, ${business.primaryColor} 0%, #000 100%)`,
        }}
      >
        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-50 py-6 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-2xl font-black uppercase tracking-tight">{business.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#programs" className="hover:text-orange-500 transition-colors font-semibold">Programs</a>
              <a href="#about" className="hover:text-orange-500 transition-colors font-semibold">About</a>
              <a href="#contact" className="hover:text-orange-500 transition-colors font-semibold">Contact</a>
              <a
                href={business.calendlyUrl || "#contact"}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
              >
                JOIN NOW
              </a>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full text-orange-400 text-sm font-bold mb-6">
              <Flame className="w-4 h-4" />
              TRANSFORM YOUR BODY
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none mb-6">
              {site.headline}
            </h1>
            {site.subheadline && (
              <p className="text-xl text-gray-300 mb-8">
                {site.subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={business.calendlyUrl || "#contact"}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105"
              >
                {site.ctaText}
              </a>
              <a
                href="#programs"
                className="px-8 py-4 border-2 border-white/30 hover:border-white text-white font-bold text-lg rounded-lg transition-colors"
              >
                VIEW PROGRAMS
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-12 mt-16">
              <div>
                <div className="text-4xl font-black text-orange-500">500+</div>
                <div className="text-gray-400 font-medium">Members</div>
              </div>
              <div>
                <div className="text-4xl font-black text-orange-500">20+</div>
                <div className="text-gray-400 font-medium">Trainers</div>
              </div>
              <div>
                <div className="text-4xl font-black text-orange-500">15+</div>
                <div className="text-gray-400 font-medium">Programs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      {site.features.length > 0 && (
        <section className="bg-orange-500 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {site.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white font-bold">
                  <Zap className="w-6 h-6" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programs/Services Section */}
      {hasServices && (
        <section id="programs" className="py-20 px-4 bg-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-orange-500 font-bold uppercase tracking-wider mb-2">Our Programs</p>
              <h2 className="text-4xl sm:text-5xl font-black uppercase mb-4">
                Train Like a Champion
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Choose the program that fits your goals and start your transformation today.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {business.services.map((service, i) => (
                <div
                  key={i}
                  className="bg-black p-8 rounded-2xl border border-zinc-800 hover:border-orange-500 transition-all group"
                >
                  <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                    {i % 4 === 0 && <Dumbbell className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" />}
                    {i % 4 === 1 && <Heart className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" />}
                    {i % 4 === 2 && <Timer className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" />}
                    {i % 4 === 3 && <Target className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" />}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service}</h3>
                  <p className="text-gray-500">
                    Achieve your fitness goals with our expert trainers and proven methods.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {business.heroImage && (
              <div className="relative">
                <div className="absolute -inset-4 bg-orange-500/20 rounded-3xl" />
                <img
                  src={business.heroImage}
                  alt={business.name}
                  className="relative rounded-2xl w-full"
                />
              </div>
            )}
            <div>
              <p className="text-orange-500 font-bold uppercase tracking-wider mb-2">About Us</p>
              <h2 className="text-4xl font-black uppercase mb-6">
                More Than Just a Gym
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {site.aboutText || business.description || `${business.name} is where champions are made. Our state-of-the-art facility and expert coaches are dedicated to helping you achieve your fitness goals, whether you're just starting out or training for competition.`}
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <Trophy className="w-10 h-10 text-orange-500" />
                  <div>
                    <div className="font-bold">Award Winning</div>
                    <div className="text-gray-500 text-sm">Best Gym 2024</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Users className="w-10 h-10 text-orange-500" />
                  <div>
                    <div className="font-bold">Expert Trainers</div>
                    <div className="text-gray-500 text-sm">Certified Pros</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {site.testimonials.length > 0 && (
        <section className="py-20 px-4 bg-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-orange-500 font-bold uppercase tracking-wider mb-2">Success Stories</p>
              <h2 className="text-4xl font-black uppercase">Transformations</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="bg-black p-8 rounded-2xl border border-zinc-800">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-5 h-5"
                        fill={s <= (t.rating || 5) ? "#f97316" : "none"}
                        stroke="#f97316"
                      />
                    ))}
                  </div>
                  <p className="text-gray-400 mb-4">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-orange-500 font-bold">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-orange-500 font-bold uppercase tracking-wider mb-2">Get Started</p>
              <h2 className="text-4xl font-black uppercase mb-6">
                Start Your Journey Today
              </h2>
              <p className="text-gray-400 mb-8">
                Ready to transform your body and life? Contact us to get started with a free consultation.
              </p>

              <div className="space-y-6">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-4 text-gray-300 hover:text-orange-500 transition-colors">
                    <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Call Us</p>
                      <p className="font-bold">{business.phone}</p>
                    </div>
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-4 text-gray-300 hover:text-orange-500 transition-colors">
                    <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-bold">{business.email}</p>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-bold">{business.address}{business.city ? `, ${business.city}` : ""}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-8 flex gap-4">
                {business.socialLinks?.instagram && (
                  <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks?.facebook && (
                  <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {business.socialLinks?.twitter && (
                  <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-zinc-900 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6">Free Consultation</h3>
              <form onSubmit={onFormSubmit} className="space-y-4">
                <Input
                  label="Your Name"
                  value={formData.name}
                  onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="bg-black border-zinc-800"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  className="bg-black border-zinc-800"
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="bg-black border-zinc-800"
                />
                <Textarea
                  label="Fitness Goals"
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your fitness goals..."
                  rows={4}
                  className="bg-black border-zinc-800"
                />
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={formState === "loading"}
                >
                  {formState === "success" ? "Request Sent!" : formState === "loading" ? "Sending..." : "GET STARTED"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 py-12 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-xl font-black uppercase">{business.name}</span>
          </div>
          <p className="text-gray-500 mb-4">
            {business.address}{business.city ? `, ${business.city}` : ""}
          </p>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
