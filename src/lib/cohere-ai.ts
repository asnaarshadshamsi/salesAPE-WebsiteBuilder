/**
 * Cohere AI Integration for Content Generation
 * Generates compelling headlines, descriptions, and website copy
 */

const COHERE_API_KEY = process.env.COHERE_API_KEY || process.env.cohere_api_key || '';
const COHERE_API_URL = 'https://api.cohere.ai/v1';

// ==================== TYPES ====================

export interface BusinessContext {
  name: string;
  description?: string;
  businessType: string;
  services?: string[];
  products?: { name: string; description?: string; price?: number }[];
  features?: string[];
  city?: string;
  industry?: string;
  targetAudience?: string;
  uniqueSellingPoints?: string[];
}

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  aboutText: string;
  ctaText: string;
  metaDescription: string;
  tagline: string;
  valuePropositions: string[];
  serviceDescriptions: { name: string; description: string }[];
  testimonialPrompts: string[];
  emailSubjectLines: string[];
  socialMediaBio: string;
}

export interface CohereResponse {
  id: string;
  generations?: { id: string; text: string }[];
  text?: string;
  meta?: { api_version: { version: string } };
}

// ==================== COHERE API CALLS ====================

/**
 * Call Cohere's Generate API
 */
export async function cohereGenerate(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    stopSequences?: string[];
  } = {}
): Promise<string | null> {
  if (!COHERE_API_KEY) {
    console.warn('Cohere API key not configured');
    return null;
  }

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
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        stop_sequences: options.stopSequences || ['--END--'],
        return_likelihoods: 'NONE',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cohere API error:', error);
      return null;
    }

    const data: CohereResponse = await response.json();
    return data.generations?.[0]?.text?.trim() || data.text?.trim() || null;
  } catch (error) {
    console.error('Cohere request failed:', error);
    return null;
  }
}

/**
 * Call Cohere's Chat API (for more conversational generation)
 */
async function cohereChat(
  message: string,
  preamble?: string
): Promise<string | null> {
  if (!COHERE_API_KEY) {
    console.warn('Cohere API key not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.cohere.ai/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r',
        messages: [
          {
            role: 'system',
            content: preamble || 'You are an expert marketing copywriter who creates compelling, conversion-focused content for businesses.',
          },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cohere Chat API error:', error);
      return null;
    }

    const data = await response.json();
    // v2 response: data.message.content[0].text
    return data.message?.content?.[0]?.text?.trim() || data.text?.trim() || null;
  } catch (error) {
    console.error('Cohere chat request failed:', error);
    return null;
  }
}

// ==================== CONTENT GENERATION ====================

/**
 * Generate all website content for a business
 */
export async function generateBusinessContent(
  context: BusinessContext
): Promise<GeneratedContent> {
  // Try AI generation first, fall back to templates
  const [
    headlineResult,
    aboutResult,
    valuePropsResult,
    metaResult,
  ] = await Promise.all([
    generateHeadlineAndSubheadline(context),
    generateAboutText(context),
    generateValuePropositions(context),
    generateMetaDescription(context),
  ]);

  // Generate service descriptions if services exist
  let serviceDescriptions: { name: string; description: string }[] = [];
  if (context.services && context.services.length > 0) {
    serviceDescriptions = await generateServiceDescriptions(context);
  }

  return {
    headline: headlineResult?.headline || getFallbackHeadline(context),
    subheadline: headlineResult?.subheadline || getFallbackSubheadline(context),
    aboutText: aboutResult || getFallbackAboutText(context),
    ctaText: getCTAText(context.businessType),
    metaDescription: metaResult || getFallbackMetaDescription(context),
    tagline: headlineResult?.tagline || getFallbackTagline(context),
    valuePropositions: valuePropsResult || getFallbackValueProps(context),
    serviceDescriptions,
    testimonialPrompts: getTestimonialPrompts(context),
    emailSubjectLines: await generateEmailSubjectLines(context),
    socialMediaBio: await generateSocialMediaBio(context) || getFallbackSocialBio(context),
  };
}

/**
 * Generate headline and subheadline
 */
async function generateHeadlineAndSubheadline(
  context: BusinessContext
): Promise<{ headline: string; subheadline: string; tagline: string } | null> {
  const prompt = `You are an expert marketing copywriter and business analyst. Analyze this business and generate compelling copy.

Business Analysis:
- Name: ${context.name}
- Type: ${context.businessType}
${context.description ? `- Description: ${context.description}` : ''}
${context.services?.length ? `- Services Offered: ${context.services.join(', ')}` : ''}
${context.products?.length ? `- Products: ${context.products.slice(0, 5).map(p => p.name).join(', ')}` : ''}
${context.city ? `- Location: ${context.city}` : ''}
${context.industry ? `- Industry: ${context.industry}` : ''}

CRITICAL INSTRUCTIONS:
1. ANALYZE the business type and ensure your copy matches it:
   - For perfume/beauty stores: Focus on luxury, elegance, fragrances, scents
   - For e-commerce: Focus on shopping, products, collections
   - For restaurants: Focus on food, dining, culinary experience
   - For fitness: Focus on transformation, training, health goals
   - For agencies: Focus on expertise, creativity, results
   - For services: Focus on solutions, professional service, trust

2. USE the actual services/products mentioned - don't make up generic content

3. Create copy that reflects the TRUE nature of this business

Requirements:
- Headline: 5-10 words, powerful and specific to this business type
- Subheadline: 10-20 words, explains the actual value proposition
- Tagline: 3-6 words, memorable and relevant to the business

Format your response exactly like this:
HEADLINE: [your headline]
SUBHEADLINE: [your subheadline]
TAGLINE: [your tagline]
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 200, temperature: 0.8 });
  
  if (!result) return null;

  const headlineMatch = result.match(/HEADLINE:\s*(.+?)(?:\n|$)/i);
  const subheadlineMatch = result.match(/SUBHEADLINE:\s*(.+?)(?:\n|$)/i);
  const taglineMatch = result.match(/TAGLINE:\s*(.+?)(?:\n|$)/i);

  if (!headlineMatch) return null;

  return {
    headline: headlineMatch[1].trim(),
    subheadline: subheadlineMatch?.[1]?.trim() || '',
    tagline: taglineMatch?.[1]?.trim() || '',
  };
}

/**
 * Generate about text
 */
async function generateAboutText(context: BusinessContext): Promise<string | null> {
  const prompt = `You are a professional copywriter. Write an "About Us" section for this business.

Business Analysis:
- Name: ${context.name}
- Type: ${context.businessType}
${context.description ? `- Current Description: ${context.description}` : ''}
${context.services?.length ? `- Services/Offerings: ${context.services.join(', ')}` : ''}
${context.products?.length ? `- Products: ${context.products.slice(0, 5).map(p => p.name).join(', ')}` : ''}
${context.city ? `- Location: ${context.city}` : ''}
${context.uniqueSellingPoints?.length ? `- Unique Strengths: ${context.uniqueSellingPoints.join(', ')}` : ''}

SMART ANALYSIS REQUIRED:
1. Identify what makes this specific business unique
2. Write about ACTUAL services/products mentioned, not generic statements
3. For perfume stores: Mention fragrances, scents, olfactory experiences
4. For gyms: Mention fitness goals, training, health transformation
5. For restaurants: Mention cuisine, dining, culinary craftsmanship
6. For e-commerce: Mention product quality, shopping experience, collections
7. For beauty salons: Mention treatments, styling, pampering
8. Use the business name naturally throughout the text

Requirements:
- 2-3 paragraphs (100-150 words total)
- Professional but warm and authentic tone
- Focus on customer benefits and real value
- Include what makes this business special
- NO generic phrases like "we are passionate about excellence"
- Make it sound real and believable

Write the about text directly (no labels):
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 300, temperature: 0.7 });
  return result?.replace(/--END--/g, '').trim() || null;
}

/**
 * Generate value propositions
 */
async function generateValuePropositions(context: BusinessContext): Promise<string[] | null> {
  const prompt = `Generate 4 compelling value propositions for this specific business.

Business Analysis:
- Name: ${context.name}
- Type: ${context.businessType}
${context.description ? `- Description: ${context.description}` : ''}
${context.services?.length ? `- Actual Services: ${context.services.join(', ')}` : ''}
${context.products?.length ? `- Products: ${context.products.slice(0, 5).map(p => p.name).join(', ')}` : ''}
${context.uniqueSellingPoints?.length ? `- Strengths: ${context.uniqueSellingPoints.join(', ')}` : ''}

SMART ANALYSIS REQUIRED:
1. Analyze what VALUE this business provides to customers
2. Base propositions on ACTUAL offerings, not generic claims
3. For perfume stores: Focus on fragrance selection, scent experience, premium brands
4. For gyms: Focus on fitness transformation, expert training, community
5. For restaurants: Focus on cuisine quality, dining experience, chef expertise
6. For beauty salons: Focus on beauty transformations, expert stylists, treatments
7. For e-commerce: Focus on product quality, shopping convenience, variety
8. Make each proposition SPECIFIC to this business

Requirements:
- Each value prop should be 5-10 words
- Focus on SPECIFIC customer benefits, not generic features
- Be believable and authentic
- Start with action verbs or benefit statements
- NO generic phrases like "Excellence in Everything We Do"

Format: One value proposition per line, numbered 1-4.
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 200, temperature: 0.7 });
  
  if (!result) return null;

  const lines = result
    .split('\n')
    .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(line => line.length > 5 && line.length < 100);

  return lines.length >= 3 ? lines.slice(0, 4) : null;
}

/**
 * Generate meta description for SEO
 */
async function generateMetaDescription(context: BusinessContext): Promise<string | null> {
  const prompt = `Write an SEO-optimized meta description for a ${context.businessType} business website.

Business Name: ${context.name}
${context.description ? `Description: ${context.description}` : ''}
${context.services?.length ? `Services: ${context.services.slice(0, 3).join(', ')}` : ''}
${context.city ? `Location: ${context.city}` : ''}

Requirements:
- Exactly 150-160 characters
- Include the business name
- Include a call-to-action
- Be compelling and click-worthy
${context.city ? `- Mention the location for local SEO` : ''}

Write the meta description directly, no labels:
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 100, temperature: 0.6 });
  const text = result?.replace(/--END--/g, '').trim();
  
  // Ensure it's within meta description limits
  if (text && text.length > 160) {
    return text.substring(0, 157) + '...';
  }
  return text || null;
}

/**
 * Generate service descriptions
 */
async function generateServiceDescriptions(
  context: BusinessContext
): Promise<{ name: string; description: string }[]> {
  if (!context.services || context.services.length === 0) {
    return [];
  }

  const serviceList = context.services.slice(0, 6);
  
  const prompt = `Write brief, compelling descriptions for these ACTUAL services from a ${context.businessType} business.

Business Analysis:
- Name: ${context.name}
- Type: ${context.businessType}
${context.description ? `- Business Description: ${context.description}` : ''}
${context.products?.length ? `- Products Sold: ${context.products.slice(0, 5).map(p => p.name).join(', ')}` : ''}

Services to Describe: ${serviceList.join(', ')}

SMART ANALYSIS REQUIRED:
1. Understand what each service ACTUALLY means for this business type
2. For perfume stores: Describe fragrance collections by their character (floral, woody, oriental, etc.)
3. For gyms: Describe workout types and fitness outcomes
4. For restaurants: Describe cuisine, flavors, dining experiences
5. For beauty salons: Describe treatments, techniques, transformations
6. For e-commerce: Describe product categories and what customers get
7. Write descriptions that reflect the REAL service, not generic marketing copy

For each service, write a 15-25 word description focusing on specific benefits.

Format each like this:
SERVICE: [service name]
DESCRIPTION: [description]

--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 400, temperature: 0.7 });
  
  if (!result) {
    // Return services with generic descriptions
    return serviceList.map(name => ({
      name,
      description: `Professional ${name.toLowerCase()} services tailored to meet your specific needs.`,
    }));
  }

  const descriptions: { name: string; description: string }[] = [];
  const matches = result.matchAll(/SERVICE:\s*(.+?)\nDESCRIPTION:\s*(.+?)(?=\nSERVICE:|--END--|$)/gi);
  
  for (const match of matches) {
    descriptions.push({
      name: match[1].trim(),
      description: match[2].trim(),
    });
  }

  // Fill in any missing services
  for (const service of serviceList) {
    if (!descriptions.find(d => d.name.toLowerCase() === service.toLowerCase())) {
      descriptions.push({
        name: service,
        description: `Expert ${service.toLowerCase()} solutions designed for your success.`,
      });
    }
  }

  return descriptions;
}

/**
 * Generate email subject lines for marketing
 */
async function generateEmailSubjectLines(context: BusinessContext): Promise<string[]> {
  const prompt = `Generate 5 compelling email subject lines for a ${context.businessType} business to use in their marketing.

Business: ${context.name}
${context.services?.length ? `Services: ${context.services.slice(0, 3).join(', ')}` : ''}

Requirements:
- Each subject line should be under 50 characters
- Mix of urgency, curiosity, and value-based subjects
- Avoid spam trigger words

Format: One subject line per line, numbered 1-5.
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 200, temperature: 0.8 });
  
  if (!result) {
    return [
      `Discover what ${context.name} can do for you`,
      `Your success starts here`,
      `Limited time offer inside`,
      `We have something special for you`,
      `Quick question for you`,
    ];
  }

  const lines = result
    .split('\n')
    .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(line => line.length > 5 && line.length < 60);

  return lines.length >= 3 ? lines.slice(0, 5) : [
    `Discover what ${context.name} can do for you`,
    `Your success starts here`,
    `Limited time offer inside`,
  ];
}

/**
 * Generate social media bio
 */
async function generateSocialMediaBio(context: BusinessContext): Promise<string | null> {
  const prompt = `Write a compelling social media bio for a ${context.businessType} business.

Business: ${context.name}
${context.description ? `Description: ${context.description}` : ''}
${context.services?.length ? `Services: ${context.services.slice(0, 3).join(', ')}` : ''}
${context.city ? `Location: ${context.city}` : ''}

Requirements:
- Maximum 150 characters
- Include relevant emojis
- Include a call-to-action
- Be memorable and on-brand

Write the bio directly:
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 80, temperature: 0.8 });
  const text = result?.replace(/--END--/g, '').trim();
  
  if (text && text.length > 150) {
    return text.substring(0, 147) + '...';
  }
  return text || null;
}

// ==================== SPECIALIZED GENERATORS ====================

/**
 * Generate product descriptions
 */
export async function generateProductDescription(
  product: { name: string; description?: string; price?: number; category?: string },
  businessContext: BusinessContext
): Promise<string> {
  const prompt = `Write a compelling product description for an e-commerce listing.

Business: ${businessContext.name}
Product Name: ${product.name}
${product.description ? `Current Description: ${product.description}` : ''}
${product.category ? `Category: ${product.category}` : ''}
${product.price ? `Price: $${product.price}` : ''}

Requirements:
- 30-50 words
- Highlight key benefits
- Create desire and urgency
- Be specific and vivid

Write the description directly:
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 100, temperature: 0.7 });
  return result?.replace(/--END--/g, '').trim() || 
    product.description || 
    `Discover the quality and craftsmanship of our ${product.name}. Perfect for those who appreciate excellence.`;
}

/**
 * Generate testimonial request/prompt for business owners
 */
function getTestimonialPrompts(context: BusinessContext): string[] {
  const prompts = [
    `What problem did ${context.name} solve for you?`,
    `How would you describe your experience with ${context.name}?`,
    `What made you choose ${context.name} over other options?`,
    `What results have you seen since working with ${context.name}?`,
    `Would you recommend ${context.name}? Why?`,
  ];
  return prompts;
}

/**
 * Generate lead follow-up email
 */
export async function generateLeadFollowUpEmail(
  leadName: string,
  businessContext: BusinessContext,
  inquiry?: string
): Promise<{ subject: string; body: string }> {
  const prompt = `Write a personalized follow-up email for a business lead.

Business: ${businessContext.name}
Business Type: ${businessContext.businessType}
Lead Name: ${leadName}
${inquiry ? `Their Inquiry: ${inquiry}` : ''}
${businessContext.services?.length ? `Our Services: ${businessContext.services.slice(0, 3).join(', ')}` : ''}

Requirements:
- Professional but warm tone
- Reference their specific interest if known
- Include a clear call-to-action
- Keep it concise (under 150 words)

Format:
SUBJECT: [subject line]
BODY:
[email body]
--END--`;

  const result = await cohereGenerate(prompt, { maxTokens: 300, temperature: 0.7 });
  
  if (!result) {
    return {
      subject: `Following up on your inquiry - ${businessContext.name}`,
      body: `Hi ${leadName},\n\nThank you for your interest in ${businessContext.name}. I wanted to personally follow up and see how we can help you.\n\nWould you have a few minutes for a quick call this week?\n\nBest regards,\nThe ${businessContext.name} Team`,
    };
  }

  const subjectMatch = result.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = result.match(/BODY:\s*([\s\S]+?)(?:--END--|$)/i);

  return {
    subject: subjectMatch?.[1]?.trim() || `Following up - ${businessContext.name}`,
    body: bodyMatch?.[1]?.trim() || `Hi ${leadName},\n\nThank you for reaching out. We'd love to help you.\n\nBest,\n${businessContext.name}`,
  };
}

// ==================== FALLBACK CONTENT ====================

function getFallbackHeadline(context: BusinessContext): string {
  const headlines: Record<string, string> = {
    restaurant: `Welcome to ${context.name}`,
    ecommerce: `Shop the Best at ${context.name}`,
    healthcare: `Your Health, Our Priority`,
    fitness: `Transform Your Life Today`,
    beauty: `Discover Your Best Self`,
    realestate: `Find Your Dream Home`,
    education: `Learn, Grow, Succeed`,
    agency: `We Bring Ideas to Life`,
    portfolio: `Creative Excellence`,
    service: `Professional Solutions You Can Trust`,
  };
  return headlines[context.businessType] || `Welcome to ${context.name}`;
}

function getFallbackSubheadline(context: BusinessContext): string {
  const subheadlines: Record<string, string> = {
    restaurant: 'Experience exceptional dining with fresh ingredients and unforgettable flavors',
    ecommerce: 'Premium products delivered to your doorstep with exceptional service',
    healthcare: 'Compassionate care and cutting-edge treatment for you and your family',
    fitness: 'Expert trainers, state-of-the-art facilities, and results that last',
    beauty: 'Premium treatments and personalized care for your unique beauty',
    realestate: 'Expert guidance to help you find the perfect property',
    education: 'Quality education that prepares you for a successful future',
    agency: 'Strategic solutions that drive growth and deliver results',
    portfolio: 'Bringing creative visions to life with passion and precision',
    service: 'Dedicated to delivering excellence in everything we do',
  };
  return subheadlines[context.businessType] || `Dedicated to serving ${context.city || 'our community'} with excellence`;
}

function getFallbackAboutText(context: BusinessContext): string {
  const name = context.name;
  const city = context.city ? ` in ${context.city}` : '';
  const services = context.services?.slice(0, 3).join(', ');

  const foodTypes = ['restaurant', 'cafe', 'bakery', 'catering', 'food', 'bistro', 'diner', 'eatery', 'grill', 'pizzeria'];
  const isFoodBusiness = foodTypes.some(t => (context.businessType || '').toLowerCase().includes(t));

  if (isFoodBusiness) {
    return `${name} was born from a love of great food and warm hospitality${city}. From the very first day we opened our doors, our mission has been simple: to create meals that bring people together and moments worth savouring.\n\nEvery ingredient we use is chosen with care, and every dish is prepared with the attention to detail that our guests deserve. Whether you're joining us for a quiet dinner, a family celebration, or a quick bite on the go, we pour the same passion into every plate.\n\nWe believe food is more than sustenance — it's connection, comfort, and joy. We invite you to experience ${name} and taste the difference that genuine care makes.`;
  }

  const typeAbout: Record<string, string> = {
    fitness: `${name} was founded on a simple belief: that everyone deserves access to expert-led fitness${city}. We combine state-of-the-art facilities, qualified trainers, and a supportive community to help you reach your goals — whatever they may be.\n\nFrom beginner-friendly group classes to advanced personal training programs, we tailor our approach to suit your pace and ambitions. Our coaches are here to guide, motivate, and celebrate every milestone with you.\n\nJoin the ${name} family and discover what you're truly capable of. Your transformation starts here.`,
    beauty: `${name} is a sanctuary for self-care${city}. Founded by passionate beauty professionals, we've built a space where our clients come to relax, be pampered, and leave feeling their very best.\n\nWe offer a full range of premium treatments — from signature facials and therapeutic massages to precision hair colour and nail artistry. Every treatment is personalised to your unique needs.\n\nAt ${name}, we believe that feeling beautiful starts with being cared for. We'd love to welcome you.`,
    ecommerce: `${name} was created for people who value quality and style${city}. We curate every product with intention, offering a thoughtfully selected range that combines craftsmanship, lasting value, and contemporary design.\n\nWe work with trusted makers and artisans to ensure every item you receive is exactly as described — beautiful, well-made, and worth every penny.\n\nShopping at ${name} means choosing quality you can feel. Browse our collection and discover your next favourite piece.`,
  };

  if (typeAbout[context.businessType]) return typeAbout[context.businessType];

  // Generic fallback — still much better than the old placeholder
  return `${name} has been serving ${context.description ? `${context.description.slice(0, 80).toLowerCase()}` : 'our community'}${city} with a commitment to quality that never wavers.\n\n${services ? `We specialise in ${services}, delivering results that make a real difference for every client we work with.` : 'Our team delivers results that make a real difference for every client we work with.'}\n\nWe'd love to hear from you. Get in touch today and let's talk about how ${name} can help you.`;
}

function getFallbackMetaDescription(context: BusinessContext): string {
  const services = context.services?.slice(0, 2).join(' & ') || 'quality services';
  return `${context.name}${context.city ? ` in ${context.city}` : ''} - ${services}. Contact us today for exceptional service and results.`;
}

function getFallbackTagline(context: BusinessContext): string {
  const taglines: Record<string, string> = {
    restaurant: 'Where Every Meal is Special',
    ecommerce: 'Quality You Can Trust',
    healthcare: 'Care That Makes a Difference',
    fitness: 'Your Journey Starts Here',
    beauty: 'Beauty Redefined',
    realestate: 'Home is Where We Help',
    education: 'Empowering Minds',
    agency: 'Ideas That Inspire',
    portfolio: 'Creating with Purpose',
    service: 'Excellence Delivered',
  };
  return taglines[context.businessType] || 'Excellence in Every Detail';
}

function getFallbackValueProps(context: BusinessContext): string[] {
  const valueProps: Record<string, string[]> = {
    restaurant: ['Fresh ingredients daily', 'Exceptional service', 'Unforgettable atmosphere', 'Crafted with passion'],
    ecommerce: ['Fast, free shipping', 'Quality guaranteed', 'Easy returns', '24/7 support'],
    healthcare: ['Patient-centered care', 'Advanced treatments', 'Experienced team', 'Comfortable environment'],
    fitness: ['Expert trainers', 'Modern equipment', 'Flexible schedules', 'Proven results'],
    beauty: ['Premium products', 'Skilled professionals', 'Relaxing atmosphere', 'Personalized service'],
    realestate: ['Local expertise', 'Transparent process', 'Dedicated support', 'Best market value'],
    education: ['Expert instructors', 'Hands-on learning', 'Flexible options', 'Career support'],
    agency: ['Creative solutions', 'Data-driven results', 'Transparent pricing', 'Dedicated team'],
    service: ['Professional team', 'Quality guaranteed', 'Competitive pricing', 'Customer-first approach'],
  };
  return valueProps[context.businessType] || valueProps.service;
}

function getFallbackSocialBio(context: BusinessContext): string {
  return `✨ ${context.name}${context.city ? ` | ${context.city}` : ''} | ${context.services?.[0] || 'Quality Service'} | DM for inquiries 📩`;
}

function getCTAText(businessType: string): string {
  const ctas: Record<string, string> = {
    restaurant: 'Reserve a Table',
    ecommerce: 'Shop Now',
    healthcare: 'Book Appointment',
    fitness: 'Start Free Trial',
    beauty: 'Book Now',
    realestate: 'View Listings',
    education: 'Enroll Today',
    agency: 'Get a Quote',
    portfolio: 'View Portfolio',
    service: 'Get Started',
  };
  return ctas[businessType] || 'Contact Us';
}

// ==================== UTILITY ====================

/**
 * Check if Cohere API is configured
 */
export function isCohereConfigured(): boolean {
  return Boolean(COHERE_API_KEY);
}

/**
 * Test the Cohere connection
 */
export async function testCohereConnection(): Promise<boolean> {
  const result = await cohereGenerate('Say "Hello" in one word.', { maxTokens: 10 });
  return result !== null;
}

// ==================== VOICE INPUT PARSING ====================

export interface ExtractedBusinessInfo {
  businessName: string;
  description: string;
  businessType: string;
  services: string[];
  features: string[];
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  targetAudience: string | null;
  uniqueSellingPoints: string[];
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Parse voice input and extract structured business information using AI
 */
export async function parseVoiceInputToBusinessInfo(
  voiceTranscript: string
): Promise<ExtractedBusinessInfo> {
  const prompt = `You are an AI assistant that extracts structured business information from natural language descriptions.

The user described their business:
"${voiceTranscript}"

Extract and structure the following information. If something is not mentioned, make intelligent assumptions based on the business type and context.

Respond in EXACTLY this format:
BUSINESS_NAME: [extracted or suggested business name - look for phrases like "business name is" or "called". STOP at words like "the", "theme", "color", "and". Extract ONLY the actual business name, not surrounding context]
BUSINESS_TYPE: [one of: ecommerce, restaurant, service, healthcare, fitness, beauty, realestate, agency, portfolio, education, startup, other]
DESCRIPTION: [brief 1-2 sentence description]
SERVICES: [comma-separated list of 3-6 services/products]
FEATURES: [comma-separated list of 3-5 key features or benefits]
TARGET_AUDIENCE: [who is their ideal customer]
UNIQUE_SELLING_POINTS: [comma-separated list of 2-4 unique value propositions]
PHONE: [phone number if mentioned, or "null"]
EMAIL: [email if mentioned, or "null"]
ADDRESS: [physical address if mentioned, or "null"]
CITY: [city/location if mentioned, or "null"]
PRIMARY_COLOR: [hex color code - PRIORITIZE user-mentioned colors over defaults. Convert color names: white=#ffffff, black=#000000, red=#ef4444, blue=#3b82f6, green=#22c55e, light green=#90ee90, yellow=#eab308, orange=#f97316, purple=#a855f7, pink=#ec4899, gray=#6b7280]
SECONDARY_COLOR: [hex color code - PRIORITIZE user-mentioned colors over defaults. Same color conversion rules]

CRITICAL RULES:
- If user mentions colors explicitly (e.g., "primary color white", "theme should be blue"), YOU MUST use those colors, not business-type defaults
- Business name: look for "name is", "called", "business is", or capitalized proper nouns
- Business type detection: "workshop" or "detailing" = service, "car" or "auto" = service
- If user specifies ANY colors, return those colors converted to hex, NOT the business type defaults
- For colors, ONLY use business-type defaults if NO colors are mentioned at all

--END--`;

  let result: string | null = null;
  
  // Try Cohere first
  if (COHERE_API_KEY) {
    result = await cohereGenerate(prompt, { maxTokens: 500, temperature: 0.6 });
  }
  
  // Fallback to structured parsing if Cohere fails or is not configured
  if (!result) {
    return parseVoiceInputFallback(voiceTranscript);
  }

  // Parse the structured response
  const extracted: Partial<ExtractedBusinessInfo> = {};
  
  const extractField = (fieldName: string): string | null => {
    const regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\n[A-Z_]+:|--END--|$)`, 'i');
    const match = result!.match(regex);
    const value = match?.[1]?.trim();
    return value && value !== 'null' && value.length > 0 ? value : null;
  };

  extracted.businessName = extractField('BUSINESS_NAME') || 'My Business';
  extracted.businessType = (extractField('BUSINESS_TYPE') || 'service').toLowerCase();
  extracted.description = extractField('DESCRIPTION') || 'A great business serving our community';
  extracted.services = extractField('SERVICES')?.split(',').map(s => s.trim()).filter(Boolean) || ['General Services'];
  extracted.features = extractField('FEATURES')?.split(',').map(s => s.trim()).filter(Boolean) || ['Quality Service', 'Expert Team'];
  extracted.targetAudience = extractField('TARGET_AUDIENCE');
  extracted.uniqueSellingPoints = extractField('UNIQUE_SELLING_POINTS')?.split(',').map(s => s.trim()).filter(Boolean) || [];
  extracted.phone = extractField('PHONE');
  extracted.email = extractField('EMAIL');
  extracted.address = extractField('ADDRESS');
  extracted.city = extractField('CITY');
  extracted.primaryColor = extractField('PRIMARY_COLOR') || '#6366f1';
  extracted.secondaryColor = extractField('SECONDARY_COLOR') || '#818cf8';

  // Validate hex colors
  if (!/^#[0-9A-F]{6}$/i.test(extracted.primaryColor)) {
    extracted.primaryColor = '#6366f1';
  }
  if (!/^#[0-9A-F]{6}$/i.test(extracted.secondaryColor)) {
    extracted.secondaryColor = '#818cf8';
  }

  return extracted as ExtractedBusinessInfo;
}

/**
 * Fallback parser when AI is not available
 */
function parseVoiceInputFallback(transcript: string): ExtractedBusinessInfo {
  const lowerText = transcript.toLowerCase();
  
  // Try to extract business name (look for "I'm" or "called" or "named" or "name is")
  let businessName = 'My Business';
  const namePatterns = [
    /(?:business\s+name\s+is|called|named)\s+([A-Za-z][A-Za-z\s]{1,25}?)(?=\s+(?:the|and|with|in|at|on|theme|color|colour|primary|secondary|business|type|offers|provides|specializes?|located|based|website|www|http)|\.|,|$)/i,
    /(?:i'm|i am)\s+([A-Z][A-Za-z\s]{1,25}?)(?=\s+(?:the|and|with|in|at|on|theme|color|colour|primary|secondary|business|type|offers|provides|specializes?|located|based)|\.|,|$)/i,
    /(?:name\s+is|it's\s+called)\s+([A-Za-z][A-Za-z\s]{1,25}?)(?=\s+(?:the|and|with|in|at|on|theme|color|colour|primary|secondary|business|type|offers|provides)|\.|,|$)/i,
  ];
  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      businessName = match[1].trim();
      // Capitalize first letter of each word
      businessName = businessName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      break;
    }
  }

  // Detect business type based on keywords
  let businessType = 'service';
  const typeKeywords: Record<string, string[]> = {
    restaurant: ['restaurant', 'cafe', 'food', 'dining', 'eat', 'menu', 'chef', 'cook'],
    ecommerce: ['shop', 'store', 'sell', 'products', 'retail', 'ecommerce', 'online store'],
    healthcare: ['health', 'medical', 'doctor', 'clinic', 'patient', 'treatment', 'therapy'],
    fitness: ['gym', 'fitness', 'workout', 'training', 'exercise', 'yoga', 'pilates'],
    beauty: ['beauty', 'salon', 'spa', 'hair', 'nails', 'makeup', 'skincare'],
    realestate: ['real estate', 'property', 'home', 'house', 'realtor', 'broker'],
    education: ['education', 'school', 'teach', 'learn', 'course', 'training', 'tutor'],
    agency: ['agency', 'marketing', 'design', 'creative', 'branding', 'advertising'],
    portfolio: ['portfolio', 'freelance', 'photographer', 'artist', 'designer'],
    service: ['workshop', 'detailing', 'car', 'auto', 'automobile', 'repair', 'maintenance', 'service'],
  };

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      businessType = type;
      break;
    }
  }

  // Extract services (look for "offer", "provide", "specialize in")
  const services: string[] = [];
  const servicePatterns = [
    /(?:offer|provide|specialize in|services include)\s+([^.!?]+)/gi,
  ];
  for (const pattern of servicePatterns) {
    const matches = transcript.matchAll(pattern);
    for (const match of matches) {
      const extracted = match[1].split(/,| and /).map(s => s.trim()).filter(s => s.length > 2 && s.length < 50);
      services.push(...extracted);
    }
  }

  // Default services based on business type
  const defaultServices: Record<string, string[]> = {
    restaurant: ['Dine-In', 'Takeout', 'Catering', 'Delivery'],
    ecommerce: ['Online Shopping', 'Fast Shipping', 'Easy Returns', 'Customer Support'],
    healthcare: ['Consultations', 'Treatment Plans', 'Preventive Care', 'Emergency Services'],
    fitness: ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Membership Plans'],
    beauty: ['Hair Styling', 'Manicure & Pedicure', 'Facials', 'Makeup'],
    realestate: ['Property Listings', 'Buyer Representation', 'Seller Services', 'Market Analysis'],
    education: ['Courses', 'Workshops', 'One-on-One Tutoring', 'Certification Programs'],
    agency: ['Brand Strategy', 'Creative Design', 'Digital Marketing', 'Content Creation'],
    service: ['Professional Service', 'Expert Consultation', 'Quality Workmanship', 'Customer Support'],
  };

  // Extract contact info
  const phoneMatch = transcript.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  const emailMatch = transcript.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  
  // Extract location
  let city: string | null = null;
  const locationPatterns = [
    /(?:in|at|located in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
  ];
  for (const pattern of locationPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      city = match[1].trim();
      break;
    }
  }

  // Extract colors from text (user-specified colors take priority)
  const colorNameToHex: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'light green': '#90ee90',
    'dark green': '#166534',
    'yellow': '#eab308',
    'orange': '#f97316',
    'purple': '#a855f7',
    'pink': '#ec4899',
    'gray': '#6b7280',
    'grey': '#6b7280',
    'brown': '#92400e',
    'light blue': '#38bdf8',
    'dark blue': '#1e3a8a',
    'navy': '#1e3a8a',
  };

  let extractedPrimaryColor: string | null = null;
  let extractedSecondaryColor: string | null = null;

  // Look for color mentions
  const primaryColorMatch = transcript.match(/(?:primary\s+(?:color|colour))\s+(?:is\s+|should\s+be\s+)?([a-z\s]+?)(?:\s+and|\s+secondary|$|\.)/i);
  const secondaryColorMatch = transcript.match(/(?:secondary\s+(?:color|colour))\s+(?:is\s+|should\s+be\s+)?([a-z\s]+?)(?:\s+and|$|\.)/i);

  if (primaryColorMatch) {
    const colorName = primaryColorMatch[1].trim().toLowerCase();
    extractedPrimaryColor = colorNameToHex[colorName] || null;
  }

  if (secondaryColorMatch) {
    const colorName = secondaryColorMatch[1].trim().toLowerCase();
    extractedSecondaryColor = colorNameToHex[colorName] || null;
  }

  // Color palettes based on business type (only used if no colors extracted from text)
  const colorPalettes: Record<string, { primary: string; secondary: string }> = {
    restaurant: { primary: '#f97316', secondary: '#fb923c' },
    ecommerce: { primary: '#6366f1', secondary: '#818cf8' },
    healthcare: { primary: '#0ea5e9', secondary: '#38bdf8' },
    fitness: { primary: '#10b981', secondary: '#22c55e' },
    beauty: { primary: '#ec4899', secondary: '#f472b6' },
    realestate: { primary: '#3b82f6', secondary: '#60a5fa' },
    education: { primary: '#8b5cf6', secondary: '#a78bfa' },
    agency: { primary: '#8b5cf6', secondary: '#a78bfa' },
    service: { primary: '#3b82f6', secondary: '#60a5fa' },
  };

  const colors = colorPalettes[businessType] || colorPalettes.service;

  return {
    businessName,
    description: transcript.substring(0, 200),
    businessType,
    services: services.length > 0 ? services.slice(0, 6) : (defaultServices[businessType] || defaultServices.service),
    features: ['Quality Service', 'Expert Team', 'Customer Satisfaction', 'Professional Results'],
    phone: phoneMatch?.[0] || null,
    email: emailMatch?.[0] || null,
    address: null,
    city,
    targetAudience: null,
    uniqueSellingPoints: [],
    primaryColor: extractedPrimaryColor || colors.primary,
    secondaryColor: extractedSecondaryColor || colors.secondary,
  };
}
