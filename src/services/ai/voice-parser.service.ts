import { ExtractedBusinessInfo, BusinessType } from '@/types';
import { parseVoiceInputToBusinessInfo as libParseVoiceInput } from '@/lib/cohere-ai';

/**
 * Voice parser service - parses voice input into structured business data
 */
export class VoiceParserService {
  /**
   * Parse voice input and extract business information
   */
  async parseVoiceInput(voiceTranscript: string): Promise<ExtractedBusinessInfo> {
    const result = await libParseVoiceInput(voiceTranscript);
    return this.transformToTypedBusinessInfo(result);
  }

  /**
   * Transform lib ExtractedBusinessInfo to typed ExtractedBusinessInfo
   * Handles type differences between legacy lib types and centralized types
   */
  private transformToTypedBusinessInfo(info: any): ExtractedBusinessInfo {
    return {
      businessName: info.businessName,
      description: info.description,
      // Cast string to BusinessType (validate or default to 'service')
      businessType: this.normalizeBusinessType(info.businessType),
      services: info.services,
      features: info.features,
      phone: info.phone,
      email: info.email,
      address: info.address,
      city: info.city,
      primaryColor: info.primaryColor,
      secondaryColor: info.secondaryColor,
      targetAudience: info.targetAudience,
      uniqueSellingPoints: info.uniqueSellingPoints,
    };
  }

  /**
   * Normalize business type string to BusinessType enum
   */
  private normalizeBusinessType(type: string): BusinessType {
    const validTypes: BusinessType[] = [
      'ecommerce', 'restaurant', 'service', 'healthcare', 'fitness',
      'beauty', 'realestate', 'agency', 'portfolio', 'education', 'other'
    ];
    const normalized = type.toLowerCase();
    return validTypes.includes(normalized as BusinessType) 
      ? (normalized as BusinessType) 
      : 'service';
  }
}

export const voiceParserService = new VoiceParserService();
