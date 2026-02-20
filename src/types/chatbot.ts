/**
 * Chatbot Types
 * Type definitions for the intelligent chatbot with URL extraction
 */

import type { SocialLinks } from './social';

export type ConversationState =
  | 'awaiting_url_or_name'
  | 'extracting_from_url'
  | 'confirming_extracted_profile'
  | 'interviewing_user'
  | 'enriching_with_url'
  | 'ready_to_generate_website';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export interface ImageAsset {
  url: string;
  type: 'logo' | 'hero' | 'gallery' | 'icon' | 'product' | 'team' | 'other';
  alt?: string;
  sourcePage?: string;
}

export interface ExtractedProfile {
  // Basic Info
  name?: string;
  description?: string;
  businessType?: string;
  
  // Contact
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  
  // Content
  services?: string[];
  products?: Array<{ name: string; description?: string; price?: number; image?: string }>;
  features?: string[];
  testimonials?: Array<{ name: string; text: string; rating?: number }>;
  
  // Social & Links
  socialLinks?: SocialLinks;
  sourceUrl?: string;
  
  // Visual
  logo?: string;
  heroImage?: string;
  galleryImages?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  
  // Metadata
  confidence?: ConfidenceLevel;
  rawText?: string;
  aboutContent?: string;
  scrapedImages?: ImageAsset[];
}

export interface ConfirmationPatch {
  field: string;
  oldValue: any;
  newValue: any;
  confirmed: boolean;
}

export interface WebsiteProfile {
  // Basic info
  name?: string;
  description?: string;
  businessType?: string;
  
  // Contact
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  
  // Services & Products
  services?: string[];
  features?: string[];
  products?: Array<{ name: string; description?: string; price?: number; image?: string }>;
  
  // Social
  socialLinks?: SocialLinks;
  
  // Visual Assets
  logo?: string;
  heroImage?: string;
  galleryImages?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  
  // Metadata
  sourceUrl?: string;
  targetAudience?: string;
  tone?: string; // 'professional' | 'modern' | 'luxury' | 'minimal' | 'playful'
  preferredSections?: string[];
  
  // Confidence tracking (per field)
  confidence: {
    overall?: ConfidenceLevel;
    [key: string]: ConfidenceLevel | undefined;
  };
  
  // Data source tracking (where each field came from)
  dataSource?: {
    [key: string]: 'user-provided' | 'structured-data' | 'inferred';
  };
  
  // Tracking
  extractionMethod?: 'url' | 'interview' | 'mixed';
  confirmationsPending?: string[];
  userCorrections?: ConfirmationPatch[];
}

export interface ChatbotState {
  conversationState: ConversationState;
  profile: Partial<WebsiteProfile>;
  extractedProfile?: ExtractedProfile;
  pendingConfirmations?: string[];
  confirmationPatches?: ConfirmationPatch[];
  currentQuestion?: string;
  urlDetected?: string;
  urlValidated?: boolean;
  extractionError?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  success: boolean;
  message?: string;
  state?: ChatbotState;
  suggestedActions?: string[];
  error?: string;
  needsConfirmation?: boolean;
  confirmationField?: string;
}
