/**
 * Template Data Adapter
 * Now that CompleteLandingPageData is an alias for BusinessData,
 * this is essentially a passthrough. Kept for API compatibility.
 */

import { CompleteLandingPageData } from '@/types/landing-page';
import { BusinessData } from '@/components/template/types/landing';

/**
 * Convert pipeline output to BusinessData for the LandingTemplate.
 * Since CompleteLandingPageData === BusinessData, this is an identity function.
 */
export function adaptToTemplateFormat(data: CompleteLandingPageData): BusinessData {
  return data;
}
