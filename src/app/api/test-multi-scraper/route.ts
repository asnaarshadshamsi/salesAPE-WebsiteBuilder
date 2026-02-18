import { NextResponse } from 'next/server';
import { enhancedScraperService } from '@/services/scraper/enhanced-scraper.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'all';
  
  const testUrls = {
    ecommerce: 'https://asimjofa.com', // Shopify store with products
    service: 'https://webflow.com', // Service provider
    restaurant: 'https://www.chipotle.com', // Restaurant with menu
  };
  
  const results: any = {};
  
  console.log(`🧪 Testing Enhanced Scraper with different website types...`);
  
  try {
    if (testType === 'all' || testType === 'ecommerce') {
      console.log('\n📦 Testing E-Commerce Site...');
      const ecomResult = await enhancedScraperService.scrapeWebsite(testUrls.ecommerce);
      results.ecommerce = {
        url: testUrls.ecommerce,
        businessType: ecomResult.businessType,
        productsFound: ecomResult.products?.length || 0,
        servicesFound: ecomResult.services?.length || 0,
        sampleProducts: ecomResult.products?.slice(0, 2).map(p => ({
          name: p.name,
          price: p.price,
          hasImage: !!p.image,
        })),
        strategy: 'Shopify API',
      };
    }
    
    if (testType === 'all' || testType === 'service') {
      console.log('\n💼 Testing Service Provider Site...');
      const serviceResult = await enhancedScraperService.scrapeWebsite(testUrls.service);
      results.service = {
        url: testUrls.service,
        businessType: serviceResult.businessType,
        productsFound: serviceResult.products?.length || 0,
        servicesFound: serviceResult.services?.length || 0,
        sampleServices: serviceResult.services?.slice(0, 5),
        strategy: 'Service extraction from content',
      };
    }
    
    if (testType === 'all' || testType === 'restaurant') {
      console.log('\n🍽️ Testing Restaurant Site...');
      const restaurantResult = await enhancedScraperService.scrapeWebsite(testUrls.restaurant);
      results.restaurant = {
        url: testUrls.restaurant,
        businessType: restaurantResult.businessType,
        menuItemsFound: restaurantResult.products?.length || 0,
        servicesFound: restaurantResult.services?.length || 0,
        sampleMenuItems: restaurantResult.products?.slice(0, 3).map(p => ({
          name: p.name,
          price: p.price,
          description: p.description?.substring(0, 60),
        })),
        strategy: 'Menu extraction',
      };
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        ecommerce: results.ecommerce ? `✓ Found ${results.ecommerce.productsFound} products via ${results.ecommerce.strategy}` : 'Not tested',
        service: results.service ? `✓ Found ${results.service.servicesFound} services via ${results.service.strategy}` : 'Not tested',
        restaurant: results.restaurant ? `✓ Found ${results.restaurant.menuItemsFound} menu items via ${results.restaurant.strategy}` : 'Not tested',
      },
      results,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
