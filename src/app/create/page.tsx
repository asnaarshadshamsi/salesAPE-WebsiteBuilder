"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBusiness, analyzeUrl, analyzeVoiceInput, updateBusiness, getBusinessForEdit } from "@/actions/business";
import { Button, Input } from "@/components/ui";
import { VoiceEnabledTextarea } from "@/components/VoiceInput";
import { AIChatbotOnboarding } from "@/components/AIChatbotOnboarding";
import { BusinessIdentitySection } from "@/components/create/BusinessIdentitySection";
import { ProductsDisplay } from "@/components/create/ProductsDisplay";
import { TagManagerSection } from "@/components/create/TagManagerSection";
import { ContactInfoSection } from "@/components/create/ContactInfoSection";
import { Rocket, ArrowRight, ArrowLeft, Loader2, Check, Mic, Globe, Sparkles, Plus, X, Instagram, Facebook, Twitter, Linkedin, Globe2, RefreshCw, MessageSquare, Bot, Palette } from "lucide-react";

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
  const searchParams = useSearchParams();
  const editBusinessId = searchParams.get("edit");
  const isEditMode = !!editBusinessId;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [dataExtracted, setDataExtracted] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);
  
  // Mode selection: 'chatbot' or 'url' or null (not selected)
  const [creationMode, setCreationMode] = useState<'chatbot' | 'url' | null>(null);
  
  // Input states
  const [sourceUrl, setSourceUrl] = useState("");
  const [additionalUrls, setAdditionalUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");
  
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
    galleryImages: string[];
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
    galleryImages: [],
  });

  useEffect(() => {
    // Load existing business data if in edit mode
    if (isEditMode && editBusinessId) {
      setIsLoadingBusiness(true);
      getBusinessForEdit(editBusinessId).then((result) => {
        if (result.success && result.business) {
          const biz = result.business;
          setFormData((prev) => ({
            ...prev,
            name: biz.name || "",
            description: biz.description || "",
            logo: biz.logo || "",
            heroImage: biz.heroImage || "",
            primaryColor: biz.primaryColor || "#ec4899",
            secondaryColor: biz.secondaryColor || "#f472b6",
            businessType: biz.businessType || "service",
            services: biz.services || [],
            features: biz.features || [],
            phone: biz.phone || "",
            email: biz.email || "",
            address: biz.address || "",
            city: biz.city || "",
            calendlyUrl: biz.calendlyUrl || "",
            sourceUrl: biz.sourceUrl || "",
          }));
          if (biz.sourceUrl) {
            setSourceUrl(biz.sourceUrl);
          }
          setDataExtracted(true);
        } else {
          setError(result.error || "Failed to load business");
        }
        setIsLoadingBusiness(false);
      });
      return;
    }
    
    // Load data from sessionStorage if available (for new businesses)
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
        setDataExtracted(true);
        // Clear the stored data
        sessionStorage.removeItem("onboarding_data");
      } catch (e) {
        console.error("Failed to parse onboarding data:", e);
      }
    }
  }, [isEditMode, editBusinessId]);

  // URL helper functions
  const handleAddUrl = () => {
    if (newUrl.trim() && !additionalUrls.includes(newUrl.trim())) {
      setAdditionalUrls([...additionalUrls, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const handleRemoveUrl = (url: string) => {
    setAdditionalUrls(additionalUrls.filter(u => u !== url));
  };

  const detectUrlType = (url: string): { icon: React.ReactNode; label: string } => {
    const lower = url.toLowerCase();
    if (lower.includes('instagram')) return { icon: <Instagram className="w-4 h-4" />, label: 'Instagram' };
    if (lower.includes('facebook') || lower.includes('fb.com')) return { icon: <Facebook className="w-4 h-4" />, label: 'Facebook' };
    if (lower.includes('twitter') || lower.includes('x.com')) return { icon: <Twitter className="w-4 h-4" />, label: 'Twitter/X' };
    if (lower.includes('linkedin')) return { icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' };
    if (lower.includes('tiktok')) return { icon: <Globe2 className="w-4 h-4" />, label: 'TikTok' };
    return { icon: <Globe className="w-4 h-4" />, label: 'Website' };
  };

  // Handler for AI Chatbot completion
  const handleChatbotComplete = async (data: any) => {
    console.log('[handleChatbotComplete] Chatbot data received:', data);
    setIsAnalyzing(true);
    setError('');

    try {
      // Import the new function dynamically
      const { generateWebsiteFromChatbot } = await import('@/actions/business');
      
      // Generate rich website content from chatbot data
      const result = await generateWebsiteFromChatbot(data);

      if (result.success && result.data) {
        const enrichedData = result.data;
        console.log('[handleChatbotComplete] Enriched data:', enrichedData);

        // Populate form with enriched data
        setFormData((prev) => ({
          ...prev,
          name: enrichedData.name,
          description: enrichedData.description,
          logo: enrichedData.logo,
          heroImage: enrichedData.heroImage,
          primaryColor: enrichedData.primaryColor,
          secondaryColor: enrichedData.secondaryColor,
          businessType: enrichedData.businessType,
          services: enrichedData.services.map((s: any) => s.title || s),
          features: enrichedData.features.map((f: any) => f.title || f),
          phone: enrichedData.phone || '',
          email: enrichedData.email || '',
          address: enrichedData.address || '',
          socialLinks: enrichedData.socialLinks,
          testimonials: enrichedData.testimonials,
          galleryImages: enrichedData.galleryImages || [],
        }));

        setDataExtracted(true);
        setCreationMode(null);
      } else {
        setError(result.error || 'Failed to generate website content');
      }
    } catch (error) {
      console.error('[handleChatbotComplete] Error:', error);
      setError('Failed to process your information. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Intelligent data merging and analysis
  const handleAnalyzeInputs = async () => {
    const hasUrl = sourceUrl.trim().length > 0;
    const hasVoice = voiceDescription.trim().length > 0;

    if (!hasUrl && !hasVoice) {
      setError("Please provide either a website URL or describe your business");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    try {
      let urlData = null;
      let voiceData = null;

      // Analyze URL if provided
      if (hasUrl) {
        const urlResult = await analyzeUrl(sourceUrl);
        if (urlResult.success && urlResult.data) {
          urlData = urlResult.data;
        }
      }

      // Analyze voice description if provided
      if (hasVoice) {
        const voiceResult = await analyzeVoiceInput(voiceDescription);
        if (voiceResult.success && voiceResult.data) {
          voiceData = voiceResult.data;
        }
      }

      // Intelligent merge: Voice/text takes priority for text content, URL for visuals
      if (urlData || voiceData) {
        setFormData((prev) => ({
          ...prev,
          // Prioritize voice for name and description
          name: voiceData?.name || urlData?.name || prev.name,
          description: voiceData?.description || urlData?.description || prev.description,
          // URL data is better for visuals (logo, images, colors)
          logo: urlData?.logo || prev.logo,
          heroImage: urlData?.heroImage || prev.heroImage,
          primaryColor: urlData?.primaryColor || voiceData?.primaryColor || prev.primaryColor,
          secondaryColor: urlData?.secondaryColor || voiceData?.secondaryColor || prev.secondaryColor,
          // Merge services and features from both sources
          businessType: voiceData?.businessType || urlData?.businessType || prev.businessType,
          services: [
            ...new Set([
              ...(voiceData?.services || []),
              ...(urlData?.services || []),
              ...prev.services
            ])
          ],
          features: [
            ...new Set([
              ...(voiceData?.features || []),
              ...(urlData?.features || []),
              ...prev.features
            ])
          ],
          // URL is better for structured data like products
          products: urlData?.products || prev.products,
          // Merge contact info (voice takes priority)
          phone: voiceData?.phone || urlData?.phone || prev.phone,
          email: voiceData?.email || urlData?.email || prev.email,
          address: voiceData?.address || urlData?.address || prev.address,
          // URL data for social and testimonials
          socialLinks: urlData?.socialLinks || prev.socialLinks,
          testimonials: urlData?.testimonials || prev.testimonials,
          // Gallery images from URL scraping
          galleryImages: urlData?.galleryImages || prev.galleryImages,
          sourceUrl: sourceUrl,
        }));
        setDataExtracted(true);
      } else {
        setError("Unable to extract information. Please try again or fill the form manually.");
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError("Error analyzing your inputs. Please try again or fill the form manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isEditMode && editBusinessId) {
      // Update existing business
      const result = await updateBusiness(editBusinessId, {
        name: formData.name,
        description: formData.description,
        sourceUrl: formData.sourceUrl,
        logo: formData.logo || null,
        heroImage: formData.heroImage || null,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        businessType: formData.businessType as any,
        services: formData.services,
        features: formData.features,
        products: formData.products,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        calendlyUrl: formData.calendlyUrl || null,
        socialLinks: formData.socialLinks || null,
        testimonials: formData.testimonials || null,
        galleryImages: formData.galleryImages,
      });

      if (result.success) {
        router.push(`/dashboard/business/${editBusinessId}?updated=true`);
      } else {
        setError(result.error || "Failed to update business");
        setIsLoading(false);
      }
    } else {
      // Create new business
      const result = await createBusiness({
        name: formData.name,
        description: formData.description,
        sourceUrl: formData.sourceUrl,
        logo: formData.logo || null,
        heroImage: formData.heroImage || null,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        businessType: formData.businessType as any,
        services: formData.services,
        features: formData.features,
        products: formData.products,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        calendlyUrl: formData.calendlyUrl || null,
        socialLinks: formData.socialLinks || null,
        testimonials: formData.testimonials || null,
        galleryImages: formData.galleryImages,
      });

      if (result.success && result.siteSlug) {
        router.push(`/sites/${result.siteSlug}?new=true`);
      } else {
        setError(result.error || "Failed to create business");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      {isLoadingBusiness ? (
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading business data...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                {isEditMode ? <RefreshCw className="w-6 h-6 text-white" /> : <Rocket className="w-6 h-6 text-white" />}
              </div>
              <span className="text-2xl font-bold text-white">
                HackSquad
              </span>
            </Link>
          </div>

          <div className="bg-zinc-900 rounded-xl shadow-xl p-8 border border-zinc-700">
            <Link
              href={isEditMode ? "/dashboard" : "/"}
              className="inline-flex items-center text-gray-400 hover:text-blue-400 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isEditMode ? "Back to Dashboard" : "Back"}
            </Link>

            <h1 className="text-2xl font-semibold text-white mb-2">
              {isEditMode ? "Update Your Business Website" : "Create Your Business Website"}
            </h1>
            <p className="text-gray-400 mb-8">
              {isEditMode 
                ? "Modify your business details or re-analyze to regenerate your website" 
                : "Describe your business or paste your website URL—we'll handle the rest"}
            </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mode Selection - Show if data not extracted and mode not selected */}
            {!dataExtracted && creationMode === null && !isEditMode && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-lg mb-4">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-300">Powered by AI</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    How would you like to create your website?
                  </h2>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    Choose your preferred method and we'll handle the rest—no coding required.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Chatbot Option */}
                  <button
                    type="button"
                    onClick={() => setCreationMode('chatbot')}
                    className="group relative bg-zinc-800 hover:bg-zinc-800/80 border-2 border-zinc-700 hover:border-blue-600 rounded-lg p-6 text-left transition-all duration-200"
                  >
                    {/* Recommended badge */}
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-md">
                        Recommended
                      </div>
                    </div>
                    
                    <div>
                      {/* Icon */}
                      <div className="mb-4 inline-block">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Bot className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">
                        AI Chatbot Assistant
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        Have a natural conversation with our AI assistant. Answer questions through typing or voice input, and we'll create a website tailored to your business.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded border border-blue-600/30">
                          Voice Enabled
                        </span>
                        <span className="text-xs bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded border border-blue-600/30">
                          AI Powered
                        </span>
                        <span className="text-xs bg-green-600/20 text-green-300 px-2.5 py-1 rounded border border-green-600/30">
                          5 Min Setup
                        </span>
                      </div>

                      <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                        <span>Start Chatting</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>

                  {/* URL Scraping Option */}
                  <button
                    type="button"
                    onClick={() => setCreationMode('url')}
                    className="group relative bg-zinc-800 hover:bg-zinc-800/80 border-2 border-zinc-700 hover:border-blue-600 rounded-lg p-6 text-left transition-all duration-200"
                  >
                    <div>
                      {/* Icon */}
                      <div className="mb-4 inline-block">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Globe className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Smart URL Scraping
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        Already have a website or active social media? Simply paste your URL and our advanced scraper will automatically extract colors, images, content, and contact information.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded border border-blue-600/30">
                          Auto Extract
                        </span>
                        <span className="text-xs bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded border border-blue-600/30">
                          Colors & Images
                        </span>
                        <span className="text-xs bg-green-600/20 text-green-300 px-2.5 py-1 rounded border border-green-600/30">
                          Contact Info
                        </span>
                      </div>

                      <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                        <span>Paste URL</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Features showcase */}
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-400">
                        2 Min
                      </div>
                      <p className="text-xs text-gray-500">Average Setup Time</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-400">
                        100%
                      </div>
                      <p className="text-xs text-gray-500">AI Generated</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-400">
                        0
                      </div>
                      <p className="text-xs text-gray-500">Coding Required</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Chatbot Interface */}
            {!dataExtracted && creationMode === 'chatbot' && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setCreationMode(null)}
                  className="text-gray-400 hover:text-white flex items-center gap-2 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to options
                </button>
                
                <AIChatbotOnboarding
                  onComplete={handleChatbotComplete}
                  onCancel={() => setCreationMode(null)}
                />
              </div>
            )}

            {/* URL Scraping Interface - Only show if mode is 'url' or if in edit mode */}
            {!dataExtracted && (creationMode === 'url' || isEditMode) && (
              <div className="space-y-6">
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setCreationMode(null)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to options
                  </button>
                )}
                
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Tell us about your business
                  </h2>
                  <p className="text-sm text-gray-400">
                    Provide one or both—we'll extract everything you need
                  </p>
                </div>

                {/* Voice/Text Input */}
                <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Mic className="w-5 h-5 text-blue-400" />
                    <label className="text-sm font-medium text-white">
                      Describe Your Business
                    </label>
                    <span className="text-xs text-gray-400">(Optional)</span>
                  </div>
                  
                  <VoiceEnabledTextarea
                    value={voiceDescription}
                    onChange={setVoiceDescription}
                    placeholder="Example: I run a bakery called Sweet Dreams in downtown Austin. We specialize in custom wedding cakes, French pastries, and artisan breads. We offer delivery, catering, and custom orders. Our phone is 512-555-1234..."
                    rows={6}
                    className="w-full"
                  />
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Click the microphone to speak, or just type. Include your business name, services, contact info, and any details.
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-zinc-700"></div>
                  <span className="text-sm text-gray-500 font-medium">AND / OR</span>
                  <div className="flex-1 h-px bg-zinc-700"></div>
                </div>

                {/* URL Input */}
                <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <label className="text-sm font-medium text-white">
                      Paste Your Website or Social Media URL
                    </label>
                    <span className="text-xs text-gray-400">(Optional)</span>
                  </div>
                  
                  <Input
                    placeholder="https://yourbusiness.com or https://instagram.com/yourbusiness"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="mb-3"
                  />
                  
                  <p className="text-xs text-gray-400 mb-4">
                    We'll extract your logo, images, services, colors, and other details automatically
                  </p>

                  {/* Additional URLs */}
                  {sourceUrl && (
                    <div className="space-y-3 pt-4 border-t border-zinc-700">
                      <label className="text-sm font-medium text-gray-300 block">
                        Additional Links (optional)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add more links (Facebook, Instagram, LinkedIn...)"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleAddUrl} 
                          className="shrink-0"
                          type="button"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {additionalUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {additionalUrls.map((url) => {
                            const { icon, label } = detectUrlType(url);
                            return (
                              <span
                                key={url}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-full text-sm"
                              >
                                {icon}
                                <span className="text-gray-300 max-w-[150px] truncate">{label}</span>
                                <button
                                  onClick={() => handleRemoveUrl(url)}
                                  className="text-gray-500 hover:text-red-400"
                                  type="button"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Quick Add Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500 w-full">Quick add:</span>
                        {[
                          { icon: <Instagram className="w-4 h-4" />, label: 'Instagram', prefix: 'https://instagram.com/' },
                          { icon: <Facebook className="w-4 h-4" />, label: 'Facebook', prefix: 'https://facebook.com/' },
                          { icon: <Twitter className="w-4 h-4" />, label: 'Twitter/X', prefix: 'https://x.com/' },
                          { icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', prefix: 'https://linkedin.com/company/' },
                        ].map(({ icon, label, prefix }) => (
                          <button
                            key={label}
                            onClick={() => setNewUrl(prefix)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-gray-300 transition-colors"
                            type="button"
                          >
                            {icon}
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleAnalyzeInputs}
                  disabled={isAnalyzing || (!sourceUrl.trim() && !voiceDescription.trim())}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4"
                  type="button"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing & Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Business Details
                    </>
                  )}
                </Button>

                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    How it works
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1.5">
                    <li>• <strong>Voice/Text only:</strong> AI generates your complete business presence from your description</li>
                    <li>• <strong>URL only:</strong> We scrape your existing website/social media for branding and content</li>
                    <li>• <strong>Both provided:</strong> Perfect! We merge scraped visuals with your description for the best result</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Success message after data extraction */}
            {dataExtracted && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Business details extracted successfully!</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Review and edit the information below, then launch your website
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Business Form - Show after data extraction OR allow manual entry */}
            {dataExtracted && (
              <div className="space-y-8">
                {/* Business Identity */}
                <BusinessIdentitySection
                  formData={{
                    name: formData.name,
                    description: formData.description,
                    businessType: formData.businessType,
                    primaryColor: formData.primaryColor,
                    secondaryColor: formData.secondaryColor,
                  }}
                  onChange={(updates) =>
                    setFormData((prev) => ({ ...prev, ...updates }))
                  }
                  businessTypeLabels={businessTypeLabels}
                />

                {/* Products */}
                <ProductsDisplay
                  products={formData.products}
                  onRemove={(index) =>
                    setFormData((prev) => ({
                      ...prev,
                      products: prev.products.filter((_, i) => i !== index),
                    }))
                  }
                />

                {/* Services */}
                <TagManagerSection
                  title="Services / Offerings"
                  icon="2"
                  items={formData.services}
                  onAdd={(service) =>
                    setFormData((prev) => ({
                      ...prev,
                      services: [...prev.services, service],
                    }))
                  }
                  onRemove={(service) =>
                    setFormData((prev) => ({
                      ...prev,
                      services: prev.services.filter((s) => s !== service),
                    }))
                  }
                  placeholder="Type a service..."
                  colorClass="blue"
                />

                {/* Features */}
                <TagManagerSection
                  title="Key Features / Benefits"
                  icon={<Check className="w-3 h-3" />}
                  items={formData.features}
                  onAdd={(feature) =>
                    setFormData((prev) => ({
                      ...prev,
                      features: [...prev.features, feature],
                    }))
                  }
                  onRemove={(feature) =>
                    setFormData((prev) => ({
                      ...prev,
                      features: prev.features.filter((f) => f !== feature),
                    }))
                  }
                  placeholder="Type a feature (e.g., Free Shipping)..."
                  colorClass="emerald"
                />

                {/* Contact Info */}
                <ContactInfoSection
                  formData={{
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                  }}
                  onChange={(updates) =>
                    setFormData((prev) => ({ ...prev, ...updates }))
                  }
                />

                {/* Booking */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600/20 text-blue-400 rounded-full text-sm flex items-center justify-center">
                      4
                    </span>
                    Booking (Optional)
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Calendly or Booking URL
                    </label>
                    <input
                      type="url"
                      value={formData.calendlyUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          calendlyUrl: e.target.value,
                        }))
                      }
                      placeholder="https://calendly.com/your-link"
                      className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-400 mt-1.5">
                      Add a Calendly, Cal.com, or Google Calendar booking link
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !formData.name || !formData.description}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isEditMode ? "Updating your website..." : "Creating your website..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Update Website
                        </>
                      ) : (
                        <>
                          🚀 Launch Website
                        </>
                      )}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {!isEditMode && (
                  <p className="text-center text-sm text-gray-400">
                    Your website will be live instantly at {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'your-business'}.hacksquad.app
                  </p>
                )}
              </div>
            )}

            {/* Manual Entry Link */}
            {!dataExtracted && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setDataExtracted(true)}
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors underline"
                >
                  Skip and fill form manually →
                </button>
              </div>
            )}
          </form>
        </div>
        </div>
      )}
    </div>
  );
}

