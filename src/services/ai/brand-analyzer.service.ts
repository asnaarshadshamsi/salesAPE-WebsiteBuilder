/**
 * Brand Analyzer Service
 * Analyzes scraped content to detect brand tone, personality, and characteristics
 */

const COHERE_API_KEY = process.env.COHERE_API_KEY || process.env.cohere_api_key || '';
const COHERE_API_URL = 'https://api.cohere.ai/v1';

export type BrandTone = 'luxury' | 'minimal' | 'playful' | 'corporate' | 'bold' | 'editorial';

export interface BrandAnalysis {
  tone: BrandTone;
  personality: string[];
  visualStyle: {
    preferredLayout: 'spacious' | 'compact' | 'balanced';
    imageUsage: 'hero-focused' | 'grid-heavy' | 'minimal';
    textDensity: 'concise' | 'detailed' | 'balanced';
  };
  targetAudience: string;
  emotionalAppeal: string[];
}

interface ScrapedContent {
  businessName: string;
  description?: string;
  businessType: string;
  aboutText?: string;
  services?: string[];
  products?: { name: string; description?: string; price?: number }[];
  hasLogo: boolean;
  imageCount: number;
}

/**
 * Analyze brand tone using AI
 */
async function analyzeWithAI(content: ScrapedContent): Promise<BrandTone> {
  if (!COHERE_API_KEY) {
    return detectToneHeuristically(content);
  }

  const prompt = `Analyze this business and classify its brand tone.

Business Name: ${content.businessName}
Business Type: ${content.businessType}
Description: ${content.description || 'N/A'}
Services: ${content.services?.join(', ') || 'N/A'}
Products: ${content.products?.map(p => p.name).join(', ') || 'N/A'}

Based on this information, classify the brand tone as ONE of these:
- luxury: Premium, exclusive, sophisticated, high-end
- minimal: Clean, simple, understated, modern
- playful: Fun, creative, energetic, colorful
- corporate: Professional, trustworthy, formal, structured
- bold: Daring, vibrant, statement-making, unconventional
- editorial: Content-rich, informative, magazine-style, story-driven

Respond with ONLY ONE WORD (the tone classification).`;

  try {
    const response = await fetch(`${COHERE_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Cohere-Version': '2022-12-06',
      },
      body: JSON.stringify({
        model: 'command',
        prompt,
        max_tokens: 10,
        temperature: 0.3,
        stop_sequences: ['\n', '.'],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const tone = data.generations?.[0]?.text?.trim().toLowerCase();
      
      if (['luxury', 'minimal', 'playful', 'corporate', 'bold', 'editorial'].includes(tone)) {
        return tone as BrandTone;
      }
    }
  } catch (error) {
    console.error('AI brand analysis failed:', error);
  }

  return detectToneHeuristically(content);
}

/**
 * Detect brand tone using heuristics (fallback when AI unavailable)
 */
function detectToneHeuristically(content: ScrapedContent): BrandTone {
  const { businessType, description, businessName, products } = content;
  const text = `${businessType} ${description || ''} ${businessName}`.toLowerCase();

  // Luxury indicators
  if (
    /luxury|premium|exclusive|bespoke|haute|artisan|curated|elegant|sophisticated/i.test(text) ||
    products?.some(p => (p.price || 0) > 1000)
  ) {
    return 'luxury';
  }

  // Playful indicators
  if (
    /fun|creative|playful|colorful|vibrant|quirky|whimsical|imaginative/i.test(text) ||
    businessType.match(/kids|children|toy|game|entertainment|creative/i)
  ) {
    return 'playful';
  }

  // Corporate indicators
  if (
    /enterprise|corporate|business|professional|consulting|finance|legal|insurance/i.test(text) ||
    businessType.match(/consulting|finance|legal|corp|enterprise|b2b/i)
  ) {
    return 'corporate';
  }

  // Editorial indicators
  if (
    /magazine|publication|media|journalism|blog|news|editorial|content/i.test(text) ||
    businessType.match(/media|publishing|blog|magazine|news/i)
  ) {
    return 'editorial';
  }

  // Bold indicators
  if (
    /bold|edgy|modern|innovative|disruptive|revolutionary|cutting-edge/i.test(text) ||
    businessType.match(/tech|startup|innovation|digital|agency/i)
  ) {
    return 'bold';
  }

  // Default to minimal for everything else
  return 'minimal';
}

/**
 * Determine visual style preferences based on tone and business type
 */
function determineVisualStyle(tone: BrandTone, businessType: string): BrandAnalysis['visualStyle'] {
  const type = businessType.toLowerCase();

  // Restaurant/food businesses
  if (type.includes('restaurant') || type.includes('food') || type.includes('cafe')) {
    return {
      preferredLayout: 'balanced',
      imageUsage: 'grid-heavy',
      textDensity: 'concise',
    };
  }

  // E-commerce
  if (type.includes('ecommerce') || type.includes('shop') || type.includes('store')) {
    return {
      preferredLayout: tone === 'luxury' ? 'spacious' : 'balanced',
      imageUsage: 'grid-heavy',
      textDensity: 'concise',
    };
  }

  // Services
  if (type.includes('service') || type.includes('agency') || type.includes('consulting')) {
    return {
      preferredLayout: tone === 'corporate' ? 'compact' : 'spacious',
      imageUsage: tone === 'minimal' ? 'minimal' : 'hero-focused',
      textDensity: tone === 'editorial' ? 'detailed' : 'balanced',
    };
  }

  // Tone-based defaults
  switch (tone) {
    case 'luxury':
      return {
        preferredLayout: 'spacious',
        imageUsage: 'hero-focused',
        textDensity: 'concise',
      };
    case 'minimal':
      return {
        preferredLayout: 'spacious',
        imageUsage: 'minimal',
        textDensity: 'concise',
      };
    case 'playful':
      return {
        preferredLayout: 'balanced',
        imageUsage: 'grid-heavy',
        textDensity: 'balanced',
      };
    case 'editorial':
      return {
        preferredLayout: 'compact',
        imageUsage: 'grid-heavy',
        textDensity: 'detailed',
      };
    case 'bold':
      return {
        preferredLayout: 'balanced',
        imageUsage: 'hero-focused',
        textDensity: 'balanced',
      };
    default:
      return {
        preferredLayout: 'balanced',
        imageUsage: 'hero-focused',
        textDensity: 'balanced',
      };
  }
}

/**
 * Main brand analyzer function
 */
export async function analyzeBrand(content: ScrapedContent): Promise<BrandAnalysis> {
  const tone = await analyzeWithAI(content);
  const visualStyle = determineVisualStyle(tone, content.businessType);

  // Determine personality traits
  const personalityMap: Record<BrandTone, string[]> = {
    luxury: ['Sophisticated', 'Exclusive', 'Refined', 'Premium'],
    minimal: ['Clean', 'Modern', 'Simple', 'Elegant'],
    playful: ['Fun', 'Creative', 'Energetic', 'Friendly'],
    corporate: ['Professional', 'Trustworthy', 'Reliable', 'Established'],
    bold: ['Innovative', 'Daring', 'Modern', 'Dynamic'],
    editorial: ['Informative', 'Thoughtful', 'Engaging', 'Comprehensive'],
  };

  // Determine target audience
  const audienceMap: Record<BrandTone, string> = {
    luxury: 'Discerning customers seeking premium experiences',
    minimal: 'Modern professionals who value simplicity',
    playful: 'Creative individuals looking for unique experiences',
    corporate: 'Business professionals and enterprises',
    bold: 'Trendsetters and early adopters',
    editorial: 'Knowledge seekers and information consumers',
  };

  // Determine emotional appeal
  const emotionalMap: Record<BrandTone, string[]> = {
    luxury: ['Aspiration', 'Exclusivity', 'Status'],
    minimal: ['Clarity', 'Focus', 'Peace'],
    playful: ['Joy', 'Excitement', 'Wonder'],
    corporate: ['Trust', 'Confidence', 'Security'],
    bold: ['Innovation', 'Progress', 'Empowerment'],
    editorial: ['Knowledge', 'Understanding', 'Insight'],
  };

  return {
    tone,
    personality: personalityMap[tone],
    visualStyle,
    targetAudience: audienceMap[tone],
    emotionalAppeal: emotionalMap[tone],
  };
}

export const brandAnalyzerService = {
  analyzeBrand,
};
