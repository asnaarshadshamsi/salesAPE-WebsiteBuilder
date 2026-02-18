/**
 * Test script for Enhanced Scraper Service
 * Run with: node --loader tsx test-scraper.js
 */

async function testScraper() {
  console.log('🔍 Testing Enhanced Scraper on asimjofa.com...\n');
  
  try {
    // Import the scraper service
    const { enhancedScraperService } = await import('./src/services/scraper/enhanced-scraper.service.ts');
    
    const url = 'https://asimjofa.com';
    console.log(`📡 Scraping: ${url}\n`);
    
    const startTime = Date.now();
    const result = await enhancedScraperService.scrapeWebsite(url);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ Scraping Complete!\n');
    console.log('=' .repeat(80));
    console.log('SCRAPING RESULTS');
    console.log('='.repeat(80));
    
    console.log('\n📋 BASIC INFO:');
    console.log(`  Name: ${result.name}`);
    console.log(`  Description: ${result.description?.substring(0, 150)}${result.description && result.description.length > 150 ? '...' : ''}`);
    console.log(`  Business Type: ${result.businessType}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Source: ${result.sourceType}`);
    console.log(`  Duration: ${duration}s`);
    
    console.log('\n🎨 BRANDING:');
    console.log(`  Logo: ${result.logo ? '✓ Found' : '✗ Not found'}`);
    console.log(`  Hero Image: ${result.heroImage ? '✓ Found' : '✗ Not found'}`);
    console.log(`  Primary Color: ${result.primaryColor}`);
    console.log(`  Secondary Color: ${result.secondaryColor}`);
    console.log(`  Gallery Images: ${result.galleryImages?.length || 0} images`);
    
    console.log('\n📞 CONTACT INFO:');
    console.log(`  Phone: ${result.phone || 'Not found'}`);
    console.log(`  Email: ${result.email || 'Not found'}`);
    console.log(`  Address: ${result.address || 'Not found'}`);
    console.log(`  City: ${result.city || 'Not found'}`);
    
    console.log('\n🔗 SOCIAL LINKS:');
    if (result.socialLinks && Object.keys(result.socialLinks).length > 0) {
      Object.entries(result.socialLinks).forEach(([platform, link]) => {
        if (link) console.log(`  ${platform}: ${link}`);
      });
    } else {
      console.log('  None found');
    }
    
    console.log('\n💼 SERVICES:');
    if (result.services && result.services.length > 0) {
      result.services.slice(0, 10).forEach((service, i) => {
        console.log(`  ${i + 1}. ${service}`);
      });
      if (result.services.length > 10) {
        console.log(`  ... and ${result.services.length - 10} more`);
      }
    } else {
      console.log('  None found');
    }
    
    console.log('\n✨ FEATURES:');
    if (result.features && result.features.length > 0) {
      result.features.slice(0, 10).forEach((feature, i) => {
        console.log(`  ${i + 1}. ${feature}`);
      });
      if (result.features.length > 10) {
        console.log(`  ... and ${result.features.length - 10} more`);
      }
    } else {
      console.log('  None found');
    }
    
    console.log('\n🛍️ PRODUCTS:');
    if (result.products && result.products.length > 0) {
      console.log(`  Total Products: ${result.products.length}`);
      result.products.slice(0, 5).forEach((product, i) => {
        console.log(`\n  ${i + 1}. ${product.name}`);
        if (product.description) {
          console.log(`     Description: ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}`);
        }
        if (product.price) {
          console.log(`     Price: ${product.price}`);
        }
        if (product.image) {
          console.log(`     Image: ✓`);
        }
      });
      if (result.products.length > 5) {
        console.log(`\n  ... and ${result.products.length - 5} more products`);
      }
    } else {
      console.log('  None found');
    }
    
    console.log('\n💬 TESTIMONIALS:');
    if (result.testimonials && result.testimonials.length > 0) {
      result.testimonials.slice(0, 3).forEach((testimonial, i) => {
        console.log(`\n  ${i + 1}. ${testimonial.name}`);
        console.log(`     "${testimonial.text.substring(0, 100)}${testimonial.text.length > 100 ? '...' : ''}"`);
        if (testimonial.rating) {
          console.log(`     Rating: ${'⭐'.repeat(testimonial.rating)}`);
        }
      });
      if (result.testimonials.length > 3) {
        console.log(`\n  ... and ${result.testimonials.length - 3} more testimonials`);
      }
    } else {
      console.log('  None found');
    }
    
    console.log('\n🖼️ IMAGES EXTRACTED:');
    if (result.scrapedImages && result.scrapedImages.length > 0) {
      console.log(`  Total Images: ${result.scrapedImages.length}`);
      const imagesByType = result.scrapedImages.reduce((acc, img) => {
        acc[img.type] = (acc[img.type] || 0) + 1;
        return acc;
      }, {});
      Object.entries(imagesByType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    } else {
      console.log('  None found');
    }
    
    console.log('\n📝 RAW TEXT SNIPPET (for LLM):');
    if (result.rawText) {
      console.log(result.rawText.substring(0, 500) + '...\n');
    }
    
    console.log('='.repeat(80));
    console.log('\n✨ Full data saved to: scraper-result.json\n');
    
    // Save full result to file for detailed inspection
    const fs = await import('fs');
    fs.writeFileSync(
      'scraper-result.json',
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testScraper();
