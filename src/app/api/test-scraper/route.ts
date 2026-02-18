import { NextResponse } from 'next/server';
import { enhancedScraperService } from '@/services/scraper/enhanced-scraper.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || 'https://asimjofa.com';
  
  console.log(`🔍 Testing Enhanced Scraper on ${url}...`);
  
  try {
    const startTime = Date.now();
    const result = await enhancedScraperService.scrapeWebsite(url);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Format the response with key information
    const summary = {
      success: true,
      duration: `${duration}s`,
      basicInfo: {
        name: result.name,
        description: result.description?.substring(0, 200),
        businessType: result.businessType,
        confidence: result.confidence,
      },
      branding: {
        hasLogo: !!result.logo,
        logoUrl: result.logo,
        hasHeroImage: !!result.heroImage,
        heroImageUrl: result.heroImage,
        primaryColor: result.primaryColor,
        secondaryColor: result.secondaryColor,
        galleryImagesCount: result.galleryImages?.length || 0,
      },
      contact: {
        phone: result.phone,
        email: result.email,
        address: result.address,
        city: result.city,
        socialLinks: result.socialLinks,
      },
      content: {
        servicesCount: result.services?.length || 0,
        services: result.services?.slice(0, 10) || [],
        featuresCount: result.features?.length || 0,
        features: result.features?.slice(0, 10) || [],
        productsCount: result.products?.length || 0,
        products: result.products?.slice(0, 5).map(p => ({
          name: p.name,
          price: p.price,
          description: p.description?.substring(0, 100),
          hasImage: !!p.image,
        })) || [],
        testimonialsCount: result.testimonials?.length || 0,
        testimonials: result.testimonials?.slice(0, 3) || [],
      },
      images: {
        totalCount: result.scrapedImages?.length || 0,
        byType: result.scrapedImages?.reduce((acc: any, img: any) => {
          acc[img.type] = (acc[img.type] || 0) + 1;
          return acc;
        }, {}) || {},
      },
      rawTextPreview: result.rawText?.substring(0, 500),
      fullData: result, // Include full data for inspection
    };
    
    return NextResponse.json(summary, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error during scraping:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
