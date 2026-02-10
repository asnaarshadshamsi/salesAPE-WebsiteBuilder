"use client";

import { useState } from "react";
import { TemplateProps } from "./types";
import { Button, Input, Textarea } from "@/components/ui";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Star,
  Instagram,
  Facebook,
  Twitter,
  Heart,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  CreditCard,
  Tag,
  Package,
  ExternalLink,
} from "lucide-react";

export function EcommerceTemplate({
  site,
  business,
  products,
  formState,
  formData,
  onFormChange,
  onFormSubmit,
}: TemplateProps) {
  const hasProducts = products && products.length > 0;
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get unique categories
  const categories = ["all", ...new Set(products.filter(p => p.category).map(p => p.category!))];
  
  // Filter products
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Featured products
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
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
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">{business.name}</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors">Shop</a>
              <a href="#featured" className="text-gray-600 hover:text-gray-900 transition-colors">Featured</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative py-24 lg:py-32"
        style={{
          background: business.heroImage
            ? `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${business.heroImage}) center/cover`
            : `linear-gradient(135deg, ${business.primaryColor} 0%, ${business.secondaryColor} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-sm mb-6">
              <Tag className="w-4 h-4" />
              Free shipping on orders over $50
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              {site.headline}
            </h1>
            <p className="text-xl text-white/80 mb-8">
              {site.subheadline || business.description}
            </p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Shop Now <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-3 justify-center">
              <Truck className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="font-semibold text-gray-900">Free Shipping</div>
                <div className="text-sm text-gray-500">On orders over $50</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <RefreshCw className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="font-semibold text-gray-900">Easy Returns</div>
                <div className="text-sm text-gray-500">30 day return policy</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="font-semibold text-gray-900">Secure Payment</div>
                <div className="text-sm text-gray-500">100% secure checkout</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CreditCard className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="font-semibold text-gray-900">24/7 Support</div>
                <div className="text-sm text-gray-500">Dedicated support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section id="featured" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">Featured</p>
                <h2 className="text-3xl font-bold text-gray-900">Bestsellers</h2>
              </div>
              <a href="#products" className="text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    </div>
                    <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-gray-50">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        {product.salePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-indigo-600">${product.salePrice}</span>
                            <span className="text-sm text-gray-400 line-through">${product.price}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">${product.price || 0}</span>
                        )}
                      </div>
                      <a
                        href="#contact"
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors"
                        title="Inquire about this product"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      {hasProducts && (
        <section id="products" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">Shop</p>
                <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    {product.salePrice && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                          Sale
                        </span>
                      </div>
                    )}
                    <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-gray-50">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    {product.category && (
                      <p className="text-xs text-indigo-600 font-medium uppercase mb-1">{product.category}</p>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {product.salePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-indigo-600">${product.salePrice}</span>
                            <span className="text-sm text-gray-400 line-through">${product.price}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">${product.price || 0}</span>
                        )}
                      </div>
                      <a
                        href="#contact"
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors"
                        title="Inquire about this product"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-indigo-100 mb-8">
            Subscribe to get special offers, free giveaways, and updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl"
            />
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 rounded-xl font-semibold">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">Contact</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-8">
                Have questions about our products or your order? We're here to help!
              </p>

              <div className="space-y-6">
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-semibold">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-semibold">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-semibold">{business.address}{business.city ? `, ${business.city}` : ""}</div>
                    </div>
                  </div>
                )}
              </div>

              {business.socialLinks && (
                <div className="mt-8 flex gap-4">
                  {business.socialLinks.instagram && (
                    <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks.facebook && (
                    <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks.twitter && (
                    <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-400 hover:text-white flex items-center justify-center transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-indigo-400 rounded-xl"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-indigo-400 rounded-xl"
                  />
                </div>
                <Textarea
                  placeholder="Your message..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-white border-gray-200 focus:border-indigo-400 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold"
                >
                  {formState === "loading" ? "Sending..." : formState === "success" ? "Sent! ✓" : (
                    <>
                      <Send className="w-5 h-5 inline mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
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
                <img src={business.logo} alt={business.name} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-bold">{business.name}</span>
            </div>
            <div className="text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
              <p className="mt-1 text-center md:text-right">
                Powered by{" "}
                <a href="/" className="text-indigo-400 hover:text-indigo-300">
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
