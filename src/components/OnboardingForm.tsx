"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeUrl } from "@/actions/business";
import { Button, Input, Textarea } from "@/components/ui";
import { VoiceEnabledTextarea } from "@/components/VoiceInput";
import { ArrowRight, Loader2, Globe, Sparkles, ShoppingBag, Store, Coffee, Briefcase, Check, Mic } from "lucide-react";

interface ProductData {
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
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
}

interface OnboardingFormProps {
  isLoggedIn: boolean;
}

const businessTypeIcons: Record<string, React.ReactNode> = {
  ecommerce: <ShoppingBag className="w-5 h-5" />,
  restaurant: <Coffee className="w-5 h-5" />,
  service: <Briefcase className="w-5 h-5" />,
  other: <Store className="w-5 h-5" />,
};

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

export function OnboardingForm({ isLoggedIn }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"url" | "analyzing" | "preview">("url");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [analyzedData, setAnalyzedData] = useState<OnboardingData | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setError("");
    setStep("analyzing");

    const result = await analyzeUrl(url);

    if (result.success && result.data) {
      setAnalyzedData({
        name: result.data.name,
        description: description || result.data.description,
        logo: result.data.logo,
        heroImage: result.data.heroImage,
        primaryColor: result.data.primaryColor,
        secondaryColor: result.data.secondaryColor,
        businessType: result.data.businessType,
        services: result.data.services,
        features: result.data.features,
        products: result.data.products,
        phone: result.data.phone,
        email: result.data.email,
        address: result.data.address,
        socialLinks: result.data.socialLinks,
        testimonials: result.data.testimonials,
        sourceUrl: url,
      });
      setStep("preview");
    } else {
      setError(result.error || "Failed to analyze URL");
      setStep("url");
    }
  };

  const handleContinue = () => {
    if (!isLoggedIn) {
      // Store data in sessionStorage and redirect to signup
      sessionStorage.setItem("onboarding_data", JSON.stringify(analyzedData));
      router.push("/signup?continue=true");
    } else {
      // Store data and go to create page
      sessionStorage.setItem("onboarding_data", JSON.stringify(analyzedData));
      router.push("/create");
    }
  };

  if (step === "analyzing") {
    return (
      <div className="max-w-xl mx-auto bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-pink-500/20">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-500/30 rounded-full animate-spin border-t-pink-500" />
            <Sparkles className="w-6 h-6 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg text-white">Analyzing your business...</p>
          <p className="text-sm text-gray-400 mt-2">
            Extracting products, brand colors, and generating content
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-gray-400">
            <span className="px-2 py-1 bg-zinc-800 rounded">🔍 Scanning website</span>
            <span className="px-2 py-1 bg-zinc-800 rounded">🎨 Extracting colors</span>
            <span className="px-2 py-1 bg-zinc-800 rounded">📦 Finding products</span>
            <span className="px-2 py-1 bg-zinc-800 rounded">✨ Generating content</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === "preview" && analyzedData) {
    return (
      <div className="max-w-2xl mx-auto bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-pink-500/20 text-left">
        <h3 className="text-2xl font-bold text-white mb-6">
          Preview Your Business
        </h3>

        <div className="space-y-6">
          {/* Business Header */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
              style={{ backgroundColor: analyzedData.primaryColor }}
            >
              {analyzedData.logo ? (
                <img
                  src={analyzedData.logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                analyzedData.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-white">
                {analyzedData.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: analyzedData.primaryColor }}
                >
                  {businessTypeLabels[analyzedData.businessType] || analyzedData.businessType}
                </span>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="flex gap-2">
            <div
              className="w-10 h-10 rounded-lg shadow-sm"
              style={{ backgroundColor: analyzedData.primaryColor }}
              title="Primary Color"
            />
            <div
              className="w-10 h-10 rounded-lg shadow-sm"
              style={{ backgroundColor: analyzedData.secondaryColor }}
              title="Secondary Color"
            />
          </div>

          {/* Hero Image */}
          {analyzedData.heroImage && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Hero Image
              </label>
              <img 
                src={analyzedData.heroImage} 
                alt="Hero"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Description
            </label>
            <p className="text-gray-400 mt-1">{analyzedData.description}</p>
          </div>

          {/* Products Preview */}
          {analyzedData.products.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Products Found ({analyzedData.products.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {analyzedData.products.slice(0, 4).map((product, i) => (
                  <div 
                    key={i}
                    className="bg-zinc-800 rounded-lg p-2 text-center"
                  >
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
                    <p className="text-xs text-gray-300 truncate">{product.name}</p>
                    {product.price && (
                      <p className="text-xs font-semibold" style={{ color: analyzedData.primaryColor }}>
                        ${product.price}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {analyzedData.products.length > 4 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  +{analyzedData.products.length - 4} more products
                </p>
              )}
            </div>
          )}

          {/* Services */}
          {analyzedData.services.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Services
              </label>
              <div className="flex flex-wrap gap-2">
                {analyzedData.services.slice(0, 6).map((service, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {analyzedData.features.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Features
              </label>
              <div className="grid grid-cols-2 gap-2">
                {analyzedData.features.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-pink-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(analyzedData.phone || analyzedData.email || analyzedData.address) && (
            <div className="text-sm text-gray-400 bg-zinc-800 rounded-lg p-3">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Contact Info Found
              </label>
              {analyzedData.phone && <p>📞 {analyzedData.phone}</p>}
              {analyzedData.email && <p>✉️ {analyzedData.email}</p>}
              {analyzedData.address && <p>📍 {analyzedData.address}</p>}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setStep("url")}
            className="flex-1"
          >
            Back
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            {isLoggedIn ? "Create Website" : "Sign Up & Create"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-pink-500/20">
      <div className="space-y-4">
        <Input
          placeholder="Enter your website or Instagram URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          label="Website or Instagram URL"
        />

        {/* Voice input indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-pink-500/10 border border-pink-500/20 rounded-lg p-2">
          <Mic className="w-4 h-4 text-pink-500" />
          <span>Voice input available for description! Click the mic icon to speak.</span>
        </div>

        <VoiceEnabledTextarea
          placeholder="Tell us about your business (optional - helps improve results)"
          value={description}
          onChange={setDescription}
          label="Business Description (optional)"
          rows={3}
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <Button
          onClick={handleAnalyze}
          size="lg"
          className="w-full"
          disabled={!url.trim()}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Analyze & Generate Website
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <p className="text-gray-500 text-sm mt-4">
        We&apos;ll scan your website to extract products, services, brand colors, and more to create a professional website automatically.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-gray-400">✓ E-commerce</span>
        <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-gray-400">✓ Restaurants</span>
        <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-gray-400">✓ Services</span>
        <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-gray-400">✓ Instagram</span>
      </div>
    </div>
  );
}
