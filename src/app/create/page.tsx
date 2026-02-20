"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBusiness, analyzeUrl, analyzeVoiceInput, updateBusiness, getBusinessForEdit } from "@/actions/business";
import { Button, Input } from "@/components/ui";
import { AIChatbotOnboarding } from "@/components/AIChatbotOnboarding";
import { Rocket, ArrowRight, ArrowLeft, Loader2, Check, Globe, Sparkles, Plus, X, Instagram, Facebook, Twitter, Linkedin, Globe2, RefreshCw, MessageSquare, Bot, Palette } from "lucide-react";

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
  const [activeStep, setActiveStep] = useState<'identity' | 'services' | 'contact' | 'launch'>('identity');
  
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
    serviceDescriptions: { name: string; description: string }[] | null;
    aboutText: string;
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
    serviceDescriptions: null,
    aboutText: '',
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
      // -- URL path --------------------------------------------------------------
      // When the user provided a URL in the chatbot the production scraper already
      // ran and stored its full output in `data`.  Use those rich results directly
      // - the exact same population logic as the dedicated URL-scraper option  - 
      // so the generated site is identical no matter which entry point was used.
      if (data._urlWasUsed && data.sourceUrl) {
        console.log('[handleChatbotComplete] URL was provided - using scraper data directly:', data.sourceUrl);

        // Re-run the full production scraper to ensure we have the latest rich data
        // (the chatbot already ran it, but we call it again here so the data shape
        //  coming out is guaranteed to be the same as the URL-scraper option).
        const { analyzeUrl } = await import('@/actions/business');
        const urlResult = await analyzeUrl(data.sourceUrl);

        if (urlResult.success && urlResult.data) {
          const d = urlResult.data;
          console.log('[handleChatbotComplete] URL scraper result:', d);
          setFormData((prev) => ({
            ...prev,
            name:           d.name           || data.name           || prev.name,
            description:    d.description    || data.description    || prev.description,
            logo:           d.logo           || data.logo           || prev.logo,
            heroImage:      d.heroImage      || data.heroImage      || prev.heroImage,
            primaryColor:   d.primaryColor   || prev.primaryColor,
            secondaryColor: d.secondaryColor || prev.secondaryColor,
            businessType:   d.businessType   || data.businessType   || prev.businessType,
            services:       d.services?.length  ? d.services  : (data.services  || prev.services),
            features:       d.features?.length  ? d.features  : (data.features  || prev.features),
            products:       d.products?.length  ? d.products  : prev.products,
            phone:          d.phone          || data.phone          || prev.phone,
            email:          d.email          || data.email          || prev.email,
            address:        d.address        || data.address        || prev.address,
            socialLinks:    d.socialLinks    || data.socialLinks    || prev.socialLinks,
            testimonials:   d.testimonials?.length ? d.testimonials : (data.testimonials || prev.testimonials),
            galleryImages:  d.galleryImages?.length ? d.galleryImages : (data.galleryImages || prev.galleryImages),
            sourceUrl:      d.sourceUrl      || data.sourceUrl,
            aboutText:      d.description    || data.description    || prev.description,
          }));
          if (data.sourceUrl) setSourceUrl(data.sourceUrl);
          setDataExtracted(true);
          setCreationMode(null);
          return;
        }
        // scraper failed - fall through to chatbot AI generation below
        console.warn('[handleChatbotComplete] URL re-scrape failed, falling back to chatbot AI generation');
      }

      // -- Conversational (no-URL) path ------------------------------------------
      // No URL was provided; use the AI-generation pipeline to build content from
      // the chatbot conversation data.
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
          serviceDescriptions: enrichedData.serviceDescriptions || null,
          aboutText: enrichedData.description || '',
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
        serviceDescriptions: formData.serviceDescriptions || undefined,
        aboutText: formData.aboutText || undefined,
      });

      if (result.success && result.siteSlug) {
        router.push(`/sites/${result.siteSlug}?new=true`);
      } else {
        setError(result.error || "Failed to create business");
        setIsLoading(false);
      }
    }
  };

  // -- Full-screen, no-scroll mode selection screen --------------------------
  if (!isLoadingBusiness && !dataExtracted && creationMode === null && !isEditMode) {
    return (
      <div
        className="h-screen w-screen overflow-hidden flex flex-col"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(236,72,153,0.28) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 50% at 90% 100%, rgba(168,0,80,0.22) 0%, transparent 65%), ' +
            'linear-gradient(160deg, #0a0a0a 0%, #110008 45%, #1a000e 100%)',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(236,72,153,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(236,72,153,0.04) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top bar */}
        <header className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}>
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">HackSquad</span>
          </Link>
          {/* Back to Dashboard Button */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs text-pink-400/70 border border-pink-500/20 px-3 py-1 rounded-full bg-pink-500/5">
            Website Builder
          </span>
        </header>

        {/* Main content - vertically centred in remaining height */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4">

          {/* Badge */}
          <div className="flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-pink-500/25 bg-pink-500/8"
            style={{ background: 'rgba(236,72,153,0.07)' }}>
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-semibold text-pink-300 tracking-wide uppercase">Powered by AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white text-center leading-tight mb-3 tracking-tight">
            How would you like to
            <span
              className="block"
              style={{ background: 'linear-gradient(90deg,#f9a8d4,#ec4899,#be185d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              build your website?
            </span>
          </h1>
          <p className="text-white/60 text-center max-w-xl mb-10 text-sm leading-relaxed">
            Pick your workflow - no coding required. Both paths generate a fully designed, responsive site in minutes.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl">

            {/* AI Chatbot card */}
            <button
              type="button"
              onClick={() => setCreationMode('chatbot')}
              className="group relative text-left rounded-2xl p-7 border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus:outline-none"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(236,72,153,0.06) 100%)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 0 0 0 rgba(236,72,153,0)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px -8px rgba(236,72,153,0.35), inset 0 0 0 1px rgba(236,72,153,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.cssText = 'background:linear-gradient(145deg,rgba(255,255,255,0.04) 0%,rgba(236,72,153,0.06) 100%);border:1px solid rgba(255,255,255,0.10);')}
            >
              {/* Recommended badge */}
              <span className="absolute -top-3 right-5 text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{ background: 'linear-gradient(90deg,#ec4899,#9d174d)' }}>
                Recommended
              </span>

              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">AI Chatbot Assistant</h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Answer a few questions through chat or voice - our AI builds your site from the conversation.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {['Voice Enabled', 'AI Powered', '5 Min Setup'].map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-md font-medium text-pink-300"
                    style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.22)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-pink-400 group-hover:text-pink-300 transition-colors">
                Start Chatting <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* URL Scraper card */}
            <button
              type="button"
              onClick={() => setCreationMode('url')}
              className="group relative text-left rounded-2xl p-7 border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus:outline-none"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px -8px rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.cssText = 'background:linear-gradient(145deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.06) 100%);border:1px solid rgba(255,255,255,0.10);')}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Smart URL Scraper</h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Paste your existing website or social media URL - we auto-extract colors, images, products &amp; content.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {['Color Extract', 'Auto Products', 'Contact Info'].map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-md font-medium text-gray-300"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                Paste URL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-10 mt-8 pt-6 border-t border-white/5">
            {[
              { value: '2 Min', label: 'Avg. setup time', color: '#ec4899' },
              { value: '100%', label: 'AI generated', color: '#ec4899' },
              { value: '0', label: 'Coding required', color: '#4ade80' },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
                <div className="text-xs text-white/50 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }
  // -- End mode selection ------------------------------------------------------

  // -- Full-screen chatbot interface -----------------------------------------
  if (!dataExtracted && creationMode === 'chatbot') {
    return (
      <div
        className="h-screen w-screen overflow-hidden flex flex-col"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(236,72,153,0.22) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 50% 40% at 90% 100%, rgba(168,0,80,0.18) 0%, transparent 65%), ' +
            'linear-gradient(160deg, #0a0a0a 0%, #110008 45%, #1a000e 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(236,72,153,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(236,72,153,0.03) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}
            >
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">HackSquad</span>
          </Link>
          <button
            type="button"
            onClick={() => setCreationMode(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to options
          </button>
        </header>
        <main className="relative z-10 flex-1 overflow-hidden p-4 lg:p-6">
          <div className="h-full max-w-4xl mx-auto">
            <AIChatbotOnboarding
              onComplete={handleChatbotComplete}
              onCancel={() => setCreationMode(null)}
            />
          </div>
        </main>
      </div>
    );
  }
  // -- End chatbot interface --------------------------------------------------

  // -- Full-screen URL scraper interface -------------------------------------
  if (!dataExtracted && creationMode === 'url') {
    return (
      <div
        className="h-screen w-screen overflow-hidden flex flex-col"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(236,72,153,0.28) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 50% at 90% 100%, rgba(168,0,80,0.22) 0%, transparent 65%), ' +
            'linear-gradient(160deg, #0a0a0a 0%, #110008 45%, #1a000e 100%)',
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(236,72,153,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(236,72,153,0.04) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Header */}
        <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}>
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">HackSquad</span>
          </Link>
          <button
            type="button"
            onClick={() => setCreationMode(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to options
          </button>
        </header>

        {/* Main - vertically centered, no scroll */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-lg">

            {/* Icon + title */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}
              >
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Paste Your Business URL</h1>
              <p className="text-white/55 text-sm leading-relaxed max-w-sm mx-auto">
                Our AI scraper will extract your brand colours, images, services, and contact info automatically.
              </p>
            </div>

            {/* Input card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              {/* Primary URL */}
              <div>
                <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Website or Social Media URL</label>
                <Input
                  placeholder="https://yourbusiness.com  or  https://instagram.com/your_page"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (sourceUrl.trim()) handleAnalyzeInputs(); } }}
                  className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-pink-500/60 h-12"
                />
              </div>

              {/* Additional URLs - only visible once primary is filled */}
              {sourceUrl.trim() && (
                <div className="pt-2 border-t border-white/8 space-y-3">
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest">Additional links (optional)</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Facebook, Instagram, LinkedIn..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                      className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-pink-500/60"
                    />
                    <Button variant="outline" onClick={handleAddUrl} className="shrink-0 border-white/15 text-white/60 hover:bg-white/10" type="button">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quick-add social buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: <Instagram className="w-3.5 h-3.5" />, label: 'Instagram', prefix: 'https://instagram.com/' },
                      { icon: <Facebook className="w-3.5 h-3.5" />, label: 'Facebook', prefix: 'https://facebook.com/' },
                      { icon: <Twitter className="w-3.5 h-3.5" />, label: 'Twitter/X', prefix: 'https://x.com/' },
                      { icon: <Linkedin className="w-3.5 h-3.5" />, label: 'LinkedIn', prefix: 'https://linkedin.com/company/' },
                    ].map(({ icon, label, prefix }) => (
                      <button
                        key={label}
                        onClick={() => setNewUrl(prefix)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 transition-colors"
                        type="button"
                      >
                        {icon}{label}
                      </button>
                    ))}
                  </div>

                  {/* Added URLs */}
                  {additionalUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {additionalUrls.map((url) => {
                        const { icon, label } = detectUrlType(url);
                        return (
                          <span key={url} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/8 rounded-full text-xs text-white/70 border border-white/10">
                            {icon}
                            <span className="max-w-[140px] truncate">{label}</span>
                            <button onClick={() => handleRemoveUrl(url)} className="text-white/30 hover:text-red-400 transition-colors" type="button">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">{error}</p>
              )}

              {/* Generate button */}
              <button
                type="button"
                onClick={handleAnalyzeInputs}
                disabled={isAnalyzing || !sourceUrl.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2.5"
                style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scanning & Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Build My Website</>
                )}
              </button>
            </div>

            {/* Hint row */}
            <p className="text-center text-white/30 text-xs mt-5">
              Works with websites, Instagram, Facebook, LinkedIn &amp; more
            </p>
          </div>
        </main>
      </div>
    );
  }
  // -- End URL scraper interface ----------------------------------------------

  // -- Full-screen data review page (after extraction / edit mode) -------------
  const steps: { key: 'identity' | 'services' | 'contact' | 'launch'; label: string; icon: string }[] = [
    { key: 'identity', label: 'Identity',  icon: '1' },
    { key: 'services', label: 'Services',  icon: '2' },
    { key: 'contact',  label: 'Contact',   icon: '3' },
    { key: 'launch',   label: 'Launch',    icon: '4' },
  ];
  const currentStepIdx = steps.findIndex(s => s.key === activeStep);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(236,72,153,0.22) 0%, transparent 70%), ' +
          'radial-gradient(ellipse 60% 50% at 90% 100%, rgba(168,0,80,0.18) 0%, transparent 65%), ' +
          'linear-gradient(160deg, #0a0a0a 0%, #110008 45%, #1a000e 100%)',
      }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(236,72,153,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(236,72,153,0.03) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* -- Header -- */}
      <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}>
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">HackSquad</span>
        </Link>

        {/* Step breadcrumbs */}
        <div className="hidden md:flex items-center gap-1">
          {steps.map((s, i) => (
            <Fragment key={s.key}>
              <button
                type="button"
                onClick={() => setActiveStep(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeStep === s.key
                    ? 'text-white bg-pink-600/25 border border-pink-500/40'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
              {i < steps.length - 1 && <span className="text-white/15 text-xs">{'>'}</span>}
            </Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isEditMode && (
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all duration-150">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          )}
          <span className="text-xs text-pink-400/70 border border-pink-500/20 px-3 py-1 rounded-full bg-pink-500/5">
            {isEditMode ? 'Edit Mode' : 'Review Info'}
          </span>
        </div>
      </header>

      {isLoadingBusiness ? (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Loading business data...</p>
          </div>
        </div>
      ) : (
        <main className="relative z-10 flex-1 flex overflow-hidden">

          {/* -- Left sidebar -- */}
          <aside className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col p-6 gap-4 overflow-y-auto">
            {/* Extraction success badge */}
            {dataExtracted && !isEditMode && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-300">Extracted successfully</p>
                  <p className="text-xs text-green-400/60 mt-0.5">Review &amp; launch your site</p>
                </div>
              </div>
            )}

            {/* Brand preview */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
              {formData.logo ? (
                <img src={formData.logo} alt="logo" className="h-12 w-auto object-contain rounded-lg" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                  style={{ background: `linear-gradient(135deg,${formData.primaryColor},${formData.secondaryColor})` }}>
                  {formData.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{formData.name || 'Your Business'}</p>
                <p className="text-white/40 text-xs mt-0.5 capitalize">{formData.businessType || 'Business'}</p>
              </div>
              <div className="flex gap-2 mt-1">
                <div className="w-6 h-6 rounded-full border-2 border-white/10" style={{ background: formData.primaryColor }} title="Primary" />
                <div className="w-6 h-6 rounded-full border-2 border-white/10" style={{ background: formData.secondaryColor }} title="Secondary" />
              </div>
            </div>

            {/* Step nav */}
            <nav className="flex flex-col gap-1 flex-1">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveStep(s.key)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    activeStep === s.key
                      ? 'text-white bg-pink-600/20 border border-pink-500/30'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i < currentStepIdx
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : activeStep === s.key
                        ? 'bg-pink-600/30 text-pink-300 border border-pink-500/40'
                        : 'bg-white/8 text-white/30 border border-white/10'
                  }`}>
                    {i < currentStepIdx ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  {s.label}
                </button>
              ))}
            </nav>

            {/* Quick stats */}
            <div className="bg-white/4 border border-white/8 rounded-xl p-3 grid grid-cols-2 gap-2">
              {[
                { v: formData.services.length, l: 'Services' },
                { v: formData.features.length, l: 'Features' },
                { v: formData.products.length, l: 'Products' },
                { v: formData.phone || formData.email ? 'Yes' : 'No', l: 'Contact' },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <div className="text-base font-bold text-white/80">{v}</div>
                  <div className="text-xs text-white/30">{l}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* -- Main step content -- */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-7">

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
              )}

              {/* -- STEP: Identity -- */}
              {activeStep === 'identity' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-0.5">Business Identity</h2>
                    <p className="text-sm text-white/40">Your brand name, type, description &amp; colours</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Business Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your business name"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm"
                    />
                  </div>

                  {/* Type + colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Business Type</label>
                      <select
                        value={formData.businessType}
                        onChange={e => setFormData(p => ({ ...p, businessType: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 text-sm"
                      >
                        {Object.entries(businessTypeLabels).map(([v, l]) => (
                          <option key={v} value={v} className="bg-zinc-900">{l}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Primary</label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                          <input type="color" value={formData.primaryColor}
                            onChange={e => setFormData(p => ({ ...p, primaryColor: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <span className="text-xs text-white/50 font-mono">{formData.primaryColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Secondary</label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                          <input type="color" value={formData.secondaryColor}
                            onChange={e => setFormData(p => ({ ...p, secondaryColor: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <span className="text-xs text-white/50 font-mono">{formData.secondaryColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe what your business does and what makes it special..."
                      rows={4}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm resize-none leading-relaxed"
                    />
                  </div>

                  {/* Hero image preview */}
                  {formData.heroImage && (
                    <div>
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Hero Image (auto-extracted)</label>
                      <img src={formData.heroImage} alt="hero" className="w-full h-36 object-cover rounded-xl border border-white/10 opacity-80" />
                    </div>
                  )}

                  {/* Products summary */}
                  {formData.products.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Products ({formData.products.length} found)</label>
                      <div className="flex flex-wrap gap-2">
                        {formData.products.slice(0, 6).map((p: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                            {p.name}
                            {p.price && <span className="text-pink-400/70 font-mono">${p.price}</span>}
                          </span>
                        ))}
                        {formData.products.length > 6 && <span className="text-xs text-white/30 self-center">+{formData.products.length - 6} more</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -- STEP: Services -- */}
              {activeStep === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-0.5">Services &amp; Features</h2>
                    <p className="text-sm text-white/40">What you offer and what makes you stand out</p>
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-3">Services / Offerings</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Add a service and press Enter..."
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = (e.target as HTMLInputElement).value.trim();
                            if (v && !formData.services.includes(v)) {
                              setFormData(p => ({ ...p, services: [...p.services, v] }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300 font-medium">
                          {s}
                          <button type="button" onClick={() => setFormData(p => ({ ...p, services: p.services.filter(x => x !== s) }))} className="text-blue-400/50 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {formData.services.length === 0 && <p className="text-xs text-white/25 italic">No services added yet</p>}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-3">Key Features / Benefits</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Add a feature and press Enter..."
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = (e.target as HTMLInputElement).value.trim();
                            if (v && !formData.features.includes(v)) {
                              setFormData(p => ({ ...p, features: [...p.features, v] }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map(f => (
                        <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-300 font-medium">
                          {f}
                          <button type="button" onClick={() => setFormData(p => ({ ...p, features: p.features.filter(x => x !== f) }))} className="text-emerald-400/50 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {formData.features.length === 0 && <p className="text-xs text-white/25 italic">No features added yet</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* -- STEP: Contact -- */}
              {activeStep === 'contact' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-0.5">Contact &amp; Booking</h2>
                    <p className="text-sm text-white/40">How customers reach you</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Phone</label>
                      <input type="tel" value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Email</label>
                      <input type="email" value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="hello@yourbusiness.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Address</label>
                      <input type="text" value={formData.address}
                        onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                        placeholder="123 Main Street"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">City</label>
                      <input type="text" value={formData.city}
                        onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                        placeholder="New York"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Booking / Calendly URL <span className="text-white/25 normal-case font-normal tracking-normal">(optional)</span></label>
                    <input type="url" value={formData.calendlyUrl}
                      onChange={e => setFormData(p => ({ ...p, calendlyUrl: e.target.value }))}
                      placeholder="https://calendly.com/your-link"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/60 placeholder:text-white/25 text-sm" />
                    <p className="text-xs text-white/30 mt-1.5">Calendly, Cal.com, or any booking link - shown as a CTA on your website</p>
                  </div>

                  {/* Social links preview */}
                  {formData.socialLinks && Object.values(formData.socialLinks as Record<string, string>).some(Boolean) && (
                    <div>
                      <label className="block text-xs font-semibold text-pink-400/80 uppercase tracking-widest mb-2">Social Media (auto-extracted)</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(formData.socialLinks as Record<string, string>).filter(([, v]) => v).map(([k, v]) => (
                          <a key={k} href={v} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 capitalize hover:text-white/90 transition-colors">
                            {k}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -- STEP: Launch -- */}
              {activeStep === 'launch' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-0.5">{isEditMode ? 'Update Your Website' : 'Ready to Launch'}</h2>
                    <p className="text-sm text-white/40">{isEditMode ? 'Save your changes and regenerate your site' : 'Your website will be live in seconds'}</p>
                  </div>

                  {/* Summary card */}
                  <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      {formData.logo ? (
                        <img src={formData.logo} alt="logo" className="h-14 w-auto object-contain rounded-lg border border-white/10" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                          style={{ background: `linear-gradient(135deg,${formData.primaryColor},${formData.secondaryColor})` }}>
                          {formData.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-bold text-white leading-tight">{formData.name || ' - '}</p>
                        <p className="text-white/40 text-sm capitalize mt-0.5">{businessTypeLabels[formData.businessType] || formData.businessType}</p>
                        <div className="flex gap-1.5 mt-1.5">
                          <div className="w-4 h-4 rounded-full border border-white/15" style={{ background: formData.primaryColor }} />
                          <div className="w-4 h-4 rounded-full border border-white/15" style={{ background: formData.secondaryColor }} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/8 pt-4 grid grid-cols-3 gap-3 text-center">
                      {[
                        { v: formData.services.length, l: 'Services' },
                        { v: formData.features.length, l: 'Features' },
                        { v: formData.products.length, l: 'Products' },
                      ].map(({ v, l }) => (
                        <div key={l} className="bg-white/4 rounded-xl py-2">
                          <div className="text-xl font-bold text-white">{v}</div>
                          <div className="text-xs text-white/35 mt-0.5">{l}</div>
                        </div>
                      ))}
                    </div>

                    {formData.description && (
                      <p className="text-sm text-white/50 border-t border-white/8 pt-3 leading-relaxed line-clamp-2">{formData.description}</p>
                    )}
                  </div>

                  {/* URL preview */}
                  {!isEditMode && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/4 border border-white/8 rounded-xl">
                      <Globe className="w-4 h-4 text-pink-400 shrink-0" />
                      <span className="text-xs text-white/40">Your site will be live at:</span>
                      <span className="text-xs font-mono text-pink-300 truncate">
                        {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'your-business'}.hacksquad.app
                      </span>
                    </div>
                  )}

                  {/* Launch button */}
                  <button
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.description}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
                    style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> {isEditMode ? 'Updating...' : 'Launching...'}</>
                    ) : isEditMode ? (
                      <><RefreshCw className="w-5 h-5" /> Update Website</>
                    ) : (
                      <><Rocket className="w-5 h-5" /> Launch My Website <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* -- Step nav footer -- */}
            <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-t border-white/5 bg-black/20">
              <button
                type="button"
                onClick={() => {
                  const prev = steps[currentStepIdx - 1];
                  if (prev) setActiveStep(prev.key);
                }}
                disabled={currentStepIdx === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="text-xs text-white/30">{currentStepIdx + 1} / {steps.length}</span>

              {activeStep !== 'launch' ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = steps[currentStepIdx + 1];
                    if (next) setActiveStep(next.key);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-150"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !formData.name || !formData.description}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-150 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#9d174d)' }}
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                  {isEditMode ? 'Update' : 'Launch'}
                </button>
              )}
            </div>
          </form>
        </main>
      )}
    </div>
  );
}

