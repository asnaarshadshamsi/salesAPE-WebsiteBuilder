/**
 * Test script for scraping peiramaparfums.com
 */

async function testPerfumeSite() {
  console.log('🔍 Testing scraper on peiramaparfums.com...\n');
  
  try {
    // Import the scraper
    const { scrapeUrl } = await import('./src/lib/production-scraper.ts');
    
    const url = 'https://peiramaparfums.com/';
    console.log(`📡 Scraping: ${url}\n`);
    
    const startTime = Date.now();
    const result = await scrapeUrl(url);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ Scraping Complete!\n');
    console.log('=' .repeat(80));
    console.log('SCRAPING RESULTS');
    console.log('='.repeat(80));
    
    console.log('\n📋 BASIC INFO:');
    console.log(`  Title: ${result.title}`);
    console.log(`  Description: ${result.description?.substring(0, 150)}${result.description && result.description.length > 150 ? '...' : ''}`);
    console.log(`  Business Type: ${result.businessType}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Source: ${result.sourceType}`);
    console.log(`  Duration: ${duration}s`);
    
    console.log('\n🎨 BRANDING:');
    console.log(`  Logo: ${result.logo || 'Not found'}`);
    console.log(`  Hero Image: ${result.heroImage || 'Not found'}`);
    console.log(`  Primary Color: ${result.primaryColor}`);
    console.log(`  Secondary Color: ${result.secondaryColor}`);
    
    console.log('\n📞 CONTACT INFO:');
    console.log(`  Phone: ${result.phone || 'Not found'}`);
    console.log(`  Email: ${result.email || 'Not found'}`);
    console.log(`  Address: ${result.address || 'Not found'}`);
    
    console.log('\n🔗 SOCIAL LINKS:');
    if (result.socialLinks && Object.keys(result.socialLinks).length > 0) {
      Object.entries(result.socialLinks).forEach(([platform, link]) => {
        if (link) console.log(`  ${platform}: ${link}`);
      });
    } else {
      console.log('  None found');
    }
    
    console.log('\n🛍️ PRODUCTS:');
    console.log(`  Found ${result.products?.length || 0} products`);
    if (result.products && result.products.length > 0) {
      result.products.slice(0, 5).forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.name}${product.price ? ` - $${product.price}` : ''}`);
      });
    }
    
    console.log('\n💼 SERVICES:');
    console.log(`  Found ${result.services?.length || 0} services`);
    if (result.services && result.services.length > 0) {
      result.services.slice(0, 8).forEach((service, i) => {
        console.log(`  ${i + 1}. ${service}`);
      });
    }
    
    console.log('\n✨ FEATURES:');
    console.log(`  Found ${result.features?.length || 0} features`);
    if (result.features && result.features.length > 0) {
      result.features.slice(0, 5).forEach((feature, i) => {
        console.log(`  ${i + 1}. ${feature}`);
      });
    }
    
    console.log('\n🖼️ GALLERY:');
    console.log(`  Found ${result.galleryImages?.length || 0} gallery images`);
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testPerfumeSite();
