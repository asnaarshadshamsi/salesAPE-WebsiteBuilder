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
  Utensils,
  ChefHat,
  Soup,
  Wine,
  UtensilsCrossed,
} from "lucide-react";

export function RestaurantTemplate({
  site,
  business,
  products,
  formState,
  formData,
  onFormChange,
  onFormSubmit,
}: TemplateProps) {
  const hasProducts = products && products.length > 0;

  // Group products by category for menu display
  const menuCategories = products.reduce((acc, product) => {
    const category = product.category || "Specials";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section - Restaurant Style */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{
          background: business.heroImage
            ? `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${business.heroImage}) center/cover fixed`
            : `linear-gradient(135deg, ${business.primaryColor} 0%, ${business.secondaryColor} 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <Utensils className="w-32 h-32 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <ChefHat className="w-24 h-24 text-white" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logo */}
          {business.logo ? (
            <img
              src={business.logo}
              alt={business.name}
              className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-white/30 object-contain bg-white/10 backdrop-blur"
            />
          ) : (
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-white/30 bg-white/10 backdrop-blur flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          )}

          <p className="text-amber-300 uppercase tracking-[0.3em] text-sm font-medium mb-4">
            Welcome to
          </p>
          <h1 className="text-5xl sm:text-7xl font-serif font-bold text-white mb-6">
            {business.name}
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 font-light mb-8 italic">
            {site.headline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#menu"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-xl"
            >
              <UtensilsCrossed className="w-5 h-5 inline mr-2" />
              View Menu
            </a>
            {business.calendlyUrl ? (
              <a
                href={business.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-stone-900 font-semibold rounded-full transition-all"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Reserve Table
              </a>
            ) : (
              <a
                href="#contact"
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-stone-900 font-semibold rounded-full transition-all"
              >
                <Phone className="w-5 h-5 inline mr-2" />
                Make Reservation
              </a>
            )}
          </div>

          {/* Opening Hours Badge */}
          {business.openingHours && (
            <div className="mt-12 inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur rounded-full text-white/90">
              <Clock className="w-4 h-4" />
              <span>Open Today: {Object.values(business.openingHours)[0] || "Check Hours"}</span>
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Strip */}
      {site.features.length > 0 && (
        <section className="bg-stone-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {site.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-amber-300">
                  <Soup className="w-5 h-5" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu Section */}
      {hasProducts && (
        <section id="menu" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-amber-600 uppercase tracking-widest text-sm mb-2">Discover</p>
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">
                Our Menu
              </h2>
              <div className="w-24 h-1 bg-amber-500 mx-auto" />
            </div>

            {Object.entries(menuCategories).map(([category, items]) => (
              <div key={category} className="mb-16">
                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-8 flex items-center gap-4">
                  <Wine className="w-6 h-6 text-amber-500" />
                  {category}
                  <div className="flex-1 h-px bg-stone-200" />
                </h3>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-6 p-4 rounded-xl hover:bg-stone-50 transition-colors group"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-semibold text-stone-900">{item.name}</h4>
                          {item.price && (
                            <span className="text-amber-600 font-bold text-lg">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-stone-600 mt-1 text-sm">{item.description}</p>
                        )}
                        {item.featured && (
                          <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                            ⭐ Chef&apos;s Special
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-600 uppercase tracking-widest text-sm mb-2">Our Story</p>
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">
                A Culinary Journey
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed mb-6">
                {site.aboutText || business.description || `Welcome to ${business.name}, where passion meets culinary excellence. Every dish tells a story, crafted with the finest ingredients and prepared with love.`}
              </p>
              {business.services.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {business.services.slice(0, 4).map((service, i) => (
                    <div key={i} className="flex items-center gap-2 text-stone-700">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      {service}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {business.heroImage && (
              <div className="relative">
                <img
                  src={business.heroImage}
                  alt={business.name}
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-500 rounded-2xl -z-10" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {site.testimonials.length > 0 && (
        <section className="py-20 px-4 bg-stone-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-amber-400 uppercase tracking-widest text-sm mb-2">Reviews</p>
              <h2 className="text-4xl font-serif font-bold">What Our Guests Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="bg-stone-800 p-8 rounded-2xl">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-5 h-5"
                        fill={s <= (t.rating || 5) ? "#f59e0b" : "none"}
                        stroke="#f59e0b"
                      />
                    ))}
                  </div>
                  <p className="text-stone-300 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-amber-400 font-semibold">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-amber-600 uppercase tracking-widest text-sm mb-2">Contact Us</p>
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">
                Make a Reservation
              </h2>
              <p className="text-stone-600 mb-8">
                Ready to experience exceptional dining? Book your table or get in touch with us.
              </p>

              <div className="space-y-4">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-4 text-stone-700 hover:text-amber-600 transition-colors">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-medium">{business.phone}</span>
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-4 text-stone-700 hover:text-amber-600 transition-colors">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-medium">{business.email}</span>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-stone-700">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-medium">{business.address}{business.city ? `, ${business.city}` : ""}</span>
                  </div>
                )}
              </div>

              {/* Opening Hours */}
              {business.openingHours && (
                <div className="mt-8 p-6 bg-stone-50 rounded-xl">
                  <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Opening Hours
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(business.openingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-stone-600 capitalize">{day}:</span>
                        <span className="text-stone-900 font-medium">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-stone-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-stone-900 mb-6">Send us a Message</h3>
              <form onSubmit={onFormSubmit} className="space-y-4">
                <Input
                  label="Your Name"
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
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
                <Textarea
                  label="Message"
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  placeholder="Special requests, party size, preferred date..."
                  rows={4}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={formState === "loading"}
                  style={{ backgroundColor: "#f59e0b" }}
                >
                  {formState === "success" ? "Message Sent!" : formState === "loading" ? "Sending..." : "Send Message"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-serif font-bold mb-4">{business.name}</h3>
          <p className="text-stone-400 mb-6">{business.address}{business.city ? `, ${business.city}` : ""}</p>
          <div className="flex justify-center gap-4 mb-8">
            {business.socialLinks?.instagram && (
              <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {business.socialLinks?.facebook && (
              <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {business.socialLinks?.twitter && (
              <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
          <p className="text-stone-500 text-sm">
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
