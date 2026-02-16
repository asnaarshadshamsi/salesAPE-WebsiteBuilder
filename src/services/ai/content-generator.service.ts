import { GeneratedContent, ContentGenerationInput } from '@/types';
import { generateContent as libGenerateContent, generateEnhancedContent as libGenerateEnhancedContent, isCohereConfigured } from '@/lib/ai';

/**
 * Content generator service - generates AI-powered content for businesses
 */
export class ContentGeneratorService {
  /**
   * Generate content for a business (tries AI first, falls back to templates)
   */
  async generateContent(input: ContentGenerationInput): Promise<GeneratedContent> {
    try {
      if (isCohereConfigured()) {
        const result = await libGenerateEnhancedContent(input);
        return this.transformToTypedContent(result);
      } else {
        const result = libGenerateContent(input);
        return this.transformToTypedContent(result);
      }
    } catch (error) {
      console.error('Error generating AI content, using templates:', error);
      const result = libGenerateContent(input);
      return this.transformToTypedContent(result);
    }
  }

  /**
   * Transform lib GeneratedContent to typed GeneratedContent
   * Handles type differences between legacy lib types and centralized types
   */
  private transformToTypedContent(content: any): GeneratedContent {
    return {
      headline: content.headline,
      subheadline: content.subheadline,
      aboutText: content.aboutText,
      ctaText: content.ctaText,
      services: content.services,
      features: content.features,
      metaDescription: content.metaDescription,
      tagline: content.tagline,
      valuePropositions: content.valuePropositions,
      // Transform serviceDescriptions from object array to string array
      serviceDescriptions: Array.isArray(content.serviceDescriptions)
        ? content.serviceDescriptions.map((s: any) => 
            typeof s === 'string' ? s : s.description || s.name
          )
        : undefined,
      socialMediaBio: content.socialMediaBio,
    };
  }
}

export const contentGeneratorService = new ContentGeneratorService();
