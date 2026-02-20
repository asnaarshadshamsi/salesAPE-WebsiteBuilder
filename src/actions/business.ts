"use server";

import { requireAuth } from "@/lib/auth";
import { businessService, businessAnalyzerService, voiceAnalyzerService } from "@/services/business";
import { revalidatePath } from "next/cache";
import { CreateBusinessInput, BusinessWithSite } from "@/types";

export type { BusinessWithSite } from "@/types";

// ==================== ANALYZE URL ====================

export interface AnalyzeResult {
  success: boolean;
  data?: {
    name: string;
    description: string;
    logo: string | null;
    heroImage: string | null;
    primaryColor: string;
    secondaryColor: string;
    businessType: string;
    services: string[];
    features: string[];
    products: any[];
    phone: string | null;
    email: string | null;
    address: string | null;
    socialLinks: any;
    testimonials: any[];
    galleryImages: string[];
    sourceUrl: string;
    // Enhanced data from multi-page scraper
    aboutContent?: string;
    confidence?: string;
  };
  error?: string;
}

export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  try {
    const data = await businessAnalyzerService.analyzeUrl(url);
    return { success: true, data };
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze URL. Please try again." 
    };
  }
}

// ==================== ANALYZE VOICE INPUT ====================

export interface VoiceAnalyzeResult {
  success: boolean;
  data?: {
    name: string;
    description: string;
    businessType: string;
    services: string[];
    features: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    primaryColor: string;
    secondaryColor: string;
    targetAudience: string | null;
    uniqueSellingPoints: string[];
  };
  error?: string;
}

export async function analyzeVoiceInput(voiceTranscript: string): Promise<VoiceAnalyzeResult> {
  try {
    const data = await voiceAnalyzerService.analyzeVoiceInput(voiceTranscript);
    return { success: true, data };
  } catch (error) {
    console.error("Error analyzing voice input:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze voice input." 
    };
  }
}

// ==================== GENERATE WEBSITE FROM CHATBOT DATA ====================

/**
 * Use Cohere to generate a story-type SEO About section and
 * per-service compelling descriptions in a single call.
 */
async function generateAIWebsiteContent(data: {
  name: string;
  businessType: string;
  services: string[];
  uniqueSellingPoint?: string;
  targetAudience?: string;
  city?: string;
}): Promise<{ aboutStory: string; serviceDescriptions: { name: string; description: string }[] }> {
  const { cohereGenerate } = await import('@/lib/cohere-ai');
  const { name, businessType, services, uniqueSellingPoint, targetAudience, city } = data;
  const serviceList = services.length > 0 ? services.join(', ') : 'professional services';

  const prompt = `You are a professional website copywriter. Write for "${name}", a ${businessType} business${city ? ` in ${city}` : ''}.
Keywords: ${serviceList}${uniqueSellingPoint ? `. USP: ${uniqueSellingPoint}` : ''}${targetAudience ? `. Target audience: ${targetAudience}` : ''}

TASK 1 - Write a beautiful 3-paragraph About Us story. Warm, SEO-friendly, reads like a brand journey:
- Paragraph 1: The founding story or mission and values (2 sentences)
- Paragraph 2: What they excel at, their expertise and offerings (2 sentences)
- Paragraph 3: What makes them unique + a customer promise (2 sentences)

TASK 2 - For each service listed, write a compelling 1-2 sentence description that highlights outcomes and benefits:
${services.map((s, i) => `${i + 1}. ${s}`).join('\n')}

RESPOND IN EXACTLY THIS FORMAT (no extra text):
ABOUT_START
[paragraph 1]

[paragraph 2]

[paragraph 3]
ABOUT_END
SERVICES_START
${services.map(s => `${s}||[description]`).join('\n')}
SERVICES_END`;

  try {
    const result = await cohereGenerate(prompt, { maxTokens: 900, temperature: 0.65 });
    if (!result) throw new Error('Empty response');

    // Parse about story
    const aboutMatch = result.match(/ABOUT_START\n([\s\S]*?)\nABOUT_END/i);
    const aboutStory = aboutMatch?.[1]?.trim() || '';

    // Parse service descriptions
    const servicesMatch = result.match(/SERVICES_START\n([\s\S]*?)\nSERVICES_END/i);
    const servicesText = servicesMatch?.[1]?.trim() || '';

    const serviceDescriptions: { name: string; description: string }[] = services.map(service => {
      const line = servicesText.split('\n').find(l => l.toLowerCase().startsWith(service.toLowerCase() + '||'));
      const desc = line?.split('||')[1]?.trim();
      return {
        name: service,
        description: desc || `Professional ${service.toLowerCase()} services designed to deliver outstanding results for every client.`,
      };
    });

    return {
      aboutStory: aboutStory ||
        `${name} was founded with a simple but powerful mission: to deliver exceptional ${serviceList} to every client.\n\nOur team brings deep expertise in ${businessType}, combining industry knowledge with a genuine passion for customer success.\n\nWhat makes us different is our unwavering commitment to quality — we don't just meet expectations, we exceed them at every turn.`,
      serviceDescriptions,
    };
  } catch (err) {
    console.error('[generateAIWebsiteContent] Cohere failed, using templates:', err);
    const EnhancedContentGenerator = (await import('@/services/enhanced-content-generator.service')).default;
    return {
      aboutStory: EnhancedContentGenerator.generateAboutText(name, businessType, city),
      serviceDescriptions: EnhancedContentGenerator.generateServiceDescriptions(businessType, services),
    };
  }
}

// Helper: Analyze chatbot conversation with AI to extract detailed business info
async function analyzeChatbotConversation(chatbotData: {
  name?: string;
  description?: string;
  businessType?: string;
  services?: string[];
  uniqueSellingPoint?: string;
  targetAudience?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<{
  refinedBusinessType: string;
  businessKeywords: string[];
  imageSearchTerms: string[];
  detailedDescription: string;
}> {
  // Create a conversation summary for AI analysis
  const conversationSummary = `
Business Name: ${chatbotData.name || 'Not specified'}
Business Type: ${chatbotData.businessType || 'Not specified'}
Description: ${chatbotData.description || 'Not specified'}
Services/Products: ${chatbotData.services?.join(', ') || 'Not specified'}
Unique Selling Point: ${chatbotData.uniqueSellingPoint || 'Not specified'}
Target Audience: ${chatbotData.targetAudience || 'Not specified'}
`.trim();

  console.log('[analyzeChatbotConversation] Analyzing:', conversationSummary);

  const { cohereGenerate } = await import('@/lib/cohere-ai');
  
  const prompt = `You are an AI business analyst. Analyze this business information and extract key details:

${conversationSummary}

Based on this information, provide:
1. The most accurate business type category
2. 3-5 specific keywords that describe what this business offers (products/services)
3. 4 search terms for finding relevant images (be specific to what they actually sell/do)
4. A compelling 2-sentence description of the business

Format your response EXACTLY like this:
BUSINESS_TYPE: [ecommerce, restaurant, service, healthcare, fitness, beauty, realestate, agency, portfolio, education, or other]
KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5]
IMAGE_TERMS: [specific image search term 1, term 2, term 3, term 4]
DESCRIPTION: [Your compelling 2-sentence description that mentions what they do]
--END--

CRITICAL RULES FOR IMAGE TERMS:
- BE EXTREMELY SPECIFIC about products/services mentioned
- Use the EXACT products/services they sell, not generic business type
- Examples by industry:
  * Flower/bouquet shop: "flower bouquet, fresh flowers, floral arrangement, flower shop interior"
  * Gym/Fitness: "gym equipment, fitness training, workout facility, gym interior"
  * Restaurant: "restaurant interior, food plating, fine dining, restaurant atmosphere"
  * Bakery: "fresh bread, bakery products, pastries display, bakery interior"
  * Hair salon: "hair styling, salon interior, hairstylist working, beauty salon"
  * Coffee shop: "coffee barista, cafe interior, coffee cup, coffee beans"
  * Clothing store: "fashion boutique, clothing display, retail store, fashion interior"
  * Car repair: "auto mechanic, car service, garage workshop, automotive repair"
  * Real estate: "luxury homes, house property, real estate agent, modern house"
  * Law firm: "law office, legal consultation, lawyer meeting, professional office"
  * Dental clinic: "dental office, dentist working, dental equipment, modern clinic"
  * Marketing agency: "creative team, office workspace, marketing strategy, team collaboration"
  * Photography studio: "photography equipment, photo studio, photographer working, camera gear"

CRITICAL RULES FOR BUSINESS TYPE:
- Flower shop, boutique, retail store, clothing shop = ecommerce
- Gym, fitness center, yoga studio, personal training = fitness
- Hair salon, nail salon, spa, barber = beauty
- Restaurant, cafe, bakery, food truck = restaurant
- Dentist, doctor, clinic, medical center = healthcare
- Real estate agency, property management = realestate
- Marketing agency, design studio, consulting = agency
- Auto repair, plumbing, HVAC, cleaning = service

CRITICAL RULES FOR DESCRIPTION:
- Must mention the specific business name
- Must include what products/services they offer
- Must be engaging and customer-focused
- Example: "${chatbotData.name || 'This business'} specializes in [SPECIFIC PRODUCTS/SERVICES], delivering [VALUE PROPOSITION] to [TARGET AUDIENCE]."`;

  try {
    const result = await cohereGenerate(prompt, { maxTokens: 300, temperature: 0.7 });
    
    if (!result) throw new Error('No AI response');
    
    console.log('[analyzeChatbotConversation] AI response:', result);
    
    // Parse AI response
    const extractField = (fieldName: string): string => {
      const regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\n[A-Z_]+:|--END--|$)`, 'is');
      const match = result.match(regex);
      return match?.[1]?.trim() || '';
    };

    const businessType = extractField('BUSINESS_TYPE').toLowerCase() || chatbotData.businessType || 'service';
    const keywords = extractField('KEYWORDS').split(',').map(k => k.trim()).filter(Boolean);
    const imageTerms = extractField('IMAGE_TERMS').split(',').map(t => t.trim()).filter(Boolean);
    const description = extractField('DESCRIPTION') || chatbotData.description || 'A great business serving our community';

    return {
      refinedBusinessType: businessType,
      businessKeywords: keywords.length > 0 ? keywords : [chatbotData.businessType || 'business'],
      imageSearchTerms: imageTerms.length > 0 ? imageTerms : [chatbotData.businessType || 'business'],
      detailedDescription: description
    };
  } catch (error) {
    console.error('[analyzeChatbotConversation] AI analysis failed:', error);
    // Fallback to basic analysis
    const services = chatbotData.services || [];
    const description = chatbotData.description || '';
    
    return {
      refinedBusinessType: chatbotData.businessType || 'service',
      businessKeywords: services.slice(0, 5),
      imageSearchTerms: services.slice(0, 4).map(s => s.toLowerCase()),
      detailedDescription: description || `Welcome to ${chatbotData.name}, your trusted partner for ${services.join(', ') || 'excellent services'}.`
    };
  }
}

export async function generateWebsiteFromChatbot(chatbotData: {
  name?: string;
  description?: string;
  businessType?: string;
  services?: string[];
  uniqueSellingPoint?: string;
  targetAudience?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log('[generateWebsiteFromChatbot] Starting with data:', chatbotData);
    
    // First, analyze the conversation with AI
    const aiAnalysis = await analyzeChatbotConversation(chatbotData);
    console.log('[generateWebsiteFromChatbot] AI analysis:', aiAnalysis);

    const businessName = chatbotData.name || 'My Business';

    // Resolve the most specific business type:
    // prefer the raw chatbot type (e.g. "flowershop") over the AI broad type (e.g. "ecommerce")
    const specificType = resolveBusinessType(chatbotData.businessType) || aiAnalysis.refinedBusinessType;

    // Use EnhancedContentGenerator for type-specific, high-quality copy
    const EnhancedContentGenerator = (await import('@/services/enhanced-content-generator.service')).default;
    const city = extractCity(chatbotData.address);

    // Generate rich AI about story + per-service descriptions via a single Cohere call
    const aiContent = await generateAIWebsiteContent({
      name: businessName,
      businessType: specificType,
      services: chatbotData.services || [],
      uniqueSellingPoint: chatbotData.uniqueSellingPoint,
      targetAudience: chatbotData.targetAudience,
      city,
    });

    const aboutText = aiContent.aboutStory;

    const headline    = EnhancedContentGenerator.generateHeadline(businessName, specificType);
    const subheadline = EnhancedContentGenerator.generateSubheadline(businessName, specificType);
    const ctaText     = EnhancedContentGenerator.generateCTAText(specificType, 'primary');
    const valueProps  = EnhancedContentGenerator.generateValuePropositions(businessName, specificType);

    console.log('[generateWebsiteFromChatbot] Enhanced content generated for type:', specificType);

    // Generate colors based on resolved business type
    const colors = getBusinessTypeColors(specificType);
    
    // Fetch type-appropriate images via BusinessImageService (uses Unsplash API + static fallbacks)
    const BusinessImageService = (await import('@/services/business-image.service')).default;
    const [heroImage, galleryImages] = await Promise.all([
      BusinessImageService.getHeroImage(specificType as any),
      BusinessImageService.getGalleryImages(specificType as any, 8),
    ]);

    const logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&size=200&background=${colors.primary.replace('#', '')}&color=fff&bold=true`;

    // Generate testimonials
    const testimonials = generateTestimonials(specificType, businessName);

    // Build services list — use AI-generated descriptions from generateAIWebsiteContent
    const enhancedServices = (chatbotData.services || []).map((service) => {
      const svcDesc = aiContent.serviceDescriptions.find(sd => sd.name === service);
      return {
        title: service,
        description: svcDesc?.description || `Professional ${service.toLowerCase()} services tailored to your needs.`,
        icon: getServiceIcon(service),
      };
    });

    // Create features from value propositions + unique selling point
    const features = [
      ...valueProps.slice(0, 3).map((v: string) => ({ title: v, description: '', icon: '✨' })),
      ...(chatbotData.uniqueSellingPoint ? [{ title: 'Our Advantage', description: chatbotData.uniqueSellingPoint, icon: '🌟' }] : []),
    ];

    const enrichedData = {
      name: businessName,
      description: aboutText,
      logo,
      heroImage,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      businessType: specificType,
      services: enhancedServices,
      // AI-generated per-service descriptions for the Our Services section
      serviceDescriptions: aiContent.serviceDescriptions,
      features,
      phone: chatbotData.phone || null,
      email: chatbotData.email || null,
      address: chatbotData.address || null,
      testimonials,
      galleryImages,
      heroHeadline: headline,
      heroSubheadline: subheadline,
      ctaText,
      socialLinks: null,
    };

    console.log('[generateWebsiteFromChatbot] Enriched data created:', enrichedData);

    return { success: true, data: enrichedData };
  } catch (error) {
    console.error('[generateWebsiteFromChatbot] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate website content'
    };
  }
}

// Helper: Resolve raw chatbot business type string → EnhancedContentGenerator key
function resolveBusinessType(raw?: string): string {
  if (!raw) return '';
  const t = raw.toLowerCase().replace(/\s+/g, '');
  const map: Record<string, string> = {
    flowershop: 'flowershop', florist: 'flowershop', flowerstore: 'flowershop', bouquet: 'flowershop', flowers: 'flowershop',
    perfume: 'perfume', fragrance: 'perfume', perfumery: 'perfume',
    cafe: 'cafe', coffee: 'cafe', coffeeshop: 'cafe',
    bakery: 'bakery', bread: 'bakery', pastry: 'bakery',
    restaurant: 'restaurant', dining: 'restaurant', eatery: 'restaurant',
    spa: 'spa', wellness: 'spa', massage: 'spa',
    beauty: 'beauty', beautysalon: 'beauty', salon: 'beauty',
    barbershop: 'barbershop', barber: 'barbershop',
    gym: 'gym', fitness: 'fitness', yoga: 'yoga',
    jewelry: 'jewelry', jeweler: 'jewelry', jewellery: 'jewelry',
    photography: 'photography', photographer: 'photography', photostudio: 'photography',
    dental: 'dental', dentist: 'dental', dentistry: 'dental',
    hotel: 'hotel', hospitality: 'hotel',
    law: 'law', lawfirm: 'law', legal: 'law', lawyer: 'law',
    accounting: 'accounting', accountant: 'accounting', cpa: 'accounting',
    healthcare: 'healthcare', medical: 'healthcare', clinic: 'healthcare', doctor: 'healthcare',
    cleaning: 'cleaning', cleaningservice: 'cleaning',
    petcare: 'petcare', pets: 'petcare', petshop: 'petcare', vet: 'petcare',
    events: 'events', eventplanning: 'events',
    catering: 'catering',
    tech: 'tech', technology: 'tech', software: 'tech',
    startup: 'startup',
    consulting: 'consulting', consultant: 'consulting',
    realestate: 'realestate', property: 'realestate', realtor: 'realestate',
    education: 'education', school: 'education', tutoring: 'education',
    ecommerce: 'ecommerce', store: 'ecommerce', shop: 'ecommerce', boutique: 'ecommerce', retail: 'ecommerce',
    agency: 'agency', digitalagency: 'agency', marketingagency: 'agency',
  };
  // Try exact match first
  if (map[t]) return map[t];
  // Try partial match
  for (const [key, val] of Object.entries(map)) {
    if (t.includes(key) || key.includes(t)) return val;
  }
  return t;
}

// Helper: Extract city from address string
function extractCity(address?: string | null): string | undefined {
  if (!address) return undefined;
  // Simple heuristic: last comma-separated segment often is "City, State ZIP"
  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2];
  return parts[0] || undefined;
}

// Helper: Get colors based on business type
function getBusinessTypeColors(businessType: string): { primary: string; secondary: string } {
  const colorMap: Record<string, { primary: string; secondary: string }> = {
    // Shopping & Retail
    ecommerce: { primary: '#ec4899', secondary: '#f472b6' },
    store: { primary: '#ec4899', secondary: '#f472b6' },
    shop: { primary: '#ec4899', secondary: '#f472b6' },
    boutique: { primary: '#ec4899', secondary: '#f472b6' },
    // Flowers & Plants
    flowershop: { primary: '#f472b6', secondary: '#fbbf24' },
    flower: { primary: '#f472b6', secondary: '#fbbf24' },
    flowers: { primary: '#f472b6', secondary: '#fbbf24' },
    florist: { primary: '#f472b6', secondary: '#fbbf24' },
    bouquet: { primary: '#f472b6', secondary: '#fbbf24' },
    // Fragrance
    perfume: { primary: '#9333ea', secondary: '#c084fc' },
    fragrance: { primary: '#9333ea', secondary: '#c084fc' },
    // Food & Beverage
    restaurant: { primary: '#f97316', secondary: '#fb923c' },
    cafe: { primary: '#f59e0b', secondary: '#fbbf24' },
    food: { primary: '#ef4444', secondary: '#f87171' },
    bakery: { primary: '#d97706', secondary: '#f59e0b' },
    catering: { primary: '#ea580c', secondary: '#f97316' },
    // Fitness & Wellness
    gym: { primary: '#ef4444', secondary: '#f87171' },
    fitness: { primary: '#dc2626', secondary: '#ef4444' },
    yoga: { primary: '#8b5cf6', secondary: '#a78bfa' },
    workout: { primary: '#b91c1c', secondary: '#dc2626' },
    // Beauty & Wellness
    salon: { primary: '#ec4899', secondary: '#f472b6' },
    beauty: { primary: '#d946ef', secondary: '#e879f9' },
    spa: { primary: '#a855f7', secondary: '#c084fc' },
    barbershop: { primary: '#0f172a', secondary: '#1e293b' },
    // Jewelry
    jewelry: { primary: '#ca8a04', secondary: '#eab308' },
    jewellery: { primary: '#ca8a04', secondary: '#eab308' },
    // Photography
    photography: { primary: '#1e293b', secondary: '#334155' },
    // Medical & Dental
    dental: { primary: '#06b6d4', secondary: '#22d3ee' },
    healthcare: { primary: '#10b981', secondary: '#34d399' },
    medical: { primary: '#059669', secondary: '#10b981' },
    // Hospitality
    hotel: { primary: '#b45309', secondary: '#d97706' },
    // Legal & Finance
    law: { primary: '#1e3a5f', secondary: '#1e40af' },
    accounting: { primary: '#0f4c75', secondary: '#0369a1' },
    // Services
    cleaning: { primary: '#0284c7', secondary: '#0ea5e9' },
    petcare: { primary: '#16a34a', secondary: '#22c55e' },
    events: { primary: '#7c3aed', secondary: '#8b5cf6' },
    tech: { primary: '#2563eb', secondary: '#3b82f6' },
    startup: { primary: '#4f46e5', secondary: '#6366f1' },
    // Business Services
    agency: { primary: '#3b82f6', secondary: '#60a5fa' },
    consulting: { primary: '#6366f1', secondary: '#818cf8' },
    // Education
    education: { primary: '#06b6d4', secondary: '#22d3ee' },
    school: { primary: '#0ea5e9', secondary: '#38bdf8' },
    course: { primary: '#0284c7', secondary: '#0ea5e9' },
    // Real Estate
    realestate: { primary: '#0891b2', secondary: '#06b6d4' },
    // Creative
    design: { primary: '#8b5cf6', secondary: '#a78bfa' },
    creative: { primary: '#7c3aed', secondary: '#8b5cf6' },
    studio: { primary: '#6d28d9', secondary: '#7c3aed' },
    default: { primary: '#6366f1', secondary: '#818cf8' }
  };

  const lower = businessType.toLowerCase();
  
  // Check for specific flower/plant keywords first
  if (lower.includes('flower') || lower.includes('bouquet') || lower.includes('florist')) {
    return colorMap.flower;
  }
  
  for (const [key, colors] of Object.entries(colorMap)) {
    if (lower.includes(key)) return colors;
  }
  return colorMap.default;
}

// Helper: Generate gallery images
function generateGalleryImages(keyword: string): string[] {
  const unsplashQueries = {
    gym: ['gym-equipment', 'fitness-workout', 'gym-interior', 'weightlifting'],
    fitness: ['fitness-class', 'personal-training', 'yoga-studio', 'exercise'],
    restaurant: ['restaurant-interior', 'food-plating', 'dining-experience', 'chef-cooking'],
    cafe: ['coffee-shop', 'barista', 'cafe-interior', 'latte-art'],
    salon: ['hair-salon', 'beauty-salon', 'hairstyling', 'salon-interior'],
    beauty: ['beauty-treatment', 'spa-treatment', 'makeup-artist', 'skincare'],
    store: ['retail-store', 'shopping', 'store-display', 'boutique'],
    shop: ['shop-interior', 'products-display', 'retail-shopping', 'store-front'],
    agency: ['office-team', 'creative-workspace', 'team-meeting', 'modern-office'],
    default: ['business-office', 'professional-workspace', 'team-collaboration', 'modern-interior']
  };

  const lower = keyword.toLowerCase();
  let queries = unsplashQueries.default;
  
  for (const [key, value] of Object.entries(unsplashQueries)) {
    if (lower.includes(key)) {
      queries = value;
      break;
    }
  }

  return queries.map(query => 
    `https://images.unsplash.com/photo-${Math.random().toString().slice(2, 15)}?w=800&h=600&q=80&fit=crop&auto=format&q=80&query=${encodeURIComponent(query)}`
  ).slice(0, 4);
}

// Helper: Generate testimonials
function generateTestimonials(businessType: string, businessName: string): Array<{ name: string; text: string; rating: number }> {
  const templates = {
    ecommerce: [
      {
        name: 'Sarah Mitchell',
        text: `Love shopping at ${businessName}! The products are high quality and the delivery is always fast. Highly recommend!`,
        rating: 5
      },
      {
        name: 'Jessica Williams',
        text: `Amazing selection and great customer service. ${businessName} is my go-to for all my shopping needs.`,
        rating: 5
      },
      {
        name: 'Emma Davis',
        text: `The quality exceeded my expectations! Beautiful products and wonderful experience shopping here.`,
        rating: 5
      }
    ],
    flower: [
      {
        name: 'Emily Parker',
        text: `The bouquets from ${businessName} are absolutely stunning! Fresh flowers beautifully arranged. Perfect for every occasion!`,
        rating: 5
      },
      {
        name: 'Michael Chen',
        text: `Ordered flowers for my wife's birthday and she was thrilled! The arrangement was gorgeous and lasted for weeks.`,
        rating: 5
      },
      {
        name: 'Sophie Anderson',
        text: `Best flower shop in town! The floral designs are creative and the flowers are always fresh. Thank you ${businessName}!`,
        rating: 5
      }
    ],
    gym: [
      {
        name: 'Sarah Johnson',
        text: `${businessName} transformed my fitness journey! The trainers are incredibly supportive and the results speak for themselves.`,
        rating: 5
      },
      {
        name: 'Mike Rodriguez',
        text: `Best gym I've ever joined. The equipment is top-notch and the community is amazing. Highly recommend!`,
        rating: 5
      },
      {
        name: 'Emily Chen',
        text: `The personal training sessions here are outstanding. I've achieved goals I never thought possible!`,
        rating: 5
      }
    ],
    fitness: [
      {
        name: 'David Martinez',
        text: `Life-changing experience! The classes are energizing and the instructors are world-class.`,
        rating: 5
      },
      {
        name: 'Lisa Anderson',
        text: `I've tried many fitness programs, but this one truly delivers results. Love the supportive atmosphere!`,
        rating: 5
      }
    ],
    restaurant: [
      {
        name: 'James Wilson',
        text: `Absolutely incredible food! Every dish is a masterpiece. ${businessName} is now our go-to restaurant.`,
        rating: 5
      },
      {
        name: 'Maria Garcia',
        text: `The ambiance is perfect and the service is impeccable. A true culinary experience!`,
        rating: 5
      }
    ],
    beauty: [
      {
        name: 'Amanda Brooks',
        text: `Best salon experience ever! The stylists are talented and really listen to what you want.`,
        rating: 5
      },
      {
        name: 'Jennifer Lee',
        text: `I always leave feeling pampered and beautiful. ${businessName} is simply the best!`,
        rating: 5
      }
    ],
    healthcare: [
      {
        name: 'Robert Mitchell',
        text: `${businessName} provides exceptional care. The staff is professional, caring, and truly dedicated to patient wellness.`,
        rating: 5
      },
      {
        name: 'Patricia Davis',
        text: `Best healthcare experience I've had. They really take the time to listen and provide personalized treatment.`,
        rating: 5
      }
    ],
    realestate: [
      {
        name: 'David Thompson',
        text: `${businessName} helped us find our dream home! Professional service and incredible market knowledge.`,
        rating: 5
      },
      {
        name: 'Laura Martinez',
        text: `Sold our house in just 2 weeks! Their marketing strategy and expertise made all the difference.`,
        rating: 5
      }
    ],
    agency: [
      {
        name: 'Mark Stevens',
        text: `Working with ${businessName} transformed our business. Their creative solutions and strategic thinking are outstanding!`,
        rating: 5
      },
      {
        name: 'Sarah Coleman',
        text: `Incredible team! They delivered beyond our expectations and really understood our brand vision.`,
        rating: 5
      }
    ],
    cafe: [
      {
        name: 'Jessica Turner',
        text: `Best coffee in town! ${businessName} is my morning ritual. Great atmosphere and friendly baristas.`,
        rating: 5
      },
      {
        name: 'Alex Rodriguez',
        text: `Love this place! Perfect spot for meetings or working. Amazing coffee and delicious pastries.`,
        rating: 5
      }
    ],
    education: [
      {
        name: 'Michelle Park',
        text: `${businessName} completely changed my career path. The instructors are knowledgeable and truly invested in student success.`,
        rating: 5
      },
      {
        name: 'James Wilson',
        text: `Outstanding learning experience! Practical skills, great curriculum, and supportive community.`,
        rating: 5
      }
    ],
    service: [
      {
        name: 'Daniel Brown',
        text: `${businessName} is reliable, professional, and delivers excellent results every time. Highly recommend!`,
        rating: 5
      },
      {
        name: 'Karen White',
        text: `Fast, efficient, and reasonably priced. They've been my go-to for years and never disappoint!`,
        rating: 5
      }
    ],
    default: [
      {
        name: 'Alex Thompson',
        text: `Outstanding service and exceptional quality. ${businessName} exceeded all my expectations!`,
        rating: 5
      },
      {
        name: 'Rachel Kim',
        text: `Professional, reliable, and excellent value. I highly recommend their services to everyone!`,
        rating: 5
      },
      {
        name: 'Chris Johnson',
        text: `From start to finish, the experience was seamless. Truly impressed with their attention to detail!`,
        rating: 5
      }
    ]
  };

  const lower = businessType.toLowerCase();
  
  // Check for specific keywords in business type or services
  if (lower.includes('flower') || lower.includes('bouquet') || lower.includes('florist')) {
    return templates.flower;
  }
  
  for (const [key, value] of Object.entries(templates)) {
    if (lower.includes(key)) return value;
  }
  return templates.default;
}

// Helper: Get service icon
function getServiceIcon(serviceName: string): string {
  const icons: Record<string, string> = {
    // Fitness & Sports
    training: '💪',
    personal: '🎯',
    group: '👥',
    yoga: '🧘',
    pilates: '🤸',
    cardio: '🏃',
    crossfit: '🏋️',
    boxing: '🥊',
    swimming: '🏊',
    cycling: '🚴',
    // Beauty & Wellness
    massage: '💆',
    facial: '✨',
    hair: '💇',
    nails: '💅',
    makeup: '💄',
    spa: '🧖',
    waxing: '🪒',
    tattoo: '🎨',
    // Flowers & Plants
    flower: '🌸',
    flowers: '🌺',
    bouquet: '💐',
    bouquets: '💐',
    arrangement: '🌷',
    wedding: '💒',
    funeral: '⚰️',
    roses: '🌹',
    plants: '🌿',
    garden: '🏡',
    landscaping: '🌳',
    // Food & Restaurant
    food: '🍽️',
    delivery: '🚚',
    catering: '🎉',
    dining: '🍴',
    takeout: '🥡',
    pizza: '🍕',
    burger: '🍔',
    sushi: '🍣',
    coffee: '☕',
    dessert: '🍰',
    bakery: '🥖',
    // Business Services
    consultation: '💬',
    consulting: '💼',
    design: '🎨',
    development: '💻',
    marketing: '📱',
    strategy: '📊',
    accounting: '📈',
    legal: '⚖️',
    insurance: '🛡️',
    financial: '💰',
    // Healthcare
    medical: '⚕️',
    dental: '🦷',
    therapy: '🧠',
    nutrition: '🥗',
    pharmacy: '💊',
    examination: '🩺',
    surgery: '🏥',
    // Home Services
    cleaning: '🧹',
    plumbing: '🔧',
    electrical: '⚡',
    hvac: '❄️',
    painting: '🖌️',
    carpentry: '🔨',
    moving: '📦',
    // Automotive
    repair: '🔧',
    auto: '🚗',
    mechanic: '⚙️',
    detailing: '✨',
    car: '🚙',
    oil: '🛢️',
    // Real Estate
    property: '🏠',
    buying: '🏡',
    selling: '💵',
    rental: '🔑',
    inspection: '🔍',
    // Education
    tutoring: '📚',
    course: '🎓',
    training: '👨‍🏫',
    workshop: '🛠️',
    lesson: '📝',
    class: '🏫',
    // Photography & Media
    photography: '📷',
    video: '🎥',
    editing: '✂️',
    photo: '📸',
    // Shopping & Retail
    shopping: '🛍️',
    retail: '🏪',
    store: '🏬',
    boutique: '👗',
    clothing: '👔',
    shoes: '👠',
    accessories: '👜',
    jewelry: '💎',
    // Technology
    website: '🌐',
    app: '📱',
    software: '💾',
    tech: '🖥️',
    support: '🛟',
    // Default
    default: '⭐'
  };

  const lower = serviceName.toLowerCase();
  for (const [key, icon] of Object.entries(icons)) {
    if (lower.includes(key)) return icon;
  }
  return icons.default;
}

// ==================== CREATE BUSINESS ====================

export async function createBusiness(
  input: CreateBusinessInput
): Promise<{ success: boolean; businessId?: string; siteSlug?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const result = await businessService.createBusiness(user.id, user.email || '', input);
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      businessId: result.businessId,
      siteSlug: result.siteSlug,
    };
  } catch (error) {
    console.error("Error creating business:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to continue" };
    }
    return { success: false, error: "Failed to create business" };
  }
}

// ==================== UPDATE BUSINESS ====================

export async function updateBusiness(
  businessId: string,
  input: Partial<CreateBusinessInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await businessService.updateBusiness(businessId, user.id, input);
    
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/business/${businessId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating business:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update business" 
    };
  }
}

// ==================== DELETE BUSINESS ====================

export async function deleteBusiness(
  businessId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await businessService.deleteBusiness(businessId, user.id);
    
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting business:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete business" 
    };
  }
}

// ==================== GET USER BUSINESSES ====================

export async function getUserBusinesses(): Promise<BusinessWithSite[]> {
  try {
    const user = await requireAuth();
    return await businessService.getUserBusinesses(user.id);
  } catch {
    return [];
  }
}

// ==================== GET BUSINESS FOR EDIT ====================

export async function getBusinessForEdit(businessId: string): Promise<{
  success: boolean;
  business?: {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    heroImage: string | null;
    primaryColor: string;
    secondaryColor: string;
    businessType: string;
    services: string[];
    features: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    calendlyUrl: string | null;
    sourceUrl: string | null;
  };
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const business = await businessService.getBusinessWithSite(businessId, user.id);
    
    if (!business) {
      return { success: false, error: "Business not found" };
    }

    return {
      success: true,
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        logo: business.logo,
        heroImage: business.heroImage,
        primaryColor: business.primaryColor,
        secondaryColor: business.secondaryColor,
        businessType: business.businessType,
        services: business.services ? JSON.parse(business.services) : [],
        features: business.features ? JSON.parse(business.features) : [],
        phone: business.phone,
        email: business.email,
        address: business.address,
        city: business.city,
        calendlyUrl: business.calendlyUrl,
        sourceUrl: business.sourceUrl,
      },
    };
  } catch (error) {
    console.error("Error getting business for edit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get business",
    };
  }
}
