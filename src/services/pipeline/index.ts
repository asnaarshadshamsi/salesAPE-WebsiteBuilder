/**
 * Landing Page Generation Pipeline - Main Exports
 * 
 * Import everything you need from this file:
 * 
 * import { 
 *   generateLandingPage, 
 *   adaptToTemplateFormat,
 *   // ... other services
 * } from '@/services/pipeline';
 */

// Main pipeline
export { 
  landingPagePipeline, 
  generateLandingPage,
  type LandingPagePipeline 
} from './landing-page-pipeline.service';

// Template adapter
export { adaptToTemplateFormat } from './template-adapter.service';

// Individual services (if needed for advanced usage)
export { enhancedScraperService, EnhancedScraperService, type ScrapedImage, type EnhancedScrapedData } from '../scraper/enhanced-scraper.service';
export { llmExtractionService, LLMExtractionService } from '../ai/llm-extraction.service';
export { dataMergeService, DataMergeService } from '../ai/data-merge.service';
export { templateFieldGeneratorService, TemplateFieldGeneratorService } from '../ai/template-field-generator.service';
export { aiContentGeneratorService, AIContentGeneratorService } from '../ai/ai-content-generator.service';

// Types
export type {
  CompleteLandingPageData,
  PipelineResult,
  InputSource,
  ScrapedDataExtended,
  LLMExtractedData,
  NavLink,
  CTAButton,
  Feature,
  Stat,
  PortfolioItem,
  FormField,
} from '@/types/landing-page';
