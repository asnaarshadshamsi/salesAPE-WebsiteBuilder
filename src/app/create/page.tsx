"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBusiness } from "@/actions/business";
import { Button, Input, Textarea } from "@/components/ui";
import { VoiceEnabledTextarea } from "@/components/VoiceInput";
import { Rocket, ArrowRight, ArrowLeft, Plus, X, Loader2, ShoppingBag, Check, Mic } from "lucide-react";

interface ProductData {
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
}

interface LeadFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

interface OnboardingData {
  name: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  primaryColor: string;
  secondaryColor: string;
  businessType: string;
  services: string[];
  features: string[];
  products: ProductData[];
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: SocialLinks | null;
  testimonials: { name: string; text: string; rating?: number }[] | null;
  sourceUrl: string;
  additionalUrls?: string[];
  leadFormFields?: LeadFormField[];
  calendlyUrl?: string;
  connectCalendar?: boolean;
}

const businessTypeLabels: Record<string, string> = {
  ecommerce: "E-Commerce / Retail",
  restaurant: "Restaurant / Food",
  service: "Service Provider",
  healthcare: "Healthcare",
  fitness: "Fitness / Gym",
  beauty: "Beauty / Salon",
  realestate: "Real Estate",
  agency: "Agency / Studio",
  portfolio: "Portfolio",
  education: "Education",
  other: "Other",
};

export default function CreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newService, setNewService] = useState("");
  const [newFeature, setNewFeature] = useState("");
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    logo: string;
    heroImage: string;
    primaryColor: string;
    secondaryColor: string;
    businessType: string;
    services: string[];
    features: string[];
    products: ProductData[];
    sourceUrl: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    calendlyUrl: string;
    socialLinks: SocialLinks | null;
    testimonials: { name: string; text: string; rating?: number }[] | null;
    leadFormFields: LeadFormField[];
    connectCalendar: boolean;
  }>({
    name: "",
    description: "",
    logo: "",
    heroImage: "",
    primaryColor: "#ec4899",
    secondaryColor: "#f472b6",
    businessType: "service",
    services: [],
    features: [],
    products: [],
    sourceUrl: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    calendlyUrl: "",
    socialLinks: null,
    testimonials: null,
    leadFormFields: [],
    connectCalendar: false,
  });

  useEffect(() => {
    // Load data from sessionStorage if available
    const storedData = sessionStorage.getItem("onboarding_data");
    if (storedData) {
      try {
        const data: OnboardingData = JSON.parse(storedData);
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          description: data.description || "",
          logo: data.logo || "",
          heroImage: data.heroImage || "",
          primaryColor: data.primaryColor || "#ec4899",
          secondaryColor: data.secondaryColor || "#f472b6",
          businessType: data.businessType || "service",
          services: data.services || [],
          features: data.features || [],
          products: data.products || [],
          sourceUrl: data.sourceUrl || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          socialLinks: data.socialLinks || null,
          testimonials: data.testimonials || null,
          leadFormFields: data.leadFormFields || [],
          calendlyUrl: data.calendlyUrl || "",
          connectCalendar: data.connectCalendar || false,
        }));
        // Clear the stored data
        sessionStorage.removeItem("onboarding_data");
      } catch (e) {
        console.error("Failed to parse onboarding data:", e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await createBusiness({
      name: formData.name,
      description: formData.description,
      sourceUrl: formData.sourceUrl,
      logo: formData.logo || undefined,
      heroImage: formData.heroImage || undefined,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      businessType: formData.businessType as any,
      services: formData.services,
      features: formData.features,
      products: formData.products,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      calendlyUrl: formData.calendlyUrl || undefined,
      socialLinks: formData.socialLinks || undefined,
      testimonials: formData.testimonials || undefined,
    });

    if (result.success && result.siteSlug) {
      router.push(`/dashboard?created=${result.siteSlug}`);
    } else {
      setError(result.error || "Failed to create business");
      setIsLoading(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  const removeProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
              HackSquad
            </span>
          </Link>
        </div>

        <div className="bg-zinc-900 rounded-2xl shadow-xl p-8 border border-pink-500/20">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-pink-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">
            Create Your Business Website
          </h1>
          <p className="text-gray-400 mb-8">
            Review and customize your business details before launching
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Voice input for description */}
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
              <Mic className="w-4 h-4 text-pink-400" />
              <span>Voice input enabled for the description field! Click the mic icon to speak.</span>
            </div>

            {/* Business Identity */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center justify-center">1</span>
                Business Identity
              </h2>

              <Input
                label="Business Name *"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="My Awesome Business"
                required
              />

              <VoiceEnabledTextarea
                label="Description"
                value={formData.description}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: val,
                  }))
                }
                placeholder="Tell potential customers what you do..."
                rows={4}
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, businessType: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {Object.entries(businessTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-700"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-700"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            {formData.products.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full text-sm flex items-center justify-center">
                    <ShoppingBag className="w-3 h-3" />
                  </span>
                  Products ({formData.products.length})
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.products.slice(0, 8).map((product, i) => (
                    <div 
                      key={i}
                      className="bg-zinc-800 rounded-lg p-2 text-center relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeProduct(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {product.image ? (
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-16 object-cover rounded mb-1"
                        />
                      ) : (
                        <div className="w-full h-16 bg-zinc-700 rounded mb-1 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <p className="text-xs text-gray-400 truncate">{product.name}</p>
                      {product.price && (
                        <p className="text-xs font-semibold text-pink-400">
                          ${product.price}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {formData.products.length > 8 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{formData.products.length - 8} more products will be added
                  </p>
                )}
              </div>
            )}

            {/* Services */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center justify-center">2</span>
                Services / Offerings
              </h2>

              <div className="flex flex-wrap gap-2">
                {formData.services.map((service, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="ml-2 hover:text-pink-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Type a service..."
                />
                <Button type="button" variant="outline" onClick={addService}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full text-sm flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                Key Features / Benefits
              </h2>

              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="ml-2 hover:text-emerald-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Type a feature (e.g., Free Shipping)..."
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center justify-center">3</span>
                Contact Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="(555) 123-4567"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="hello@business.com"
                />
              </div>

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="123 Main St"
              />

              <Input
                label="City / Service Area"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="San Francisco, CA"
              />
            </div>

            {/* Booking */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center justify-center">4</span>
                Booking (Optional)
              </h2>

              <Input
                label="Calendly or Booking URL"
                value={formData.calendlyUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    calendlyUrl: e.target.value,
                  }))
                }
                placeholder="https://calendly.com/your-link"
              />
              <p className="text-sm text-gray-400">
                Add a Calendly, Cal.com, or Google Calendar booking link
              </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating your website...
                </>
              ) : (
                <>
                  🚀 Launch Website
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Your website will be live instantly at {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'your-business'}.hacksquad.app
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
