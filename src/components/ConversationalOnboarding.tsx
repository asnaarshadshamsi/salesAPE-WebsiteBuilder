"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeUrl } from "@/actions/business";
import { Button, Input, Textarea } from "@/components/ui";
import { 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  Globe, 
  Sparkles, 
  Building2,
  MessageSquare,
  Users,
  Palette,
  Calendar,
  Check,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Globe2,
  Plus,
  X
} from "lucide-react";

// ==================== TYPES ====================

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
  website?: string;
}

interface LeadFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  options?: string[]; // For select fields
}

interface OnboardingData {
  // Step 1: URL & Source
  sourceUrl: string;
  additionalUrls: string[];
  
  // Step 2: Business Info
  businessName: string;
  businessDescription: string;
  
  // Step 3: Lead Requirements
  leadFormFields: LeadFormField[];
  calendlyUrl: string;
  connectCalendar: boolean;
  
  // Scraped/Generated Data
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
}

// ==================== DEFAULT VALUES ====================

const DEFAULT_LEAD_FIELDS: LeadFormField[] = [
  { id: 'name', label: 'Full Name', type: 'text', required: true },
  { id: 'email', label: 'Email Address', type: 'email', required: true },
  { id: 'phone', label: 'Phone Number', type: 'phone', required: false },
  { id: 'message', label: 'Message', type: 'textarea', required: false },
];

const SUGGESTED_LEAD_FIELDS: LeadFormField[] = [
  { id: 'company', label: 'Company Name', type: 'text', required: false },
  { id: 'budget', label: 'Budget Range', type: 'select', required: false, options: ['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'] },
  { id: 'timeline', label: 'Project Timeline', type: 'select', required: false, options: ['ASAP', '1-2 weeks', '1 month', '2-3 months', 'Flexible'] },
  { id: 'service', label: 'Service Interested In', type: 'select', required: false, options: [] },
  { id: 'referral', label: 'How did you hear about us?', type: 'select', required: false, options: ['Google', 'Social Media', 'Referral', 'Other'] },
  { id: 'address', label: 'Address', type: 'text', required: false },
  { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
];

// ==================== COMPONENT ====================

interface ConversationalOnboardingProps {
  isLoggedIn: boolean;
}

export function ConversationalOnboarding({ isLoggedIn }: ConversationalOnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<OnboardingData>({
    sourceUrl: "",
    additionalUrls: [],
    businessName: "",
    businessDescription: "",
    leadFormFields: [...DEFAULT_LEAD_FIELDS],
    calendlyUrl: "",
    connectCalendar: false,
    logo: null,
    heroImage: null,
    primaryColor: "#ec4899",
    secondaryColor: "#f472b6",
    businessType: "service",
    services: [],
    features: [],
    products: [],
    phone: null,
    email: null,
    address: null,
    socialLinks: null,
    testimonials: null,
  });

  const [newUrl, setNewUrl] = useState("");
  const [newField, setNewField] = useState<LeadFormField>({
    id: '',
    label: '',
    type: 'text',
    required: false,
  });

  // Total steps
  const totalSteps = 4;

  // ==================== URL HANDLING ====================
  
  const handleAddUrl = () => {
    if (newUrl.trim() && !formData.additionalUrls.includes(newUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        additionalUrls: [...prev.additionalUrls, newUrl.trim()]
      }));
      setNewUrl("");
    }
  };

  const handleRemoveUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      additionalUrls: prev.additionalUrls.filter(u => u !== url)
    }));
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

  // ==================== LEAD FIELD HANDLING ====================

  const handleAddLeadField = (field: LeadFormField) => {
    if (field.label.trim()) {
      const newFieldWithId = {
        ...field,
        id: field.id || field.label.toLowerCase().replace(/\s+/g, '_'),
      };
      setFormData(prev => ({
        ...prev,
        leadFormFields: [...prev.leadFormFields, newFieldWithId]
      }));
      setNewField({ id: '', label: '', type: 'text', required: false });
    }
  };

  const handleRemoveLeadField = (id: string) => {
    // Don't allow removing required default fields
    if (['name', 'email'].includes(id)) return;
    
    setFormData(prev => ({
      ...prev,
      leadFormFields: prev.leadFormFields.filter(f => f.id !== id)
    }));
  };

  const handleToggleFieldRequired = (id: string) => {
    // Don't allow changing required status of name/email
    if (['name', 'email'].includes(id)) return;
    
    setFormData(prev => ({
      ...prev,
      leadFormFields: prev.leadFormFields.map(f => 
        f.id === id ? { ...f, required: !f.required } : f
      )
    }));
  };

  // ==================== STEP NAVIGATION ====================

  const handleAnalyzeAndNext = async () => {
    if (!formData.sourceUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    try {
      // Analyze primary URL
      const result = await analyzeUrl(formData.sourceUrl);

      if (result.success && result.data) {
        const data = result.data;
        setFormData(prev => ({
          ...prev,
          businessName: data.name || prev.businessName,
          businessDescription: data.description || prev.businessDescription,
          logo: data.logo || prev.logo,
          heroImage: data.heroImage || prev.heroImage,
          primaryColor: data.primaryColor || prev.primaryColor,
          secondaryColor: data.secondaryColor || prev.secondaryColor,
          businessType: data.businessType || prev.businessType,
          services: data.services || prev.services,
          features: data.features || prev.features,
          products: data.products || prev.products,
          phone: data.phone || prev.phone,
          email: data.email || prev.email,
          address: data.address || prev.address,
          socialLinks: data.socialLinks || prev.socialLinks,
          testimonials: data.testimonials || prev.testimonials,
        }));
        setStep(2);
      } else {
        setError(result.error || "Failed to analyze URL. You can continue anyway.");
        // Still allow user to continue
        setStep(2);
      }
    } catch (err) {
      setError("Error analyzing URL. You can continue anyway.");
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      handleAnalyzeAndNext();
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Store data in sessionStorage and navigate
    const dataToStore = {
      name: formData.businessName,
      description: formData.businessDescription,
      logo: formData.logo,
      heroImage: formData.heroImage,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      businessType: formData.businessType,
      services: formData.services,
      features: formData.features,
      products: formData.products,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      socialLinks: formData.socialLinks,
      testimonials: formData.testimonials,
      sourceUrl: formData.sourceUrl,
      additionalUrls: formData.additionalUrls,
      leadFormFields: formData.leadFormFields,
      calendlyUrl: formData.calendlyUrl,
      connectCalendar: formData.connectCalendar,
    };
    
    sessionStorage.setItem("onboarding_data", JSON.stringify(dataToStore));

    if (!isLoggedIn) {
      router.push("/signup?continue=true");
    } else {
      router.push("/create");
    }
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex items-center ${s < totalSteps ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s <= step
                  ? 'bg-pink-500 text-white'
                  : 'bg-zinc-800 text-gray-400'
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  s < step ? 'bg-pink-500' : 'bg-zinc-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Content</span>
        <span>Business</span>
        <span>Lead Info</span>
        <span>Review</span>
      </div>
    </div>
  );

  // ==================== STEP 1: CONTENT SOURCES ====================

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Palette className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          What content and branding do you already have?
        </h2>
        <p className="text-gray-400 mt-2">
          Share your Instagram, Facebook, website, or any URL where we can find your business info
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Primary URL (Instagram, Facebook, Website, etc.)
        </label>
        <Input
          placeholder="https://instagram.com/yourbusiness or your website URL"
          value={formData.sourceUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
        />
      </div>

      {/* Additional URLs */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Additional Links (optional)
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add more links (Facebook, TikTok, Google Business...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
          />
          <Button variant="outline" onClick={handleAddUrl} className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {formData.additionalUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.additionalUrls.map((url) => {
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
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 w-full mb-1">Quick add:</span>
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
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-amber-400 text-sm bg-amber-500/10 p-3 rounded-lg">
          ⚠️ {error}
        </p>
      )}
    </div>
  );

  // ==================== STEP 2: BUSINESS INFO ====================

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Tell us about your business
        </h2>
        <p className="text-gray-400 mt-2">
          We&apos;ve extracted some info - feel free to edit or add more details
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          What is the name of your business?
        </label>
        <Input
          placeholder="Your Business Name"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          What does your business do?
        </label>
        <Textarea
          placeholder="Describe your business, services, or products..."
          value={formData.businessDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be used to create compelling copy for your website
        </p>
      </div>

      {/* Preview extracted data */}
      {(formData.logo || formData.services.length > 0 || formData.products.length > 0) && (
        <div className="bg-zinc-800/50 rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            Extracted from your content
          </h4>
          
          <div className="flex items-start gap-4">
            {formData.logo && (
              <img 
                src={formData.logo} 
                alt="Logo" 
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded"
                style={{ backgroundColor: formData.primaryColor }}
                title="Primary Color"
              />
              <div 
                className="w-8 h-8 rounded"
                style={{ backgroundColor: formData.secondaryColor }}
                title="Secondary Color"
              />
            </div>
          </div>
          
          {formData.services.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Services found:</p>
              <div className="flex flex-wrap gap-1">
                {formData.services.slice(0, 5).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {formData.products.length > 0 && (
            <p className="text-xs text-gray-400">
              📦 {formData.products.length} products found
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ==================== STEP 3: LEAD REQUIREMENTS ====================

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          What do you need to know about a lead?
        </h2>
        <p className="text-gray-400 mt-2">
          Customize your lead form to capture the information you need
        </p>
      </div>

      {/* Current Fields */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          Lead Form Fields
        </label>
        <div className="space-y-2">
          {formData.leadFormFields.map((field) => (
            <div 
              key={field.id}
              className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-300">{field.label}</span>
                <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded text-gray-400">
                  {field.type}
                </span>
                {field.required && (
                  <span className="text-xs px-2 py-0.5 bg-pink-500/20 rounded text-pink-400">
                    required
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!['name', 'email'].includes(field.id) && (
                  <>
                    <button
                      onClick={() => handleToggleFieldRequired(field.id)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      {field.required ? 'Make optional' : 'Make required'}
                    </button>
                    <button
                      onClick={() => handleRemoveLeadField(field.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Suggested Fields */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Add more fields
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_LEAD_FIELDS
            .filter(f => !formData.leadFormFields.some(ff => ff.id === f.id))
            .map((field) => (
              <button
                key={field.id}
                onClick={() => handleAddLeadField(field)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-gray-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {field.label}
              </button>
            ))}
        </div>
      </div>

      {/* Custom Field */}
      <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-300">
          Add a custom field
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="Field label"
            value={newField.label}
            onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
            className="flex-1"
          />
          <select
            value={newField.type}
            onChange={(e) => setNewField(prev => ({ 
              ...prev, 
              type: e.target.value as LeadFormField['type']
            }))}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-300 text-sm"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="textarea">Text Area</option>
          </select>
          <Button 
            variant="outline" 
            onClick={() => handleAddLeadField(newField)}
            disabled={!newField.label.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Integration */}
      <div className="border-t border-zinc-800 pt-6">
        <div className="flex items-start gap-3 mb-4">
          <Calendar className="w-5 h-5 text-pink-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-300">
              Calendar Integration
            </h4>
            <p className="text-xs text-gray-500">
              Allow leads to book meetings directly from your website
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">
            Calendly URL (optional)
          </label>
          <Input
            placeholder="https://calendly.com/yourbusiness"
            value={formData.calendlyUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, calendlyUrl: e.target.value }))}
          />
        </div>

        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.connectCalendar}
            onChange={(e) => setFormData(prev => ({ ...prev, connectCalendar: e.target.checked }))}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-pink-500 focus:ring-pink-500"
          />
          <span className="text-sm text-gray-300">
            Connect Google Calendar (set up after website creation)
          </span>
        </label>
      </div>
    </div>
  );

  // ==================== STEP 4: REVIEW ====================

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Ready to launch!
        </h2>
        <p className="text-gray-400 mt-2">
          Here&apos;s what we&apos;ll create for you
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Website Card */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-pink-500" />
            <h4 className="font-medium text-white">Custom Website</h4>
          </div>
          <div className="pl-8 space-y-1 text-sm text-gray-400">
            <p>✓ {formData.businessName || 'Your Business'}.PoweredbyAPE.ai</p>
            <p>✓ Optimized for local SEO</p>
            <p>✓ Mobile responsive design</p>
            <p>✓ A/B testing enabled</p>
          </div>
        </div>

        {/* Lead Capture Card */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-pink-500" />
            <h4 className="font-medium text-white">Lead Capture</h4>
          </div>
          <div className="pl-8 space-y-1 text-sm text-gray-400">
            <p>✓ Custom lead form with {formData.leadFormFields.length} fields</p>
            <p>✓ Lead storage (CRM)</p>
            <p>✓ Email notifications</p>
            <p>✓ Auto-response to leads</p>
          </div>
        </div>

        {/* Calendar Card */}
        {(formData.calendlyUrl || formData.connectCalendar) && (
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-pink-500" />
              <h4 className="font-medium text-white">Scheduling</h4>
            </div>
            <div className="pl-8 space-y-1 text-sm text-gray-400">
              {formData.calendlyUrl && <p>✓ Calendly integration</p>}
              {formData.connectCalendar && <p>✓ Google Calendar connection</p>}
              <p>✓ Meeting tracking in CRM</p>
            </div>
          </div>
        )}

        {/* Email Card */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-pink-500" />
            <h4 className="font-medium text-white">Email</h4>
          </div>
          <div className="pl-8 space-y-1 text-sm text-gray-400">
            <p>✓ {formData.businessName?.toLowerCase().replace(/\s+/g, '') || 'yourbusiness'}@PoweredbyAPE.ai</p>
            <p>✓ Lead notifications</p>
            <p>✓ Auto-response emails</p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
        <h4 className="font-medium text-pink-400 mb-2">What happens next?</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400">
          <li>{isLoggedIn ? 'Review and customize your website' : 'Create your free account'}</li>
          <li>Your website goes live instantly</li>
          <li>Start receiving leads and managing them in your dashboard</li>
        </ol>
      </div>
    </div>
  );

  // ==================== LOADING STATE ====================

  if (isAnalyzing) {
    return (
      <div className="max-w-xl mx-auto bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-pink-500/20">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-500/30 rounded-full animate-spin border-t-pink-500" />
            <Sparkles className="w-6 h-6 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg text-white">Analyzing your content...</p>
          <p className="text-sm text-gray-400 mt-2">
            Extracting branding, products, and business info
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-gray-400">
            <span className="px-2 py-1 bg-zinc-800 rounded animate-pulse">🔍 Scanning pages</span>
            <span className="px-2 py-1 bg-zinc-800 rounded animate-pulse">🎨 Extracting colors</span>
            <span className="px-2 py-1 bg-zinc-800 rounded animate-pulse">📦 Finding products</span>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="max-w-xl mx-auto bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-pink-500/20">
      {renderProgressBar()}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        {step < totalSteps ? (
          <Button 
            onClick={handleNext} 
            className="flex-1"
            disabled={step === 1 && !formData.sourceUrl.trim()}
          >
            {step === 1 ? 'Analyze & Continue' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleComplete} className="flex-1">
            {isLoggedIn ? 'Create My Website' : 'Sign Up & Create'}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
