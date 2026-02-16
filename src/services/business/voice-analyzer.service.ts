import { voiceParserService } from '../ai';
import { BusinessType } from '@/types';

/**
 * Voice analyzer service - analyzes voice input and extracts business data
 */
export class VoiceAnalyzerService {
  /**
   * Analyze voice transcript and extract business information
   */
  async analyzeVoiceInput(voiceTranscript: string) {
    if (!voiceTranscript || voiceTranscript.trim().length < 10) {
      throw new Error('Please provide more information about your business');
    }

    console.log('Analyzing voice input:', voiceTranscript);

    // Parse voice input using AI
    const extracted = await voiceParserService.parseVoiceInput(voiceTranscript);
    
    console.log('Extracted business info:', extracted);

    return {
      name: extracted.businessName,
      description: extracted.description,
      businessType: extracted.businessType as BusinessType,
      services: extracted.services,
      features: extracted.features,
      phone: extracted.phone,
      email: extracted.email,
      address: extracted.address,
      city: extracted.city,
      primaryColor: extracted.primaryColor,
      secondaryColor: extracted.secondaryColor,
      targetAudience: extracted.targetAudience,
      uniqueSellingPoints: extracted.uniqueSellingPoints,
      galleryImages: [], // Voice input doesn't have images
    };
  }
}

export const voiceAnalyzerService = new VoiceAnalyzerService();
