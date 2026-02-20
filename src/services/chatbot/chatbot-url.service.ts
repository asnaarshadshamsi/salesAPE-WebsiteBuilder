/**
 * Chatbot URL Detection and Extraction Service
 * Handles URL detection, validation, and extraction using existing pipeline
 */

import { businessAnalyzerService } from '@/services/business/business-analyzer.service';
import type { ExtractedProfile } from '@/types/chatbot';

class ChatbotUrlService {
  /**
   * Detect URL in user message
   */
  detectUrl(message: string): string | null {
    if (!message || typeof message !== 'string') {
      return null;
    }

    // Pattern 1: Full URLs with protocol
    const urlPattern1 = /https?:\/\/[^\s]+/gi;
    const match1 = message.match(urlPattern1);
    if (match1) return match1[0];

    // Pattern 2: www. domains
    const urlPattern2 = /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi;
    const match2 = message.match(urlPattern2);
    if (match2) return `https://${match2[0]}`;

    // Pattern 3: domain.com format (be conservative to avoid false positives)
    const urlPattern3 = /\b([a-zA-Z0-9-]+\.(com|net|org|io|co|uk|us|ca|au|de|fr|app|dev|tech))\b/gi;
    const match3 = message.match(urlPattern3);
    if (match3) return `https://${match3[0]}`;

    return null;
  }

  /**
   * Normalize URL (add https if missing)
   */
  normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  /**
   * Quick validation: check if URL format is valid
   */
  isValidUrlFormat(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is reachable (quick HEAD request)
   */
  async isUrlReachable(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Consider 200-399 as reachable, 403 might still be scrapable
      return response.status < 500 || response.status === 403;
    } catch {
      return false;
    }
  }

  /**
   * Extract profile from URL using existing business analyzer
   */
  async extractFromUrl(url: string): Promise<{ success: boolean; profile?: ExtractedProfile; error?: string }> {
    try {
      console.log('[ChatbotUrlService] Extracting from:', url);
      
      const extracted = await businessAnalyzerService.analyzeUrl(url);
      
      if (!extracted || !extracted.name) {
        return {
          success: false,
          error: 'Could not extract enough information from this URL',
        };
      }

      // Map to ExtractedProfile format
      const profile: ExtractedProfile = {
        name: extracted.name,
        description: extracted.description,
        businessType: extracted.businessType,
        phone: extracted.phone || undefined,
        email: extracted.email || undefined,
        address: extracted.address || undefined,
        services: extracted.services,
        products: extracted.products,
        features: extracted.features,
        testimonials: extracted.testimonials,
        socialLinks: extracted.socialLinks,
        sourceUrl: extracted.sourceUrl,
        logo: extracted.logo || undefined,
        heroImage: extracted.heroImage || undefined,
        galleryImages: extracted.galleryImages,
        primaryColor: extracted.primaryColor,
        secondaryColor: extracted.secondaryColor,
        confidence: extracted.confidence as any,
        rawText: extracted.rawText,
        aboutContent: extracted.aboutContent,
        scrapedImages: extracted.scrapedImages?.map((img: any) => ({
          url: img.url,
          type: img.type,
          alt: img.alt,
        })),
      };

      console.log('[ChatbotUrlService] Extraction successful:', {
        name: profile.name,
        type: profile.businessType,
        hasServices: !!profile.services?.length,
      });

      return { success: true, profile };
    } catch (error) {
      console.error('[ChatbotUrlService] Extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract from URL',
      };
    }
  }

  /**
   * Generate a summary of extracted profile
   */
  generateExtractionSummary(profile: ExtractedProfile): string {
    const parts: string[] = ['**What I found:**\n'];

    if (profile.name) {
      parts.push(`🏢 **${profile.name}** - ${this.formatBusinessType(profile.businessType)}`);
    }

    if (profile.address || profile.city) {
      const location = [profile.address, profile.city].filter(Boolean).join(', ');
      parts.push(`📍 ${location}`);
    }

    if (profile.phone || profile.email) {
      const contact = [profile.phone, profile.email].filter(Boolean).join(' • ');
      parts.push(`📞 ${contact}`);
    }

    if (profile.services && profile.services.length > 0) {
      const servicesList = profile.services.slice(0, 5).join(', ');
      parts.push(`🎯 Services: ${servicesList}${profile.services.length > 5 ? '...' : ''}`);
    }

    if (profile.description) {
      parts.push(`\n${profile.description.substring(0, 150)}${profile.description.length > 150 ? '...' : ''}`);
    }

    parts.push('\n*Please confirm if these details are correct.*');

    return parts.join('\n');
  }

  /**
   * Format business type for display
   */
  private formatBusinessType(type?: string): string {
    if (!type) return 'Business';
    
    const typeMap: Record<string, string> = {
      restaurant: 'Restaurant',
      beauty: 'Beauty & Salon',
      fitness: 'Fitness Center',
      healthcare: 'Healthcare',
      ecommerce: 'E-commerce Store',
      startup: 'Startup/SaaS',
      education: 'Education',
      realestate: 'Real Estate',
      agency: 'Agency',
      portfolio: 'Portfolio',
      service: 'Service Business',
      other: 'Business',
    };

    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export const chatbotUrlService = new ChatbotUrlService();
