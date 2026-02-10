/**
 * Test script for the production scraper
 * Run with: npx ts-node --esm src/lib/test-scraper.ts
 * Or: npx tsx src/lib/test-scraper.ts
 */

import { scrapeUrl } from './production-scraper';

const testUrls = [
  // Social platforms
  'https://instagram.com/nike',
  'https://www.facebook.com/cocacola',
  'https://tiktok.com/@charlidamelio',
  'https://twitter.com/elonmusk',
  'https://linkedin.com/company/google',
  
  // Websites
  'https://apple.com',
  'https://shopify.com',
  'https://stripe.com',
];

async function runTests() {
  console.log('🧪 Testing Production Scraper\n');
  console.log('='.repeat(60));

  for (const url of testUrls) {
    console.log(`\n📍 Testing: ${url}`);
    console.log('-'.repeat(60));
    
    try {
      const startTime = Date.now();
      const result = await scrapeUrl(url);
      const elapsed = Date.now() - startTime;
      
      console.log(`✅ Success in ${elapsed}ms`);
      console.log(`   Title: ${result.title}`);
      console.log(`   Type: ${result.sourceType}`);
      console.log(`   Business Type: ${result.businessType}`);
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Description: ${result.description?.substring(0, 80) || 'N/A'}...`);
      console.log(`   Logo: ${result.logo ? 'Found' : 'Not found'}`);
      console.log(`   Phone: ${result.phone || 'N/A'}`);
      console.log(`   Email: ${result.email || 'N/A'}`);
      console.log(`   Services: ${result.services.length} found`);
      console.log(`   Products: ${result.products.length} found`);
      console.log(`   Images: ${result.galleryImages.length} found`);
    } catch (error) {
      console.log(`❌ Failed: ${error}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Testing complete!\n');
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
