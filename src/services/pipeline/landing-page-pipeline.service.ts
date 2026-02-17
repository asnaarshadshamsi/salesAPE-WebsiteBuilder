/**
 * Landing Page Generation Pipeline
 * Orchestrates the complete flow from input to fully generated landing page
 * 
 * Pipeline Steps:
 * 1. Scraping (if URL provided)
 * 2. LLM Extraction (if text/voice provided)
 * 3. Data Merging & Conflict Resolution
 * 4. Template Field Generation
 * 5. Final Assembly
 */

import { InputSource, PipelineResult, CompleteLandingPageData } from '@/types/landing-page';
import type { BusinessData } from '@/components/template/types/landing';
import { enhancedScraperService } from '../scraper/enhanced-scraper.service';
import { llmExtractionService } from '../ai/llm-extraction.service';
import { dataMergeService } from '../ai/data-merge.service';
import { templateFieldGeneratorService } from '../ai/template-field-generator.service';
import { aiContentGeneratorService } from '../ai/ai-content-generator.service';

interface PipelineInput {
  url?: string;
  text?: string;
  voice?: string; // Voice transcript
}

export class LandingPagePipeline {
  /**
   * Main pipeline execution
   */
  async generate(input: PipelineInput): Promise<PipelineResult> {
    console.log('[Pipeline] Starting landing page generation');
    console.log('[Pipeline] Input:', {
      hasUrl: !!input.url,
      hasText: !!input.text,
      hasVoice: !!input.voice,
    });

    const startTime = Date.now();

    try {
      // Step 1: Data Collection
      const [scrapedData, llmData] = await Promise.all([
        input.url ? this.scrapeData(input.url) : null,
        input.text || input.voice ? this.extractFromText(input.text || input.voice || '') : null,
      ]);

      console.log('[Pipeline] Data collected:', {
        scrapedConfidence: scrapedData?.confidence,
        hasLLMData: !!llmData,
      });

      // Step 2: Merge Data
      const mergedData = dataMergeService.merge(scrapedData, llmData);
      
      console.log('[Pipeline] Data merged:', {
        finalConfidence: mergedData.confidence,
        name: mergedData.name,
        businessType: mergedData.businessType,
      });

      // Step 3: Identify Missing Fields
      const missingFields = dataMergeService.identifyMissingFields(mergedData);
      
      // Step 4: Generate Missing Content with AI
      let enrichedData = mergedData;
      if (missingFields.length > 0) {
        console.log('[Pipeline] Generating missing content with AI:', missingFields);
        
        const aiGeneratedContent = await aiContentGeneratorService.generateMissingContent(
          {
            name: mergedData.name,
            businessType: mergedData.businessType,
            description: mergedData.description,
            industry: mergedData.industry,
            category: mergedData.category,
            services: mergedData.services,
            targetAudience: mergedData.targetAudience,
            tone: mergedData.tone,
          },
          missingFields
        );

        // Enrich merged data with AI-generated content
        enrichedData = {
          ...mergedData,
          description: aiGeneratedContent.aboutText || mergedData.description,
          services: mergedData.services.length > 0 ? mergedData.services : (aiGeneratedContent.services || []),
          features: mergedData.features.length > 0 ? mergedData.features : (aiGeneratedContent.features || []),
          aboutContent: aiGeneratedContent.aboutText || mergedData.aboutContent,
          testimonials: mergedData.testimonials.length > 0 ? mergedData.testimonials : (aiGeneratedContent.testimonials || []),
          keyMessages: aiGeneratedContent.headline ? [aiGeneratedContent.headline] : mergedData.keyMessages,
          callToAction: aiGeneratedContent.ctaText || mergedData.callToAction,
        };

        console.log('[Pipeline] Content enriched with AI generation');
      }

      // Step 5: Generate Complete Template Fields
      const completeLandingPage = templateFieldGeneratorService.generate(enrichedData);

      console.log('[Pipeline] Template fields generated');

      // Step 6: Identify Generated Fields
      const generatedFields = dataMergeService.identifyGeneratedFields(enrichedData, scrapedData, llmData);

      // Step 7: Assemble Final Result
      const result: PipelineResult = {
        data: completeLandingPage,
        meta: {
          sources: {
            url: input.url,
            hasTextInput: !!input.text,
            hasVoiceInput: !!input.voice,
          },
          confidence: enrichedData.confidence,
          missingFields: [], // All fields should now be filled
          generatedFields,
          timestamp: new Date().toISOString(),
        },
        warnings: this.generateWarnings(enrichedData, missingFields),
      };

      const elapsed = Date.now() - startTime;
      console.log(`[Pipeline] Completed in ${elapsed}ms`);

      return result;
    } catch (error) {
      console.error('[Pipeline] Error:', error);
      
      // Return fallback result
      return this.getFallbackResult(input);
    }
  }

  /**
   * Scrape data from URL
   */
  private async scrapeData(url: string) {
    console.log('[Pipeline] Scraping URL...');
    return await enhancedScraperService.scrapeWebsite(url);
  }

  /**
   * Extract data from text/voice
   */
  private async extractFromText(text: string) {
    console.log('[Pipeline] Extracting from text...');
    return await llmExtractionService.extractFromText(text);
  }

  /**
   * Generate warnings based on data quality
   */
  private generateWarnings(enrichedData: any, missingFields: string[]): string[] {
    const warnings: string[] = [];

    if (enrichedData.confidence === 'low') {
      warnings.push('Data confidence is low. Some content was AI-generated based on business type.');
    }

    if (!enrichedData.logo) {
      warnings.push('No logo found. Consider uploading a logo for better branding.');
    }

    if (!enrichedData.heroImage) {
      warnings.push('No hero image found. Adding a hero image will improve visual appeal.');
    }

    if (enrichedData.galleryImages.length === 0) {
      warnings.push('No gallery images found. Adding images will showcase your work better.');
    }

    if (!enrichedData.phone && !enrichedData.email) {
      warnings.push('No contact information found. Consider adding phone or email.');
    }

    return warnings;
  }

  /**
   * Get fallback result when pipeline fails
   */
  private getFallbackResult(input: PipelineInput): PipelineResult {
    const businessName = input.url ? new URL(input.url).hostname : 'Business Name';

    const fallbackData: CompleteLandingPageData = {
      brand: {
        name: businessName,
      },
      hero: {
        headline: businessName,
        subheadline: 'Professional services tailored to your needs',
        cta: { label: 'Get Started', href: '#contact' },
        secondaryCta: { label: 'Learn More', href: '#about' },
      },
      about: {
        title: 'About Us',
        description: 'We provide professional services to help businesses grow and succeed.',
      },
      cta: {
        title: 'Contact Us',
        description: 'Send us a message and we\'ll get back to you as soon as possible.',
        buttonLabel: 'Get In Touch',
        buttonHref: '#contact',
      },
      footer: {
        description: 'Professional services tailored to your needs.',
        copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
      },
      nav: {
        links: [
          { label: 'About', href: '#about' },
          { label: 'Contact', href: '#contact' },
        ],
      },
    };

    return {
      data: fallbackData,
      meta: {
        sources: {
          url: input.url,
          hasTextInput: !!input.text,
          hasVoiceInput: !!input.voice,
        },
        confidence: 'low',
        missingFields: ['logo', 'heroImage', 'services', 'features', 'testimonials'],
        generatedFields: ['all'],
        timestamp: new Date().toISOString(),
      },
      warnings: ['Pipeline failed. Using fallback data.'],
    };
  }
}

export const landingPagePipeline = new LandingPagePipeline();

/**
 * Convenience function for easy pipeline execution
 */
export async function generateLandingPage(input: PipelineInput): Promise<PipelineResult> {
  return await landingPagePipeline.generate(input);
}
