import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || 'https://asimjofa.com';
  
  console.log(`🔍 Debugging product extraction from ${url}...`);
  
  try {
    // Fetch the HTML directly
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const html = await response.text();
    
    // Look for product cards in the HTML
    const productCardPatterns = [
      // Shopify product cards
      /<div[^>]*class="[^"]*product-card[^"]*"[^>]*>([\s\S]{0,3000}?)<\/div>/gi,
      /<div[^>]*class="[^"]*product-item[^"]*"[^>]*>([\s\S]{0,3000}?)<\/div>/gi,
      /<article[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]{0,3000}?)<\/article>/gi,
      // Generic patterns
      /<div[^>]*class="[^"]*card-product[^"]*"[^>]*>([\s\S]{0,3000}?)<\/div>/gi,
    ];
    
    const products = [];
    let sampleCards = [];
    
    for (const pattern of productCardPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (sampleCards.length < 3) {
          sampleCards.push(match[0].substring(0, 1000));
        }
        
        const cardHtml = match[0];
        
        // Extract product info
        const titleMatch = cardHtml.match(/<(?:h2|h3|a)[^>]*class="[^"]*(?:title|name|product)[^"]*"[^>]*>([^<]+)/i);
        const priceMatch = cardHtml.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)/i);
        const imageMatch = cardHtml.match(/<img[^>]*src="([^"]+)"/i);
        const linkMatch = cardHtml.match(/<a[^>]*href="([^"]+)"/i);
        
        if (titleMatch) {
          products.push({
            title: titleMatch[1].trim(),
            price: priceMatch ? priceMatch[1].trim() : 'Not found',
            image: imageMatch ? imageMatch[1] : 'Not found',
            link: linkMatch ? linkMatch[1] : 'Not found',
          });
        }
        
        if (products.length >= 10) break;
      }
      if (products.length >= 10) break;
    }
    
    // Also check for JSON-LD
    const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    const jsonLdData = [];
    
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        jsonLdData.push(data);
      } catch (e) {
        // Skip invalid JSON
      }
    }
    
    return NextResponse.json({
      success: true,
      url,
      productsFound: products.length,
      products: products.slice(0, 5),
      sampleCards: sampleCards.slice(0, 2),
      jsonLdStructures: jsonLdData.length,
      jsonLdSample: jsonLdData.slice(0, 2),
      htmlLength: html.length,
      // Check if it's Shopify
      isShopify: html.includes('Shopify') || html.includes('shopify'),
      shopifyTheme: html.match(/theme_name":\s*"([^"]+)"/)?.[1] || 'Unknown',
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
