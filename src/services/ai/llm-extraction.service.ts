/**
 * LLM Extraction Service
 * Extracts structured business information from text/voice input
 * Uses Cohere AI for intelligent extraction
 */

import { LLMExtractedData } from '@/types/landing-page';
import { BusinessType } from '@/types';

const COHERE_API_KEY = process.env.COHERE_API_KEY || process.env.cohere_api_key || '';
const COHERE_API_URL = 'https://api.cohere.ai/v1';

// ==================== LLM EXTRACTION ====================

export class LLMExtractionService {
  /**
   * Extract business information from text/voice input
   */
  async extractFromText(input: string): Promise<LLMExtractedData> {
    console.log('[LLMExtraction] Extracting from text input');

    if (!COHERE_API_KEY) {
      console.warn('[LLMExtraction] Cohere API key not configured, using fallback extraction');
      return this.fallbackExtraction(input);
    }

    try {
      const prompt = this.buildExtractionPrompt(input);
      const response = await this.callCohere(prompt);
      
      if (response) {
        return this.parseExtractionResponse(response);
      }
      
      return this.fallbackExtraction(input);
    } catch (error) {
      console.error('[LLMExtraction] Error:', error);
      return this.fallbackExtraction(input);
    }
  }

  /**
   * Build extraction prompt for Cohere
   */
  private buildExtractionPrompt(input: string): string {
    return `You are an expert business analyst. Extract structured business information from the following text. Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "businessName": "extracted business name or null",
  "businessType": "one of: ecommerce, restaurant, service, portfolio, agency, healthcare, fitness, beauty, realestate, education, startup, other",
  "targetAudience": "who is this business for",
  "industry": "industry category",
  "category": "specific category",
  "description": "1-2 sentence description",
  "services": ["service 1", "service 2", "service 3"],
  "features": ["feature 1", "feature 2", "feature 3"],
  "uniqueSellingPoints": ["USP 1", "USP 2", "USP 3"],
  "tone": "one of: professional, modern, friendly, luxury, casual",
  "preferredColors": {
    "primary": "#hexcode or null",
    "secondary": "#hexcode or null"
  },
  "phone": "extracted phone or null",
  "email": "extracted email or null",
  "address": "extracted address or null",
  "socialLinks": {
    "instagram": "url or null",
    "facebook": "url or null",
    "twitter": "url or null",
    "linkedin": "url or null"
  },
  "keyMessages": ["message 1", "message 2"],
  "callToAction": "suggested CTA text"
}

Text to analyze:
${input}

JSON output:`;
  }

  /**
   * Call Cohere API
   */
  private async callCohere(prompt: string): Promise<string | null> {
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
          max_tokens: 1000,
          temperature: 0.3, // Lower temperature for more structured output
          stop_sequences: ['--END--'],
        }),
      });

      if (!response.ok) {
        console.error('[LLMExtraction] Cohere API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.generations?.[0]?.text?.trim() || null;
    } catch (error) {
      console.error('[LLMExtraction] Cohere request failed:', error);
      return null;
    }
  }

  /**
   * Parse LLM response into structured data
   */
  private parseExtractionResponse(response: string): LLMExtractedData {
    try {
      // Try to extract JSON from response
      let jsonStr = response;
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      return {
        businessName: parsed.businessName || undefined,
        businessType: this.validateBusinessType(parsed.businessType),
        targetAudience: parsed.targetAudience || undefined,
        industry: parsed.industry || undefined,
        category: parsed.category || undefined,
        description: parsed.description || undefined,
        services: Array.isArray(parsed.services) ? parsed.services.filter(Boolean) : [],
        features: Array.isArray(parsed.features) ? parsed.features.filter(Boolean) : [],
        uniqueSellingPoints: Array.isArray(parsed.uniqueSellingPoints) 
          ? parsed.uniqueSellingPoints.filter(Boolean) 
          : [],
        tone: parsed.tone || 'modern',
        preferredColors: {
          primary: this.validateColor(parsed.preferredColors?.primary),
          secondary: this.validateColor(parsed.preferredColors?.secondary),
        },
        phone: parsed.phone || undefined,
        email: parsed.email || undefined,
        address: parsed.address || undefined,
        socialLinks: parsed.socialLinks || {},
        keyMessages: Array.isArray(parsed.keyMessages) ? parsed.keyMessages.filter(Boolean) : [],
        callToAction: parsed.callToAction || undefined,
      };
    } catch (error) {
      console.error('[LLMExtraction] Failed to parse response:', error);
      return {};
    }
  }

  /**
   * Validate business type
   */
  private validateBusinessType(type: string): BusinessType | undefined {
    const validTypes: BusinessType[] = [
      'ecommerce', 'restaurant', 'service', 'portfolio', 'agency',
      'healthcare', 'fitness', 'beauty', 'realestate', 'education', 'startup', 'other'
    ];

    return validTypes.includes(type as BusinessType) ? (type as BusinessType) : undefined;
  }

  /**
   * Validate color hex code
   */
  private validateColor(color: string | null | undefined): string | undefined {
    if (!color) return undefined;
    if (/^#[0-9A-Fa-f]{6}$/i.test(color)) return color;
    return undefined;
  }

  /**
   * Fallback extraction using regex patterns (when LLM is unavailable)
   */
  private fallbackExtraction(input: string): LLMExtractedData {
    const data: LLMExtractedData = {};

    // Extract email
    const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
    if (emailMatch) {
      data.email = emailMatch[1];
    }

    // Extract phone
    const phoneMatch = input.match(/(\+?[\d\s\-()]{10,20})/);
    if (phoneMatch) {
      data.phone = phoneMatch[1].replace(/[^\d+]/g, '');
    }

    // Detect business type from keywords
    const lowerInput = input.toLowerCase();
    
    const typePatterns: Array<[BusinessType, RegExp]> = [
      ['ecommerce', /\b(shop|store|ecommerce|online store|sell products?|selling)\b/],
      ['restaurant', /\b(restaurant|cafe|food|dining|menu|chef)\b/],
      ['agency', /\b(agency|creative|design|marketing|branding)\b/],
      ['fitness', /\b(fitness|gym|personal trainer|workout|training)\b/],
      ['beauty', /\b(salon|spa|beauty|hair|makeup)\b/],
      ['healthcare', /\b(health|medical|clinic|doctor|care)\b/],
      ['realestate', /\b(real estate|property|realtor)\b/],
      ['education', /\b(education|school|course|training|learning)\b/],
      ['portfolio', /\b(portfolio|freelance|designer|developer)\b/],
    ];

    for (const [type, pattern] of typePatterns) {
      if (pattern.test(lowerInput)) {
        data.businessType = type;
        break;
      }
    }

    // Extract services (look for bullet points or numbered lists)
    const servicePatterns = [
      /(?:•|-|\d\.)\s*([^\n•\-\d]{10,100})/g,
      /(?:offer|provide|specialize in)\s+([^,.]{10,100})/gi,
    ];

    const services: string[] = [];
    for (const pattern of servicePatterns) {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        services.push(match[1].trim());
        if (services.length >= 5) break;
      }
      if (services.length >= 5) break;
    }
    
    if (services.length > 0) {
      data.services = services;
    }

    // Detect tone from language
    if (lowerInput.includes('luxury') || lowerInput.includes('premium') || lowerInput.includes('exclusive')) {
      data.tone = 'luxury';
    } else if (lowerInput.includes('professional') || lowerInput.includes('business')) {
      data.tone = 'professional';
    } else if (lowerInput.includes('fun') || lowerInput.includes('friendly')) {
      data.tone = 'friendly';
    } else {
      data.tone = 'modern';
    }

    // Extract first sentence as description
    const firstSentence = input.match(/^[^.!?]+[.!?]/);
    if (firstSentence) {
      data.description = firstSentence[0].trim();
    }

    return data;
  }
}

export const llmExtractionService = new LLMExtractionService();
