/**
 * Test script for the production scraper
 * Run with: node test-scraper.mjs
 */

const testUrl = process.argv[2] || 'https://daisyrosegardendesign.com/';

async function testScraper() {
  console.log(`\n🔍 Testing scraper with: ${testUrl}\n`);
  console.log('=' .repeat(60));

  try {
    // Import the scraper
    const { scrapeUrl } = await import('./src/lib/production-scraper.ts');
    
    const startTime = Date.now();
    const result = await scrapeUrl(testUrl);
    const elapsed = Date.now() - startTime;
    
    console.log(`\n✅ Scraping completed in ${elapsed}ms`);
    console.log(`📊 Confidence: ${result.confidence}`);
    console.log(`📁 Source Type: ${result.sourceType}`);
    console.log('\n' + '=' .repeat(60));
    
    // Display results
    console.log('\n📌 BASIC INFO:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Description: ${result.description?.substring(0, 150)}...`);
    console.log(`   Business Type: ${result.businessType}`);
    console.log(`   Phone: ${result.phone || 'Not found'}`);
    console.log(`   Email: ${result.email || 'Not found'}`);
    console.log(`   Address: ${result.address || 'Not found'}`);
    
    console.log('\n🎨 BRANDING:');
    console.log(`   Logo: ${result.logo ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Hero Image: ${result.heroImage ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Primary Color: ${result.primaryColor}`);
    
    console.log('\n🔗 SOCIAL LINKS:');
    Object.entries(result.socialLinks).forEach(([key, value]) => {
      if (value) console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n📋 SERVICES:');
    if (result.services.length > 0) {
      result.services.slice(0, 8).forEach(s => console.log(`   • ${s}`));
      if (result.services.length > 8) console.log(`   ... and ${result.services.length - 8} more`);
    } else {
      console.log('   No services found');
    }
    
    console.log('\n⭐ TESTIMONIALS:');
    if (result.testimonials.length > 0) {
      result.testimonials.slice(0, 3).forEach(t => {
        console.log(`   "${t.text.substring(0, 100)}..."`);
        console.log(`   — ${t.name}${t.rating ? ` (${t.rating}⭐)` : ''}\n`);
      });
      if (result.testimonials.length > 3) console.log(`   ... and ${result.testimonials.length - 3} more`);
    } else {
      console.log('   No testimonials found');
    }
    
    console.log('\n🖼️  GALLERY IMAGES:');
    console.log(`   Found ${result.galleryImages.length} images`);
    
    console.log('\n📂 PORTFOLIO ITEMS:');
    if (result.portfolioItems && result.portfolioItems.length > 0) {
      result.portfolioItems.slice(0, 5).forEach(p => {
        console.log(`   • ${p.title}${p.category ? ` (${p.category})` : ''}`);
        if (p.description) console.log(`     ${p.description.substring(0, 80)}...`);
      });
      if (result.portfolioItems.length > 5) console.log(`   ... and ${result.portfolioItems.length - 5} more`);
    } else {
      console.log('   No portfolio items found');
    }
    
    console.log('\n📄 PAGES CRAWLED:');
    if (result.pages && result.pages.length > 0) {
      result.pages.forEach(p => {
        console.log(`   • [${p.type}] ${p.title} (${p.images.length} images)`);
      });
    } else {
      console.log('   No additional pages crawled');
    }
    
    console.log('\n👥 TEAM MEMBERS:');
    if (result.teamMembers && result.teamMembers.length > 0) {
      result.teamMembers.forEach(m => {
        console.log(`   • ${m.name} - ${m.role}`);
      });
    } else {
      console.log('   No team members found');
    }
    
    console.log('\n💰 PRICING INFO:');
    if (result.pricingInfo && result.pricingInfo.length > 0) {
      result.pricingInfo.forEach(p => {
        console.log(`   • ${p.name}: ${p.price}`);
      });
    } else {
      console.log('   No pricing info found');
    }
    
    console.log('\n📝 ABOUT CONTENT:');
    if (result.aboutContent) {
      console.log(`   ${result.aboutContent.substring(0, 300)}...`);
    } else {
      console.log('   No about content found');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Test completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    process.exit(1);
  }
}

testScraper();
