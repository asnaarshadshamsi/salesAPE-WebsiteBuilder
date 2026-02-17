/**
 * Production-Ready Web & Social Media Scraper
 * 
 * Uses multiple fallback strategies:
 * 1. Direct HTML scraping with rotation user-agents
 * 2. Public APIs (when available)
 * 3. Meta tag extraction
 * 4. Google search data extraction
 * 5. AI-powered content inference from partial data
 * 
 * Supports: Instagram, Facebook, TikTok, Twitter/X, LinkedIn, Google Business, any website
 */

import { generateEnhancedContent, type GeneratedContent } from './ai';

// ==================== TYPES ====================

export interface ProductData {
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface ScrapedData {
  title: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  primaryColor: string;
  secondaryColor: string;
  businessType: 'ecommerce' | 'restaurant' | 'service' | 'portfolio' | 'agency' | 'healthcare' | 'fitness' | 'beauty' | 'realestate' | 'education' | 'other';
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: SocialLinks;
  products: ProductData[];
  services: string[];
  openingHours: Record<string, string> | null;
  features: string[];
  testimonials: { name: string; text: string; rating?: number }[];
  galleryImages: string[];
  // Additional metadata
  sourceType: 'website' | 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'linkedin' | 'google_business';
  scrapedAt: string;
  confidence: 'high' | 'medium' | 'low';
  // Extended multi-page data
  portfolioItems?: { title: string; description?: string; image: string; category?: string }[];
  teamMembers?: { name: string; role: string; image?: string; bio?: string }[];
  aboutContent?: string;
  pricingInfo?: { name: string; price: string; features: string[] }[];
  pages?: { url: string; type: string; title: string; content: string; images: string[] }[];
}

// ==================== USER AGENTS ====================

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
];

const MOBILE_USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Instagram 300.0.0.0.0 Android',
];

function getRandomUserAgent(mobile = false): string {
  const agents = mobile ? MOBILE_USER_AGENTS : USER_AGENTS;
  return agents[Math.floor(Math.random() * agents.length)];
}

// ==================== MAIN SCRAPER ====================

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  const startTime = Date.now();
  console.log(`[Scraper] Starting scrape for: ${url}`);
  
  try {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Detect source type and route to appropriate scraper
    const sourceType = detectSourceType(normalizedUrl);
    console.log(`[Scraper] Detected source type: ${sourceType}`);

    let result: ScrapedData;

    switch (sourceType) {
      case 'instagram':
        result = await scrapeInstagram(normalizedUrl);
        break;
      case 'facebook':
        result = await scrapeFacebook(normalizedUrl);
        break;
      case 'tiktok':
        result = await scrapeTikTok(normalizedUrl);
        break;
      case 'twitter':
        result = await scrapeTwitter(normalizedUrl);
        break;
      case 'linkedin':
        result = await scrapeLinkedIn(normalizedUrl);
        break;
      case 'google_business':
        result = await scrapeGoogleBusiness(normalizedUrl);
        break;
      default:
        result = await scrapeWebsite(normalizedUrl);
    }

    // Enhance with AI if we have minimal data
    if (result.confidence === 'low' || (!result.description && !result.services.length)) {
      result = await enhanceWithAI(result, normalizedUrl);
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Scraper] Completed in ${elapsed}ms with confidence: ${result.confidence}`);

    return result;

  } catch (error) {
    console.error('[Scraper] Fatal error:', error);
    return getDefaultScrapedData('website', 'low');
  }
}

// ==================== SOURCE TYPE DETECTION ====================

function detectSourceType(url: string): ScrapedData['sourceType'] {
  const lower = url.toLowerCase();
  
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('fb.me')) return 'facebook';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('google.com/maps') || lower.includes('goo.gl/maps') || lower.includes('g.page')) return 'google_business';
  
  return 'website';
}

// ==================== INSTAGRAM SCRAPER ====================

async function scrapeInstagram(url: string): Promise<ScrapedData> {
  const username = extractInstagramUsername(url);
  console.log(`[Instagram] Scraping @${username}`);

  if (!username) {
    return getDefaultScrapedData('instagram', 'low');
  }

  // Strategy 1: Try the i.instagram.com API (mobile API)
  let data = await tryInstagramMobileAPI(username);
  
  // Strategy 2: Try web profile with multiple user agents
  if (!data) {
    data = await tryInstagramWebProfile(username);
  }

  // Strategy 3: Try Instagram's GraphQL endpoint
  if (!data) {
    data = await tryInstagramGraphQL(username);
  }

  // Strategy 4: Use any cached/CDN data we can find
  if (!data) {
    data = await tryInstagramCDNData(username);
  }

  // Build result from whatever data we got
  if (data) {
    const name = data.fullName || username;
    // Create a better description if no bio is available
    let description = data.biography;
    if (!description || description.length < 10) {
      description = data.category 
        ? `${name} - ${data.category}. Follow @${username} on Instagram.`
        : `${name} on Instagram. Follow @${username} for updates.`;
    }
    
    return {
      title: name,
      description,
      logo: data.profilePicUrl,
      heroImage: data.posts?.[0]?.imageUrl || data.profilePicUrl,
      primaryColor: '#E1306C', // Instagram pink
      secondaryColor: '#833AB4', // Instagram purple
      businessType: detectBusinessTypeFromBio(data.biography, data.category),
      phone: data.phone,
      email: data.email,
      address: data.address,
      socialLinks: {
        instagram: `https://instagram.com/${username}`,
        website: data.website,
      },
      products: extractProductsFromPosts(data.posts || []),
      services: extractServicesFromBio(data.biography),
      openingHours: null,
      features: extractFeaturesFromBio(data.biography),
      testimonials: [],
      galleryImages: (data.posts || []).slice(0, 9).map((p: any) => p.imageUrl).filter(Boolean),
      sourceType: 'instagram',
      scrapedAt: new Date().toISOString(),
      confidence: data.fullName && data.fullName !== username ? 'high' : 'medium',
    };
  }

  // Fallback: Return basic data with username
  return {
    ...getDefaultScrapedData('instagram', 'low'),
    title: username,
    description: `Instagram business profile - @${username}`,
    socialLinks: { instagram: `https://instagram.com/${username}` },
  };
}

async function tryInstagramMobileAPI(username: string): Promise<any | null> {
  try {
    const response = await fetchWithRetry(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        'User-Agent': 'Instagram 300.0.0.0.0 Android (26/8.0.0; 480dpi; 1080x1920; samsung; SM-G950F; dreamlte; samsungexynos8895; en_US; 524221486)',
        'X-IG-App-ID': '936619743392459',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) return null;
    
    const json = await response.json();
    const user = json?.data?.user;
    
    if (!user) return null;

    return {
      username: user.username,
      fullName: user.full_name,
      biography: user.biography,
      website: user.external_url,
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url,
      followersCount: user.edge_followed_by?.count || 0,
      category: user.category_name || user.business_category_name,
      email: user.business_email,
      phone: user.business_phone_number,
      address: user.business_address_json ? parseAddress(user.business_address_json) : null,
      posts: extractPostsFromEdges(user.edge_owner_to_timeline_media?.edges || []),
    };
  } catch (error) {
    console.log('[Instagram] Mobile API failed:', error);
    return null;
  }
}

async function tryInstagramWebProfile(username: string): Promise<any | null> {
  try {
    // Try fetching the profile page and parsing meta tags
    const response = await fetchWithRetry(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Try to find the shared data JSON
    const sharedDataPatterns = [
      /window\._sharedData\s*=\s*({.+?});<\/script>/,
      /window\.__additionalDataLoaded\s*\([^,]+,\s*({.+?})\s*\)/,
      /"user":\s*({[^}]+?"username"[^}]+})/,
    ];

    for (const pattern of sharedDataPatterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          const user = data?.entry_data?.ProfilePage?.[0]?.graphql?.user || 
                       data?.graphql?.user ||
                       data;
          if (user?.username) {
            return {
              username: user.username,
              fullName: user.full_name,
              biography: user.biography,
              website: user.external_url,
              profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url,
              followersCount: user.edge_followed_by?.count || 0,
              category: user.category_name,
              email: user.business_email,
              phone: user.business_phone_number,
              posts: extractPostsFromEdges(user.edge_owner_to_timeline_media?.edges || []),
            };
          }
        } catch {
          continue;
        }
      }
    }

    // Fallback to meta tag extraction
    return extractFromMetaTags(html, username);

  } catch (error) {
    console.log('[Instagram] Web profile failed:', error);
    return null;
  }
}

async function tryInstagramGraphQL(username: string): Promise<any | null> {
  try {
    // Instagram's GraphQL endpoint
    const variables = JSON.stringify({ username, include_reel: true, include_logged_out_extras: true });
    const url = `https://www.instagram.com/graphql/query/?query_hash=c9100bf9110dd6361671f113dd02e7d6&variables=${encodeURIComponent(variables)}`;
    
    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) return null;

    const json = await response.json();
    const user = json?.data?.user;
    
    if (!user) return null;

    return {
      username: user.username,
      fullName: user.full_name,
      biography: user.biography,
      website: user.external_url,
      profilePicUrl: user.profile_pic_url_hd,
      followersCount: user.edge_followed_by?.count || 0,
      category: user.category_name,
      posts: extractPostsFromEdges(user.edge_owner_to_timeline_media?.edges || []),
    };
  } catch (error) {
    console.log('[Instagram] GraphQL failed:', error);
    return null;
  }
}

async function tryInstagramCDNData(username: string): Promise<any | null> {
  try {
    // Try fetching profile picture URL which often contains useful data
    const response = await fetchWithRetry(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': getRandomUserAgent(true),
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.graphql?.user) {
        return data.graphql.user;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function extractInstagramUsername(url: string): string | null {
  const patterns = [
    /instagram\.com\/([^/?#]+)/i,
    /instagr\.am\/([^/?#]+)/i,
    /@([a-zA-Z0-9._]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && !['p', 'reel', 'stories', 'explore', 'accounts'].includes(match[1].toLowerCase())) {
      return match[1].replace(/\/$/, '');
    }
  }
  return null;
}

// ==================== FACEBOOK SCRAPER ====================

async function scrapeFacebook(url: string): Promise<ScrapedData> {
  const pageId = extractFacebookPageId(url);
  console.log(`[Facebook] Scraping page: ${pageId}`);

  if (!pageId) {
    return getDefaultScrapedData('facebook', 'low');
  }

  // Strategy 1: Try Facebook's public page
  let data = await tryFacebookWebPage(pageId);

  // Strategy 2: Try oEmbed
  if (!data) {
    data = await tryFacebookOEmbed(pageId);
  }

  if (data) {
    return {
      title: data.name || pageId,
      description: data.about || data.description || `Facebook page - ${pageId}`,
      logo: data.profilePic,
      heroImage: data.coverPhoto || data.profilePic,
      primaryColor: '#1877F2', // Facebook blue
      secondaryColor: '#42B72A', // Facebook green
      businessType: detectBusinessTypeFromCategory(data.category),
      phone: data.phone,
      email: data.email,
      address: data.address,
      socialLinks: {
        facebook: `https://facebook.com/${pageId}`,
        website: data.website,
      },
      products: [],
      services: [],
      openingHours: data.hours,
      features: [],
      testimonials: [],
      galleryImages: data.photos || [],
      sourceType: 'facebook',
      scrapedAt: new Date().toISOString(),
      confidence: data.name ? 'high' : 'medium',
    };
  }

  return {
    ...getDefaultScrapedData('facebook', 'low'),
    title: pageId,
    socialLinks: { facebook: `https://facebook.com/${pageId}` },
  };
}

async function tryFacebookWebPage(pageId: string): Promise<any | null> {
  try {
    const response = await fetchWithRetry(`https://www.facebook.com/${pageId}/about`, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract from meta tags
    const name = extractMetaContent(html, 'og:title') || extractMetaContent(html, 'title');
    const description = extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description');
    const image = extractMetaContent(html, 'og:image');

    // Try to find structured data
    const ldJsonMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/i);
    let structuredData: any = {};
    if (ldJsonMatch) {
      try {
        structuredData = JSON.parse(ldJsonMatch[1]);
      } catch {}
    }

    return {
      name: name?.replace(/\s*[|\-–]\s*Facebook.*$/i, '').trim(),
      about: description,
      description: description,
      profilePic: image,
      coverPhoto: null,
      category: structuredData['@type'] || 'Business',
      website: structuredData.url,
      phone: structuredData.telephone,
      address: structuredData.address?.streetAddress,
      hours: structuredData.openingHours,
    };
  } catch (error) {
    console.log('[Facebook] Web page failed:', error);
    return null;
  }
}

async function tryFacebookOEmbed(pageId: string): Promise<any | null> {
  try {
    const pageUrl = `https://www.facebook.com/${pageId}`;
    const response = await fetchWithRetry(`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=500`, {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const nameMatch = html.match(/data-name="([^"]+)"/);
    const imageMatch = html.match(/data-image="([^"]+)"/);

    if (nameMatch) {
      return {
        name: decodeHTMLEntities(nameMatch[1]),
        profilePic: imageMatch ? decodeHTMLEntities(imageMatch[1]) : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function extractFacebookPageId(url: string): string | null {
  const patterns = [
    /facebook\.com\/(?:pages\/[^/]+\/)?([^/?#]+)/i,
    /fb\.com\/([^/?#]+)/i,
    /fb\.me\/([^/?#]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && !['groups', 'events', 'marketplace', 'watch', 'gaming'].includes(match[1].toLowerCase())) {
      return match[1];
    }
  }
  return null;
}

// ==================== TIKTOK SCRAPER ====================

async function scrapeTikTok(url: string): Promise<ScrapedData> {
  const username = extractTikTokUsername(url);
  console.log(`[TikTok] Scraping @${username}`);

  if (!username) {
    return getDefaultScrapedData('tiktok', 'low');
  }

  let data = await tryTikTokWebProfile(username);

  if (data) {
    return {
      title: data.nickname || username,
      description: data.signature || `TikTok creator - @${username}`,
      logo: data.avatarLarger || data.avatarMedium,
      heroImage: data.avatarLarger,
      primaryColor: '#000000',
      secondaryColor: '#FE2C55', // TikTok red
      businessType: 'service',
      phone: null,
      email: null,
      address: null,
      socialLinks: {
        tiktok: `https://tiktok.com/@${username}`,
      },
      products: [],
      services: [],
      openingHours: null,
      features: [],
      testimonials: [],
      galleryImages: (data.videos || []).slice(0, 9).map((v: any) => v.cover),
      sourceType: 'tiktok',
      scrapedAt: new Date().toISOString(),
      confidence: data.nickname ? 'high' : 'medium',
    };
  }

  return {
    ...getDefaultScrapedData('tiktok', 'low'),
    title: username,
    socialLinks: { tiktok: `https://tiktok.com/@${username}` },
  };
}

async function tryTikTokWebProfile(username: string): Promise<any | null> {
  try {
    const response = await fetchWithRetry(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Try to find SIGI_STATE data
    const sigiMatch = html.match(/SIGI_STATE['"]\s*:\s*({.+?})\s*,\s*['"]SIGI_RETRY/);
    if (sigiMatch) {
      try {
        const data = JSON.parse(sigiMatch[1]);
        const userKey = Object.keys(data.UserModule?.users || {})[0];
        if (userKey) {
          const user = data.UserModule.users[userKey];
          return {
            nickname: user.nickname,
            signature: user.signature,
            avatarLarger: user.avatarLarger,
            avatarMedium: user.avatarMedium,
          };
        }
      } catch {}
    }

    // Fallback to meta tags
    const nickname = extractMetaContent(html, 'og:title')?.replace(/@[^\s]+\s*\|\s*TikTok/i, '').trim();
    const description = extractMetaContent(html, 'og:description');
    const image = extractMetaContent(html, 'og:image');

    return nickname ? { nickname, signature: description, avatarLarger: image } : null;
  } catch (error) {
    console.log('[TikTok] Web profile failed:', error);
    return null;
  }
}

function extractTikTokUsername(url: string): string | null {
  const match = url.match(/tiktok\.com\/@?([^/?#]+)/i);
  return match ? match[1].replace(/^@/, '') : null;
}

// ==================== TWITTER SCRAPER ====================

async function scrapeTwitter(url: string): Promise<ScrapedData> {
  const username = extractTwitterUsername(url);
  console.log(`[Twitter] Scraping @${username}`);

  if (!username) {
    return getDefaultScrapedData('twitter', 'low');
  }

  let data = await tryTwitterWebProfile(username);

  if (data) {
    return {
      title: data.name || username,
      description: data.description || `Twitter profile - @${username}`,
      logo: data.profileImageUrl,
      heroImage: data.profileBannerUrl || data.profileImageUrl,
      primaryColor: '#1DA1F2', // Twitter blue
      secondaryColor: '#14171A',
      businessType: 'service',
      phone: null,
      email: null,
      address: data.location,
      socialLinks: {
        twitter: `https://twitter.com/${username}`,
        website: data.url,
      },
      products: [],
      services: [],
      openingHours: null,
      features: [],
      testimonials: [],
      galleryImages: [],
      sourceType: 'twitter',
      scrapedAt: new Date().toISOString(),
      confidence: data.name ? 'high' : 'medium',
    };
  }

  return {
    ...getDefaultScrapedData('twitter', 'low'),
    title: username,
    socialLinks: { twitter: `https://twitter.com/${username}` },
  };
}

async function tryTwitterWebProfile(username: string): Promise<any | null> {
  try {
    const response = await fetchWithRetry(`https://twitter.com/${username}`, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract from meta tags
    const title = extractMetaContent(html, 'og:title');
    const description = extractMetaContent(html, 'og:description');
    const image = extractMetaContent(html, 'og:image');

    // Parse the title format: "Name (@username) / X"
    const nameMatch = title?.match(/^(.+?)\s*\(@/);
    const name = nameMatch ? nameMatch[1] : username;

    return {
      name,
      description,
      profileImageUrl: image?.replace('_normal', '_400x400'),
      location: null,
      url: null,
    };
  } catch (error) {
    console.log('[Twitter] Web profile failed:', error);
    return null;
  }
}

function extractTwitterUsername(url: string): string | null {
  const patterns = [
    /(?:twitter|x)\.com\/([^/?#]+)/i,
    /@([a-zA-Z0-9_]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && !['home', 'explore', 'search', 'messages', 'settings', 'i'].includes(match[1].toLowerCase())) {
      return match[1];
    }
  }
  return null;
}

// ==================== LINKEDIN SCRAPER ====================

async function scrapeLinkedIn(url: string): Promise<ScrapedData> {
  const identifier = extractLinkedInIdentifier(url);
  console.log(`[LinkedIn] Scraping: ${identifier}`);

  if (!identifier) {
    return getDefaultScrapedData('linkedin', 'low');
  }

  let data = await tryLinkedInWebProfile(identifier, url);

  if (data) {
    return {
      title: data.name || identifier,
      description: data.description || `LinkedIn profile`,
      logo: data.logo,
      heroImage: data.coverImage || null, // Don't use logo as fallback - let AI generate appropriate content
      primaryColor: '#0A66C2', // LinkedIn blue
      secondaryColor: '#004182',
      businessType: data.isCompany ? 'agency' : 'service',
      phone: null,
      email: null,
      address: data.location,
      socialLinks: {
        linkedin: url,
        website: data.website,
      },
      products: [],
      services: data.services || [],
      openingHours: null,
      features: [],
      testimonials: [],
      galleryImages: [],
      sourceType: 'linkedin',
      scrapedAt: new Date().toISOString(),
      confidence: data.name ? 'high' : 'medium',
    };
  }

  return {
    ...getDefaultScrapedData('linkedin', 'low'),
    title: identifier,
    socialLinks: { linkedin: url },
  };
}

async function tryLinkedInWebProfile(identifier: string, originalUrl: string): Promise<any | null> {
  try {
    const response = await fetchWithRetry(originalUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract from meta tags
    const name = extractMetaContent(html, 'og:title')?.replace(/\s*[|\-–]\s*LinkedIn.*$/i, '').trim();
    const description = extractMetaContent(html, 'og:description');
    const image = extractMetaContent(html, 'og:image');

    const isCompany = originalUrl.includes('/company/');

    return {
      name,
      description,
      logo: image,
      isCompany,
      location: null,
      website: null,
    };
  } catch (error) {
    console.log('[LinkedIn] Web profile failed:', error);
    return null;
  }
}

function extractLinkedInIdentifier(url: string): string | null {
  const patterns = [
    /linkedin\.com\/company\/([^/?#]+)/i,
    /linkedin\.com\/in\/([^/?#]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ==================== GOOGLE BUSINESS SCRAPER ====================

async function scrapeGoogleBusiness(url: string): Promise<ScrapedData> {
  console.log(`[Google Business] Scraping: ${url}`);

  let data = await tryGoogleMapsPage(url);

  if (data) {
    return {
      title: data.name || 'Business',
      description: data.description || '',
      logo: data.photo,
      heroImage: data.photo,
      primaryColor: '#4285F4', // Google blue
      secondaryColor: '#34A853', // Google green
      businessType: detectBusinessTypeFromCategory(data.category),
      phone: data.phone,
      email: null,
      address: data.address,
      socialLinks: {
        website: data.website,
      },
      products: [],
      services: [],
      openingHours: data.hours,
      features: [],
      testimonials: data.reviews || [],
      galleryImages: data.photos || [],
      sourceType: 'google_business',
      scrapedAt: new Date().toISOString(),
      confidence: data.name ? 'high' : 'medium',
    };
  }

  return getDefaultScrapedData('google_business', 'low');
}

async function tryGoogleMapsPage(url: string): Promise<any | null> {
  try {
    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract from meta tags
    const name = extractMetaContent(html, 'og:title')?.replace(/\s*-\s*Google Maps.*$/i, '').trim();
    const description = extractMetaContent(html, 'og:description');
    const image = extractMetaContent(html, 'og:image');

    return {
      name,
      description,
      photo: image,
      category: null,
      phone: null,
      address: description?.split('·')?.[0]?.trim(),
      website: null,
    };
  } catch (error) {
    console.log('[Google Business] Failed:', error);
    return null;
  }
}

// ==================== WEBSITE SCRAPER ====================

interface PageContent {
  url: string;
  type: 'home' | 'services' | 'about' | 'portfolio' | 'gallery' | 'testimonials' | 'contact' | 'team' | 'pricing' | 'other';
  title: string;
  content: string;
  images: string[];
  services?: string[];
  testimonials?: { name: string; text: string; rating?: number }[];
  teamMembers?: { name: string; role: string; image?: string; bio?: string }[];
  portfolioItems?: { title: string; description?: string; image: string; category?: string }[];
}

interface MultiPageScrapedData extends ScrapedData {
  pages: PageContent[];
  portfolioItems: { title: string; description?: string; image: string; category?: string }[];
  teamMembers: { name: string; role: string; image?: string; bio?: string }[];
  aboutContent: string;
  pricingInfo: { name: string; price: string; features: string[] }[];
}

async function scrapeWebsite(url: string): Promise<ScrapedData> {
  console.log(`[Website] Scraping: ${url}`);

  try {
    const baseUrl = new URL(url).origin;

    // Fetch main page
    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.log(`[Website] Failed to fetch: ${response.status}`);
      return getDefaultScrapedData('website', 'low');
    }

    const html = await response.text();

    // Parse the main page
    const data = parseWebsiteHTML(html, baseUrl, url);

    // Extract navigation links to crawl additional pages
    const navLinks = extractNavigationLinks(html, baseUrl);
    console.log(`[Website] Found ${navLinks.length} navigation links to crawl`);

    // Crawl additional pages for comprehensive extraction
    const additionalData = await crawlAdditionalPages(navLinks, baseUrl, data);
    
    // Merge additional data into main data
    if (additionalData.services.length > data.services.length) {
      data.services = additionalData.services;
    }
    if (additionalData.testimonials.length > data.testimonials.length) {
      data.testimonials = additionalData.testimonials;
    }
    if (additionalData.galleryImages.length > data.galleryImages.length) {
      data.galleryImages = [...new Set([...data.galleryImages, ...additionalData.galleryImages])];
    }
    if (additionalData.features.length > data.features.length) {
      data.features = additionalData.features;
    }
    // Add portfolio items to gallery if found
    if (additionalData.portfolioItems && additionalData.portfolioItems.length > 0) {
      const portfolioImages = additionalData.portfolioItems.map(p => p.image).filter(Boolean);
      data.galleryImages = [...new Set([...data.galleryImages, ...portfolioImages])];
    }
    // Use about content for description if better
    if (additionalData.aboutContent && additionalData.aboutContent.length > (data.description?.length || 0)) {
      data.description = additionalData.aboutContent;
    }
    // Store additional metadata
    (data as any).portfolioItems = additionalData.portfolioItems || [];
    (data as any).teamMembers = additionalData.teamMembers || [];
    (data as any).pricingInfo = additionalData.pricingInfo || [];
    (data as any).aboutContent = additionalData.aboutContent || '';
    (data as any).pages = additionalData.pages || [];

    // Try to fetch additional pages for products if e-commerce
    if (data.businessType === 'ecommerce' && data.products.length === 0) {
      const products = await fetchProductsFromCommonPaths(baseUrl);
      data.products = products;
    }

    data.confidence = data.title && data.title !== 'My Business' ? 'high' : 'medium';
    return data;

  } catch (error) {
    console.error('[Website] Error:', error);
    return getDefaultScrapedData('website', 'low');
  }
}

// Extract navigation links from the page
function extractNavigationLinks(html: string, baseUrl: string): { url: string; text: string; type: PageContent['type'] }[] {
  const links: { url: string; text: string; type: PageContent['type'] }[] = [];
  const seenUrls = new Set<string>();

  // First, find all anchor tags with hrefs
  const anchorPattern = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  
  while ((match = anchorPattern.exec(html)) !== null) {
    let href = match[1].trim();
    if (!href || href === '/' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    
    // Extract text content by removing all HTML tags
    let text = match[2]
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    
    // If no text, try to get it from aria-label or title
    if (!text || text.length < 2) {
      const ariaMatch = match[0].match(/aria-label=["']([^"']+)["']/i);
      const titleMatch = match[0].match(/title=["']([^"']+)["']/i);
      text = (ariaMatch?.[1] || titleMatch?.[1] || '').toLowerCase().trim();
    }
    
    if (!text || text.length < 2) continue;

    // Skip unwanted links (cart, checkout, login, etc.)
    if (shouldSkipLink(href, text)) continue;

    // Resolve relative URLs
    if (!href.startsWith('http')) {
      try {
        href = new URL(href, baseUrl).href;
      } catch {
        continue;
      }
    }

    // Only include links from the same domain
    try {
      const linkUrl = new URL(href);
      const baseUrlObj = new URL(baseUrl);
      if (linkUrl.hostname !== baseUrlObj.hostname) continue;
      // Normalize the URL
      href = `${linkUrl.origin}${linkUrl.pathname}`;
    } catch {
      continue;
    }

    if (seenUrls.has(href)) continue;
    seenUrls.add(href);

    const pageType = detectPageType(href, text);
    // Prioritize pages with known types, but also include some 'other' pages
    if (pageType !== 'other') {
      links.push({ url: href, text, type: pageType });
    } else if (links.filter(l => l.type === 'other').length < 5) {
      links.push({ url: href, text, type: pageType });
    }
  }

  // Sort by priority (important pages first)
  const priority: Record<PageContent['type'], number> = {
    services: 1,
    about: 2,
    portfolio: 3,
    gallery: 4,
    testimonials: 5,
    contact: 6,
    team: 7,
    pricing: 8,
    home: 9,
    other: 10,
  };
  links.sort((a, b) => priority[a.type] - priority[b.type]);

  console.log(`[Website] Extracted ${links.length} navigation links: ${links.map(l => l.type).join(', ')}`);
  return links.slice(0, 8); // Limit to 8 pages to avoid over-crawling
}

// Check if a link should be skipped (cart, checkout, login, etc.)
function shouldSkipLink(href: string, text: string): boolean {
  const skipPatterns = [
    /cart/i, /checkout/i, /basket/i, /bag/i,
    /login/i, /signin/i, /sign-in/i, /logout/i, /signout/i,
    /register/i, /signup/i, /sign-up/i,
    /account/i, /my-account/i, /profile/i,
    /admin/i, /dashboard/i, /wp-admin/i,
    /search/i, /\?s=/i,
    /privacy/i, /terms/i, /cookie/i, /gdpr/i,
    /sitemap/i, /rss/i, /feed/i,
    /javascript:/i, /mailto:/i, /tel:/i,
    /#$/,
  ];

  return skipPatterns.some(pattern => pattern.test(href) || pattern.test(text));
}

// Detect the type of page based on URL and link text
function detectPageType(url: string, text: string): PageContent['type'] {
  const combined = `${url} ${text}`.toLowerCase();

  if (/home|^\/$/i.test(combined)) return 'home';
  if (/service|what-we-do|offerings|garden-design|landscaping|planting/i.test(combined)) return 'services';
  if (/about|who-we-are|our-story|company/i.test(combined)) return 'about';
  if (/portfolio|projects|work|case-stud|gardens/i.test(combined)) return 'portfolio';
  if (/gallery|photos|images|showcase/i.test(combined)) return 'gallery';
  if (/testimonial|review|feedback|client/i.test(combined)) return 'testimonials';
  if (/contact|get-in-touch|reach-us/i.test(combined)) return 'contact';
  if (/team|staff|people|our-team/i.test(combined)) return 'team';
  if (/pricing|price|cost|plans|packages/i.test(combined)) return 'pricing';

  return 'other';
}

// Crawl additional pages and extract content
async function crawlAdditionalPages(
  links: { url: string; text: string; type: PageContent['type'] }[],
  baseUrl: string,
  mainData: ScrapedData
): Promise<{
  services: string[];
  testimonials: { name: string; text: string; rating?: number }[];
  galleryImages: string[];
  features: string[];
  portfolioItems: { title: string; description?: string; image: string; category?: string }[];
  teamMembers: { name: string; role: string; image?: string; bio?: string }[];
  aboutContent: string;
  pricingInfo: { name: string; price: string; features: string[] }[];
  pages: PageContent[];
}> {
  const result = {
    services: [] as string[],
    testimonials: [] as { name: string; text: string; rating?: number }[],
    galleryImages: [] as string[],
    features: [] as string[],
    portfolioItems: [] as { title: string; description?: string; image: string; category?: string }[],
    teamMembers: [] as { name: string; role: string; image?: string; bio?: string }[],
    aboutContent: '',
    pricingInfo: [] as { name: string; price: string; features: string[] }[],
    pages: [] as PageContent[],
  };

  // Crawl each page with a delay to be respectful
  for (const link of links) {
    try {
      console.log(`[Website] Crawling ${link.type} page: ${link.url}`);
      
      const response = await fetchWithRetry(link.url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const pageContent = extractPageContent(html, link, baseUrl);
      result.pages.push(pageContent);

      // Extract type-specific content
      switch (link.type) {
        case 'services':
          const services = extractServicesFromPage(html);
          result.services.push(...services);
          break;

        case 'testimonials':
          const testimonials = extractTestimonialsFromPage(html);
          result.testimonials.push(...testimonials);
          break;

        case 'portfolio':
        case 'gallery':
          const portfolio = extractPortfolioFromPage(html, baseUrl);
          result.portfolioItems.push(...portfolio.items);
          result.galleryImages.push(...portfolio.images);
          break;

        case 'about':
          result.aboutContent = extractAboutContent(html);
          break;

        case 'team':
          const team = extractTeamMembers(html, baseUrl);
          result.teamMembers.push(...team);
          break;

        case 'pricing':
          const pricing = extractPricingInfo(html);
          result.pricingInfo.push(...pricing);
          break;

        case 'contact':
          // Contact info is usually on the main page already
          break;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.log(`[Website] Error crawling ${link.url}:`, error);
    }
  }

  // Deduplicate
  result.services = [...new Set(result.services)];
  result.galleryImages = [...new Set(result.galleryImages)];

  return result;
}

// Extract content from a specific page
function extractPageContent(html: string, link: { url: string; text: string; type: PageContent['type'] }, baseUrl: string): PageContent {
  const title = extractTitle(html);
  
  // Extract main content (remove nav, footer, sidebar)
  let content = html
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2000);

  // Extract images
  const images: string[] = [];
  const imgMatches = html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/gi);
  for (const match of imgMatches) {
    const src = resolveUrl(match[1], baseUrl);
    if (!src.includes('icon') && !src.includes('logo') && !src.includes('pixel')) {
      images.push(src);
    }
  }

  return {
    url: link.url,
    type: link.type,
    title,
    content,
    images: images.slice(0, 20),
  };
}

// Extract services from a services page
function extractServicesFromPage(html: string): string[] {
  const services: string[] = [];

  // Look for service items in various formats
  const patterns = [
    /<h[2-4][^>]*>([^<]{3,80})<\/h[2-4]>/gi,
    /<div[^>]*class="[^"]*service[^"]*"[^>]*>[\s\S]*?<(?:h[2-6]|strong|b)[^>]*>([^<]+)</gi,
    /<li[^>]*class="[^"]*service[^"]*"[^>]*>([^<]+)</gi,
    /<span[^>]*class="[^"]*service-title[^"]*"[^>]*>([^<]+)</gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && services.length < 15) {
      const service = decodeHTMLEntities(match[1]).trim();
      if (service.length > 3 && service.length < 80 && !services.includes(service)) {
        // Filter out navigation items and generic text
        if (!/^(home|about|contact|services|portfolio|gallery|menu|navigation)/i.test(service)) {
          services.push(service);
        }
      }
    }
  }

  return services;
}

// Extract testimonials from a testimonials page
function extractTestimonialsFromPage(html: string): { name: string; text: string; rating?: number }[] {
  const testimonials: { name: string; text: string; rating?: number }[] = [];

  // Look for testimonial blocks
  const blockPatterns = [
    /<div[^>]*class="[^"]*(?:testimonial|review|feedback)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    /<article[^>]*class="[^"]*(?:testimonial|review)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
    /<td[^>]*>([\s\S]*?)<\/td>/gi, // Table-based testimonials (common on some sites)
  ];

  for (const pattern of blockPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && testimonials.length < 10) {
      const block = match[1];
      
      // Skip very short blocks (likely navigation/formatting cells)
      const plainText = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (plainText.length < 50) continue;

      // Extract quote text - try multiple patterns
      let text = '';
      const textMatch = block.match(/<p[^>]*>([^<]+)<\/p>|<q[^>]*>([^<]+)<\/q>|"([^"]+)"/i);
      if (textMatch) {
        text = (textMatch[1] || textMatch[2] || textMatch[3])?.trim() || '';
      }
      
      // If no match, use the full plain text content (excluding the name at the end)
      if (!text && plainText.length > 50) {
        text = plainText;
      }
      
      // Extract name - try multiple patterns
      const nameMatch = block.match(/<(?:cite|strong|span)[^>]*class="[^"]*(?:name|author|client)[^"]*"[^>]*>([^<]+)</i) ||
                       block.match(/<(?:cite|strong|b)[^>]*>([^<]+)</i) ||
                       block.match(/[-–—]\s*([A-Z][a-z]+(?:\s+(?:&\s+)?[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+)?)/m) ||
                       // Name at end of text (common: "...text. Sarah & Jim Russell")
                       plainText.match(/([A-Z][a-z]+(?:\s+(?:&\s+)?[A-Z][a-z]+)+)\s*$/);
      let name = nameMatch ? decodeHTMLEntities(nameMatch[1]).trim() : 'Client';
      
      // Clean the name from the text if it appears at the end
      if (name !== 'Client' && text.endsWith(name)) {
        text = text.slice(0, -name.length).trim();
      }

      // Extract rating (stars)
      const ratingMatch = block.match(/(\d)(?:\s*\/\s*5|\s*stars?)/i) ||
                         block.match(/★{1,5}/);
      const rating = ratingMatch ? (ratingMatch[1] ? parseInt(ratingMatch[1]) : ratingMatch[0].length) : undefined;

      // Clean up text
      text = text.replace(/^\s*["'"']\s*/, '').replace(/\s*["'"']\s*$/, '').trim();

      if (text && text.length > 30 && !testimonials.some(t => t.text === text)) {
        testimonials.push({ name, text: text.substring(0, 500), rating });
      }
    }
  }

  return testimonials;
}

// Extract portfolio items from portfolio/gallery page
function extractPortfolioFromPage(html: string, baseUrl: string): { items: { title: string; description?: string; image: string; category?: string }[]; images: string[] } {
  const items: { title: string; description?: string; image: string; category?: string }[] = [];
  const images: string[] = [];

  // Look for portfolio/gallery items with various structures
  const blockPatterns = [
    /<div[^>]*class="[^"]*(?:portfolio|gallery|project|work)[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<article[^>]*class="[^"]*(?:portfolio|gallery|project)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
    /<figure[^>]*>([\s\S]*?)<\/figure>/gi,
    /<li[^>]*class="[^"]*(?:portfolio|gallery|project)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    /<section[^>]*>([\s\S]*?)<\/section>/gi, // Section-based portfolios
  ];

  for (const pattern of blockPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && items.length < 20) {
      const block = match[1];
      
      // Extract image - try multiple patterns
      const imgMatch = block.match(/<img[^>]*src="([^"]+)"/i) ||
                       block.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
      
      // Extract title from h1, h2, h3, h4, etc.
      const titleMatch = block.match(/<h[1-6][^>]*>([^<]+)</i) ||
                        block.match(/alt="([^"]+)"/i) ||
                        block.match(/<(?:figcaption|caption)[^>]*>([^<]+)</i);
      const title = titleMatch ? decodeHTMLEntities(titleMatch[1]).trim() : '';

      // Skip if this looks like a navigation or header section
      if (!title || /^(home|about|contact|services|portfolio|gallery|menu|testimonials)$/i.test(title)) continue;

      // Extract description (look for paragraphs or h3 subtitles)
      const descMatch = block.match(/<p[^>]*>([^<]+)<\/p>/i) ||
                       block.match(/<h3[^>]*>([^<]+)<\/h3>/i);
      const description = descMatch ? decodeHTMLEntities(descMatch[1]).trim() : undefined;

      // Extract category
      const catMatch = block.match(/class="[^"]*cat[^"]*"[^>]*>([^<]+)</i) ||
                      block.match(/data-category="([^"]+)"/i);
      const category = catMatch ? decodeHTMLEntities(catMatch[1]).trim() : undefined;

      // Get image URL if found
      const image = imgMatch ? resolveUrl(imgMatch[1], baseUrl) : '';
      
      // Only add if we have meaningful content
      if (title && (image || description)) {
        // Avoid duplicates
        if (!items.some(i => i.title === title)) {
          items.push({ title, description, image, category });
          if (image) images.push(image);
        }
      }
    }
  }

  // Also extract h1/h2 + paragraph pairs (common portfolio format)
  const headingPattern = /<h[12][^>]*>([^<]+)<\/h[12]>[\s\S]*?(?:<h3[^>]*>([^<]+)<\/h3>)?[\s\S]*?(?:<p[^>]*>([^<]+)<\/p>)?/gi;
  let headingMatch;
  while ((headingMatch = headingPattern.exec(html)) !== null && items.length < 20) {
    const title = decodeHTMLEntities(headingMatch[1]).trim();
    const subtitle = headingMatch[2] ? decodeHTMLEntities(headingMatch[2]).trim() : undefined;
    const desc = headingMatch[3] ? decodeHTMLEntities(headingMatch[3]).trim() : undefined;
    
    // Skip navigation items
    if (/^(home|about|contact|services|portfolio|gallery|menu|testimonials|daisy rose)/i.test(title)) continue;
    
    if (title && (subtitle || desc) && !items.some(i => i.title === title)) {
      items.push({ 
        title, 
        description: desc || subtitle, 
        image: '', 
        category: subtitle && !desc ? subtitle : undefined 
      });
    }
  }

  // Also extract standalone gallery images
  const standaloneImgPattern = /<img[^>]*(?:class="[^"]*(?:gallery|portfolio)[^"]*"|data-[^>]*gallery)[^>]*src="([^"]+)"/gi;
  let imgMatch;
  while ((imgMatch = standaloneImgPattern.exec(html)) !== null) {
    const src = resolveUrl(imgMatch[1], baseUrl);
    if (!images.includes(src)) {
      images.push(src);
    }
  }

  return { items, images };
}

// Extract about content
function extractAboutContent(html: string): string {
  // Try to find the main about content
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*(?:about|content|main)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]*class="[^"]*about[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const content = match[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (content.length > 100) {
        return content.substring(0, 1500);
      }
    }
  }

  return '';
}

// Extract team members
function extractTeamMembers(html: string, baseUrl: string): { name: string; role: string; image?: string; bio?: string }[] {
  const members: { name: string; role: string; image?: string; bio?: string }[] = [];

  const blockPatterns = [
    /<div[^>]*class="[^"]*(?:team|staff|member|person)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<article[^>]*class="[^"]*(?:team|staff|member)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
  ];

  for (const pattern of blockPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && members.length < 12) {
      const block = match[1];
      
      // Extract name
      const nameMatch = block.match(/<h[2-6][^>]*>([^<]+)</i);
      if (!nameMatch) continue;
      const name = decodeHTMLEntities(nameMatch[1]).trim();

      // Extract role
      const roleMatch = block.match(/<(?:span|p)[^>]*class="[^"]*(?:role|title|position)[^"]*"[^>]*>([^<]+)</i) ||
                       block.match(/<(?:span|em|i)[^>]*>([^<]+)</i);
      const role = roleMatch ? decodeHTMLEntities(roleMatch[1]).trim() : '';

      // Extract image
      const imgMatch = block.match(/<img[^>]*src="([^"]+)"/i);
      const image = imgMatch ? resolveUrl(imgMatch[1], baseUrl) : undefined;

      // Extract bio
      const bioMatch = block.match(/<p[^>]*>([^<]+)<\/p>/i);
      const bio = bioMatch ? decodeHTMLEntities(bioMatch[1]).trim() : undefined;

      members.push({ name, role, image, bio });
    }
  }

  return members;
}

// Extract pricing info
function extractPricingInfo(html: string): { name: string; price: string; features: string[] }[] {
  const plans: { name: string; price: string; features: string[] }[] = [];

  const blockPatterns = [
    /<div[^>]*class="[^"]*(?:pricing|plan|package)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<article[^>]*class="[^"]*(?:pricing|plan)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
  ];

  for (const pattern of blockPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && plans.length < 6) {
      const block = match[1];
      
      // Extract plan name
      const nameMatch = block.match(/<h[2-6][^>]*>([^<]+)</i);
      if (!nameMatch) continue;
      const name = decodeHTMLEntities(nameMatch[1]).trim();

      // Extract price
      const priceMatch = block.match(/[$£€]\s*[\d,]+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*[$£€]/i) ||
                        block.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)</i);
      const price = priceMatch ? (priceMatch[1] || priceMatch[0]).trim() : '';

      // Extract features
      const features: string[] = [];
      const featureMatches = block.matchAll(/<li[^>]*>([^<]+)<\/li>/gi);
      for (const fm of featureMatches) {
        const feature = decodeHTMLEntities(fm[1]).trim();
        if (feature.length > 2 && feature.length < 100) {
          features.push(feature);
        }
      }

      if (name && (price || features.length > 0)) {
        plans.push({ name, price, features });
      }
    }
  }

  return plans;
}

function parseWebsiteHTML(html: string, baseUrl: string, fullUrl: string): ScrapedData {
  // Extract basic info
  const title = extractTitle(html);
  const description = extractDescription(html);
  const logo = extractLogo(html, baseUrl);
  const heroImage = extractHeroImage(html, baseUrl);
  const primaryColor = extractPrimaryColor(html);
  const businessType = detectWebsiteBusinessType(html, fullUrl);

  // Extract contact info
  const phone = extractPhone(html);
  const email = extractEmail(html);
  const address = extractAddress(html);

  // Extract social links
  const socialLinks = extractSocialLinks(html);

  // Extract products/services
  const products = extractProducts(html, baseUrl);
  const services = extractServices(html);

  // Extract additional content
  const features = extractFeatures(html);
  const testimonials = extractTestimonials(html);
  const galleryImages = extractGalleryImages(html, baseUrl);
  const openingHours = extractOpeningHours(html);

  return {
    title,
    description,
    logo,
    heroImage,
    primaryColor,
    secondaryColor: adjustColor(primaryColor),
    businessType,
    phone,
    email,
    address,
    socialLinks,
    products,
    services,
    openingHours,
    features,
    testimonials,
    galleryImages,
    sourceType: 'website',
    scrapedAt: new Date().toISOString(),
    confidence: 'medium',
  };
}

// ==================== EXTRACTION HELPERS ====================

function extractTitle(html: string): string {
  const patterns = [
    /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i,  // Site name first (most reliable)
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    /<title[^>]*>([^<]+)<\/title>/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      let title = decodeHTMLEntities(match[1]).trim();
      
      // Clean up common suffixes and patterns
      title = title
        // Remove domain suffixes
        .replace(/\s*\.com\s*$/i, '')
        .replace(/\s*\.co\.uk\s*$/i, '')
        .replace(/\s*\.net\s*$/i, '')
        .replace(/\s*\.org\s*$/i, '')
        // Remove common page suffixes
        .replace(/\s*[-|–—]\s*(Home|Official|Website|Shop|Store|Online|Welcome).*$/i, '')
        .replace(/\s*\|\s*.*$/i, '')
        .replace(/\s+-\s+.*$/i, '')
        .replace(/^\s*Home\s*[-|–—]\s*/i, '')
        .replace(/\s*[-|–—]\s*Home\s*$/i, '')
        .replace(/^Welcome to\s+/i, '')
        .replace(/\s+Home$/, '')
        // Remove taglines that follow brand name with period
        .replace(/\.\s+[A-Z][a-z].*$/, '')
        .trim();
        
      // If title still has multiple sentences/phrases, take the first one
      if (title.includes('. ')) {
        const firstPart = title.split('. ')[0].trim();
        if (firstPart.length >= 2) title = firstPart;
      }
      
      // If title is too long, it might have extra info - try to clean it
      if (title.length > 50) {
        const shorterTitle = title.split(/[-|–—]/)[0].trim();
        if (shorterTitle.length >= 2) title = shorterTitle;
      }
      
      if (title && title.length >= 2 && title.length <= 80) return title;
    }
  }
  return 'My Business';
}

function extractDescription(html: string): string {
  const patterns = [
    /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
    /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1].length > 20) {
      return decodeHTMLEntities(match[1]).trim();
    }
  }
  return '';
}

function extractLogo(html: string, baseUrl: string): string | null {
  const patterns = [
    /<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/i,
    /<link[^>]*rel="icon"[^>]*type="image\/png"[^>]*href="([^"]+)"/i,
    /<link[^>]*rel="icon"[^>]*href="([^"]+(?:\.png|\.jpg|\.svg))"/i,
    /<img[^>]*class="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*alt="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
    /src="([^"]+)"[^>]*class="[^"]*logo[^"]*"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return resolveUrl(match[1], baseUrl);
    }
  }
  return null;
}

function extractHeroImage(html: string, baseUrl: string): string | null {
  const patterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
    /<meta[^>]*property="og:image:secure_url"[^>]*content="([^"]+)"/i,
    /<img[^>]*class="[^"]*(?:hero|banner|featured)[^"]*"[^>]*src="([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const url = resolveUrl(match[1], baseUrl);
      if (!url.includes('favicon') && !url.includes('icon')) {
        return url;
      }
    }
  }
  return null;
}

function extractPrimaryColor(html: string): string {
  // Try theme-color meta tag
  const themeMatch = html.match(/<meta[^>]*name="theme-color"[^>]*content="([^"]+)"/i);
  if (themeMatch && isValidColor(themeMatch[1])) {
    return themeMatch[1];
  }

  // Try CSS variables
  const varPatterns = [
    /--primary[^:]*:\s*(#[0-9a-fA-F]{3,6})/i,
    /--brand[^:]*:\s*(#[0-9a-fA-F]{3,6})/i,
    /--accent[^:]*:\s*(#[0-9a-fA-F]{3,6})/i,
  ];

  for (const pattern of varPatterns) {
    const match = html.match(pattern);
    if (match && isValidColor(match[1])) {
      return match[1];
    }
  }

  return '#ec4899'; // Default pink
}

function extractPhone(html: string): string | null {
  const patterns = [
    /href="tel:([^"]+)"/i,
    /(?:phone|tel|call)[:\s]*([+]?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return cleanPhoneNumber(match[1]);
    }
  }
  return null;
}

function extractEmail(html: string): string | null {
  const patterns = [
    /href="mailto:([^"?]+)/i,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && !match[1].includes('example.com') && !match[1].includes('email.com')) {
      return match[1].toLowerCase();
    }
  }
  return null;
}

function extractAddress(html: string): string | null {
  // Try structured data first
  const ldJsonMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi);
  for (const match of ldJsonMatches) {
    try {
      const data = JSON.parse(match[1]);
      const address = data.address || data.location?.address;
      if (address) {
        if (typeof address === 'string') return address;
        if (address.streetAddress) {
          return [address.streetAddress, address.addressLocality, address.addressRegion, address.postalCode]
            .filter(Boolean).join(', ');
        }
      }
    } catch {}
  }

  // Try common patterns
  const addressPattern = /(\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[,\s]+[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5})/i;
  const match = html.match(addressPattern);
  return match ? match[1].trim() : null;
}

function extractSocialLinks(html: string): SocialLinks {
  const links: SocialLinks = {};

  const patterns: [keyof SocialLinks, RegExp][] = [
    ['instagram', /href="(https?:\/\/(?:www\.)?instagram\.com\/[^"]+)"/i],
    ['facebook', /href="(https?:\/\/(?:www\.)?facebook\.com\/[^"]+)"/i],
    ['twitter', /href="(https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"]+)"/i],
    ['linkedin', /href="(https?:\/\/(?:www\.)?linkedin\.com\/[^"]+)"/i],
    ['youtube', /href="(https?:\/\/(?:www\.)?youtube\.com\/[^"]+)"/i],
    ['tiktok', /href="(https?:\/\/(?:www\.)?tiktok\.com\/[^"]+)"/i],
  ];

  for (const [platform, pattern] of patterns) {
    const match = html.match(pattern);
    if (match) {
      links[platform] = match[1];
    }
  }

  return links;
}

function extractProducts(html: string, baseUrl: string): ProductData[] {
  const products: ProductData[] = [];

  // Try JSON-LD first
  const ldJsonMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi);
  for (const match of ldJsonMatches) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'Product' || (Array.isArray(data['@graph']) && data['@graph'].some((item: any) => item['@type'] === 'Product'))) {
        const productItems = data['@type'] === 'Product' ? [data] : data['@graph'].filter((item: any) => item['@type'] === 'Product');
        for (const product of productItems) {
          products.push({
            name: product.name,
            description: product.description,
            price: parseFloat(product.offers?.price) || undefined,
            image: product.image?.[0] || product.image,
          });
        }
      }
    } catch {}
  }

  // Try common product patterns in HTML
  if (products.length === 0) {
    const productPatterns = [
      /<div[^>]*class="[^"]*product[^"]*"[^>]*>.*?<(?:h[1-6]|a|span)[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>([^<]+)<.*?<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)</gi,
      /data-product-title="([^"]+)"[^>]*data-product-price="([^"]+)"/gi,
    ];

    for (const pattern of productPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && products.length < 12) {
        products.push({
          name: decodeHTMLEntities(match[1]),
          price: parsePrice(match[2]),
        });
      }
    }
  }

  return products.slice(0, 12);
}

function extractServices(html: string): string[] {
  const services: string[] = [];
  
  // Common navigation/irrelevant text to filter out
  const filterOut = /^(home|about|contact|services|portfolio|gallery|menu|navigation|search|login|signup|register|cart|shop|store|blog|news|faq|help|privacy|terms|sitemap|facebook|twitter|instagram|linkedin|youtube|tiktok|email|phone|call|address|copyright|©|all rights|loading|read more|learn more|click here|submit|send|subscribe|download|sign up|log in|get started|view more|see more|show more)$/i;

  // Look for services section first
  const servicesMatch = html.match(/<(?:section|div)[^>]*(?:id|class)="[^"]*services?[^"]*"[^>]*>([\s\S]*?)<\/(?:section|div)>/i);
  if (servicesMatch) {
    // Try li items first
    const listItems = servicesMatch[1].match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
    for (const item of listItems) {
      const text = item.replace(/<[^>]+>/g, '').trim();
      if (text.length > 3 && text.length < 100 && !filterOut.test(text)) {
        services.push(text);
      }
    }
    // Also try h3/h4 within services section
    if (services.length === 0) {
      const headings = servicesMatch[1].match(/<h[34][^>]*>([^<]{3,80})<\/h[34]>/gi) || [];
      for (const heading of headings) {
        const text = heading.replace(/<[^>]+>/g, '').trim();
        if (text.length > 3 && text.length < 80 && !filterOut.test(text)) {
          services.push(text);
        }
      }
    }
  }

  // If no services found, try looking for common service patterns
  if (services.length === 0) {
    // Look for service/feature cards with headings
    const cardPatterns = [
      /<div[^>]*class="[^"]*(?:service|card|feature|offering)[^"]*"[^>]*>[\s\S]*?<h[2-4][^>]*>([^<]+)</gi,
      /<article[^>]*>[\s\S]*?<h[2-4][^>]*>([^<]+)</gi,
    ];
    
    for (const pattern of cardPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && services.length < 8) {
        const text = decodeHTMLEntities(match[1]).trim();
        if (text.length > 3 && text.length < 80 && !filterOut.test(text)) {
          services.push(text);
        }
      }
      if (services.length > 0) break;
    }
  }

  // Last resort: look for h3/h4 in main content (not nav)
  if (services.length === 0) {
    // Remove nav/header/footer content first
    const mainContent = html
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    
    const headings = mainContent.match(/<h[34][^>]*>([^<]{5,60})<\/h[34]>/gi) || [];
    for (const heading of headings.slice(0, 15)) {
      const text = heading.replace(/<[^>]+>/g, '').trim();
      if (text.length > 5 && text.length < 60 && !filterOut.test(text)) {
        services.push(text);
      }
      if (services.length >= 8) break;
    }
  }

  return [...new Set(services)].slice(0, 8);
}

function extractFeatures(html: string): string[] {
  const features: string[] = [];

  // Look for features/benefits sections
  const featurePatterns = [
    /<(?:li|div)[^>]*class="[^"]*(?:feature|benefit)[^"]*"[^>]*>([^<]+)</gi,
    /(?:✓|✔|★|●)\s*([^<\n]{5,60})/gi,
  ];

  for (const pattern of featurePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && features.length < 8) {
      const text = decodeHTMLEntities(match[1]).trim();
      if (text.length > 5 && text.length < 60) {
        features.push(text);
      }
    }
  }

  return [...new Set(features)];
}

function extractTestimonials(html: string): { name: string; text: string; rating?: number }[] {
  const testimonials: { name: string; text: string; rating?: number }[] = [];

  // Try structured data
  const ldJsonMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi);
  for (const match of ldJsonMatches) {
    try {
      const data = JSON.parse(match[1]);
      const reviews = data.review || data.aggregateRating?.reviews || [];
      for (const review of (Array.isArray(reviews) ? reviews : [reviews])) {
        if (review.author && review.reviewBody) {
          testimonials.push({
            name: typeof review.author === 'string' ? review.author : review.author.name,
            text: review.reviewBody,
            rating: review.reviewRating?.ratingValue,
          });
        }
      }
    } catch {}
  }

  return testimonials.slice(0, 6);
}

function extractGalleryImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];

  // Find images in gallery/portfolio sections
  const galleryMatch = html.match(/<(?:section|div)[^>]*(?:id|class)="[^"]*(?:gallery|portfolio|photos|images)[^"]*"[^>]*>([\s\S]*?)<\/(?:section|div)>/i);
  if (galleryMatch) {
    const imgMatches = galleryMatch[1].matchAll(/src="([^"]+(?:\.jpg|\.jpeg|\.png|\.webp)[^"]*)"/gi);
    for (const match of imgMatches) {
      const url = resolveUrl(match[1], baseUrl);
      if (!url.includes('icon') && !url.includes('logo')) {
        images.push(url);
      }
    }
  }

  return [...new Set(images)].slice(0, 12);
}

function extractOpeningHours(html: string): Record<string, string> | null {
  // Try structured data
  const ldJsonMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi);
  for (const match of ldJsonMatches) {
    try {
      const data = JSON.parse(match[1]);
      if (data.openingHours || data.openingHoursSpecification) {
        const hours: Record<string, string> = {};
        const specs = data.openingHoursSpecification || [];
        for (const spec of specs) {
          const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
          for (const day of days) {
            const dayName = day.replace('http://schema.org/', '').substring(0, 3);
            hours[dayName] = `${spec.opens} - ${spec.closes}`;
          }
        }
        if (Object.keys(hours).length > 0) return hours;
      }
    } catch {}
  }
  return null;
}

// ==================== UTILITY FUNCTIONS ====================

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

async function fetchProductsFromCommonPaths(baseUrl: string): Promise<ProductData[]> {
  const paths = ['/products', '/shop', '/store', '/collections/all', '/catalog'];
  
  for (const path of paths) {
    try {
      const response = await fetchWithRetry(`${baseUrl}${path}`, {
        headers: { 'User-Agent': getRandomUserAgent() },
      });
      
      if (response.ok) {
        const html = await response.text();
        const products = extractProducts(html, baseUrl);
        if (products.length > 0) return products;
      }
    } catch {
      continue;
    }
  }
  
  return [];
}

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]+)"`, 'i'),
    new RegExp(`<meta[^>]*name="${property}"[^>]*content="([^"]+)"`, 'i'),
    new RegExp(`<meta[^>]*content="([^"]+)"[^>]*property="${property}"`, 'i'),
    new RegExp(`<meta[^>]*content="([^"]+)"[^>]*name="${property}"`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHTMLEntities(match[1]);
  }
  return null;
}

function extractFromMetaTags(html: string, username: string): any {
  let title = extractMetaContent(html, 'og:title') || '';
  let description = extractMetaContent(html, 'og:description') || '';
  const image = extractMetaContent(html, 'og:image');

  // Clean Instagram title format: "Name (@username) • Instagram photos and videos"
  // or "Name (@username) on Instagram: Bio"
  title = title
    .replace(/\s*\(@[^)]+\)\s*(•|on Instagram).*$/i, '')
    .replace(/\s*•\s*Instagram.*$/i, '')
    .replace(/\s+on\s+Instagram.*$/i, '')
    .trim();

  // Parse Instagram description format: "X Followers, Y Following, Z Posts - Bio"
  const statsMatch = description?.match(/([\d,.]+[KMB]?)\s*Followers.*?([\d,.]+[KMB]?)\s*Following.*?([\d,.]+[KMB]?)\s*Posts/i);
  
  // Extract bio from description
  // Format is typically: "298M Followers, 243 Following, 1,672 Posts - [actual bio or generic text]"
  let bio = '';
  if (description) {
    // Try to extract bio from "X Posts - Bio text" format
    const bioMatch = description.match(/Posts\s*[-–—]\s*(.+)$/i);
    if (bioMatch && bioMatch[1]) {
      const potentialBio = bioMatch[1].trim();
      // Check if this is just the generic Instagram message
      if (!potentialBio.toLowerCase().startsWith('see instagram photos')) {
        bio = potentialBio;
      }
    }
  }

  return {
    username,
    fullName: title || username,
    biography: bio,
    profilePicUrl: image,
    followersCount: statsMatch ? parseCount(statsMatch[1]) : 0,
    posts: [],
  };
}

function extractPostsFromEdges(edges: any[]): any[] {
  return edges.slice(0, 12).map(edge => {
    const node = edge.node;
    return {
      id: node.id,
      imageUrl: node.display_url || node.thumbnail_src,
      caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      likes: node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
    };
  });
}

function detectWebsiteBusinessType(html: string, url: string): ScrapedData['businessType'] {
  const lowerHtml = html.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Score-based detection for more accurate results
  const typeScores: Record<ScrapedData['businessType'], number> = {
    'ecommerce': 0, 'restaurant': 0, 'service': 0, 'portfolio': 0,
    'agency': 0, 'healthcare': 0, 'fitness': 0, 'beauty': 0,
    'realestate': 0, 'education': 0, 'other': 0,
  };

  // E-commerce indicators (strong - need clear shopping signals)
  const ecommerceStrong = ['add to cart', 'add-to-cart', 'buy now', 'shop now', 'shopify', 'woocommerce', 'product-price', 'shopping cart', 'checkout', 'your cart', 'add to bag', 'view cart'];
  for (const kw of ecommerceStrong) {
    if (lowerHtml.includes(kw)) typeScores['ecommerce'] += 4;
  }
  // Medium ecommerce signals
  const ecommerceMedium = ['shop iphone', 'shop mac', 'shop ipad', 'shop all', 'free shipping', 'order now', 'price:', '$ ', 'usd', 'in stock', 'out of stock'];
  for (const kw of ecommerceMedium) {
    if (lowerHtml.includes(kw)) typeScores['ecommerce'] += 2;
  }

  // Restaurant indicators (need food-related signals, not just "menu")
  const restaurantStrong = ['food menu', 'our menu', 'dinner menu', 'lunch menu', 'breakfast menu', 'book a table', 'order food', 'dine with us'];
  for (const kw of restaurantStrong) {
    if (lowerHtml.includes(kw)) typeScores['restaurant'] += 4;
  }
  const restaurantMedium = ['reservation', 'cuisine', 'chef', 'restaurant', 'appetizer', 'entree', 'dessert menu'];
  for (const kw of restaurantMedium) {
    if (lowerHtml.includes(kw)) typeScores['restaurant'] += 2;
  }

  // Healthcare indicators
  const healthcareKeywords = ['doctor', 'medical clinic', 'patient care', 'healthcare provider', 'dentist', 'dental care', 'therapy', 'physician', 'hospital', 'health center', 'medical center'];
  for (const kw of healthcareKeywords) {
    if (lowerHtml.includes(kw)) typeScores['healthcare'] += 2;
  }

  // Fitness indicators
  const fitnessKeywords = ['gym membership', 'fitness center', 'personal training', 'fitness class', 'personal trainer', 'crossfit', 'yoga studio', 'workout class', 'gym near'];
  for (const kw of fitnessKeywords) {
    if (lowerHtml.includes(kw)) typeScores['fitness'] += 2;
  }

  // Beauty/spa indicators (need strong signals)
  const beautyKeywords = ['hair salon', 'beauty salon', 'spa services', 'nail salon', 'massage therapy', 'skincare treatment', 'beauty treatment', 'manicure', 'pedicure', 'hair styling'];
  for (const kw of beautyKeywords) {
    if (lowerHtml.includes(kw)) typeScores['beauty'] += 2;
  }

  // Real estate indicators
  const realestateKeywords = ['property listing', 'real estate', 'homes for sale', 'realtor', 'mortgage rate', 'buy a home', 'sell your home', 'mls listing'];
  for (const kw of realestateKeywords) {
    if (lowerHtml.includes(kw)) typeScores['realestate'] += 2;
  }

  // Agency indicators
  const agencyKeywords = ['digital agency', 'marketing agency', 'creative studio', 'web design agency', 'branding services', 'our clients', 'case study', 'creative agency'];
  for (const kw of agencyKeywords) {
    if (lowerHtml.includes(kw)) typeScores['agency'] += 2;
  }

  // Education indicators
  const educationKeywords = ['online course', 'course enrollment', 'training program', 'certificate program', 'tutoring service', 'online school', 'learn online', 'video lessons', 'enroll now'];
  for (const kw of educationKeywords) {
    if (lowerHtml.includes(kw)) typeScores['education'] += 2;
  }

  // Portfolio indicators
  const portfolioKeywords = ['my portfolio', 'my work', 'my projects', 'freelance', 'hire me', 'case studies', 'recent work'];
  for (const kw of portfolioKeywords) {
    if (lowerHtml.includes(kw)) typeScores['portfolio'] += 2;
  }

  // Service business indicators (landscaping, plumbing, etc.)
  const serviceKeywords = ['garden design', 'landscaping service', 'lawn care', 'plumbing service', 'electrical service', 'roofing service', 'cleaning service', 'painting service', 'repair service', 'installation service', 'free quote', 'get a quote', 'request quote', 'service area', 'call us today'];
  for (const kw of serviceKeywords) {
    if (lowerHtml.includes(kw)) typeScores['service'] += 2;
  }

  // URL-based hints (weaker signals)
  if (/shop|store|buy/i.test(lowerUrl)) typeScores['ecommerce'] += 2;
  if (/restaurant|cafe|food|dine/i.test(lowerUrl)) typeScores['restaurant'] += 2;
  if (/garden|landscape|lawn|plumb|roof|cleaning/i.test(lowerUrl)) typeScores['service'] += 3;

  // Find the highest scoring type (require minimum score of 2)
  let maxScore = 0;
  let detectedType: ScrapedData['businessType'] = 'service';
  
  for (const [type, score] of Object.entries(typeScores)) {
    if (score > maxScore && score >= 2) {
      maxScore = score;
      detectedType = type as ScrapedData['businessType'];
    }
  }

  return detectedType;
}

function detectBusinessTypeFromBio(bio: string = '', category: string = ''): ScrapedData['businessType'] {
  const combined = `${bio} ${category}`.toLowerCase();

  if (/shop|store|retail|fashion|clothing|jewelry/i.test(combined)) return 'ecommerce';
  if (/restaurant|food|chef|cuisine|dining|bakery|cafe/i.test(combined)) return 'restaurant';
  if (/doctor|clinic|medical|health|dental|therapy/i.test(combined)) return 'healthcare';
  if (/gym|fitness|workout|trainer|yoga|crossfit/i.test(combined)) return 'fitness';
  if (/salon|spa|beauty|hair|makeup|skincare/i.test(combined)) return 'beauty';
  if (/real estate|realtor|property|homes/i.test(combined)) return 'realestate';
  if (/agency|studio|creative|marketing|design/i.test(combined)) return 'agency';

  return 'service';
}

function detectBusinessTypeFromCategory(category: string = ''): ScrapedData['businessType'] {
  return detectBusinessTypeFromBio('', category);
}

function extractServicesFromBio(bio: string = ''): string[] {
  const services: string[] = [];
  
  // Look for service keywords
  const servicePatterns = [
    /(?:we offer|services?|specializing in|expertise in)[:\s]*([^.!?]+)/gi,
    /(?:•|▪|→|►)\s*([^•▪→►\n]+)/g,
  ];

  for (const pattern of servicePatterns) {
    let match;
    while ((match = pattern.exec(bio)) !== null) {
      const service = match[1].trim();
      if (service.length > 3 && service.length < 50) {
        services.push(service);
      }
    }
  }

  return services.slice(0, 6);
}

function extractFeaturesFromBio(bio: string = ''): string[] {
  const features: string[] = [];
  
  // Look for feature indicators
  const featurePatterns = [
    /(?:✓|✔|★|●|📍|🏆|💯)\s*([^✓✔★●📍🏆💯\n]+)/g,
  ];

  for (const pattern of featurePatterns) {
    let match;
    while ((match = pattern.exec(bio)) !== null) {
      const feature = match[1].trim();
      if (feature.length > 3 && feature.length < 50) {
        features.push(feature);
      }
    }
  }

  return features.slice(0, 6);
}

function extractProductsFromPosts(posts: any[]): ProductData[] {
  const products: ProductData[] = [];

  for (const post of posts) {
    if (post.productTags?.length > 0) {
      for (const tag of post.productTags) {
        products.push({
          name: tag,
          image: post.imageUrl,
        });
      }
    }
  }

  return products.slice(0, 8);
}

function parseAddress(json: string): string | null {
  try {
    const addr = JSON.parse(json);
    return [addr.street_address, addr.city_name, addr.region_name, addr.zip_code]
      .filter(Boolean).join(', ');
  } catch {
    return null;
  }
}

function parseCount(str: string): number {
  const clean = str.replace(/,/g, '').trim().toUpperCase();
  const multipliers: Record<string, number> = { K: 1000, M: 1000000, B: 1000000000 };
  
  for (const [suffix, mult] of Object.entries(multipliers)) {
    if (clean.endsWith(suffix)) {
      return Math.round(parseFloat(clean.replace(suffix, '')) * mult);
    }
  }
  
  return parseInt(clean) || 0;
}

function parsePrice(str: string): number | undefined {
  const match = str.match(/[\d,.]+/);
  if (match) {
    return parseFloat(match[0].replace(',', ''));
  }
  return undefined;
}

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function decodeHTMLEntities(text: string): string {
  return text
    // Named entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Numeric entities (decimal)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    // Numeric entities (hex)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Common specific ones that might not have semicolons
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#064;/g, '@')
    .replace(/&#x2022;/g, '•');
}

function isValidColor(color: string): boolean {
  return /^#[0-9a-fA-F]{3,6}$/.test(color);
}

function adjustColor(hex: string): string {
  // Create a complementary/secondary color
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Lighten or shift the color
    const newR = Math.min(255, r + 40);
    const newG = Math.min(255, g + 20);
    const newB = Math.min(255, b + 60);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  } catch {
    return '#8b5cf6';
  }
}

// ==================== AI ENHANCEMENT ====================

async function enhanceWithAI(data: ScrapedData, url: string): Promise<ScrapedData> {
  try {
    console.log('[Scraper] Enhancing with AI...');
    
    const aiContent = await generateEnhancedContent({
      name: data.title,
      description: data.description,
      businessType: data.businessType,
      services: data.services,
      features: data.features,
    });

    if (aiContent) {
      // Merge AI-generated content
      if (!data.description && aiContent.aboutText) {
        data.description = aiContent.aboutText;
      }
      if (data.services.length === 0 && aiContent.services?.length) {
        data.services = aiContent.services;
      }
      if (data.features.length === 0 && aiContent.features?.length) {
        data.features = aiContent.features;
      }
    }
  } catch (error) {
    console.log('[Scraper] AI enhancement failed:', error);
  }

  return data;
}

// ==================== DEFAULT DATA ====================

function getDefaultScrapedData(sourceType: ScrapedData['sourceType'], confidence: ScrapedData['confidence']): ScrapedData {
  return {
    title: 'My Business',
    description: '',
    logo: null,
    heroImage: null,
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    businessType: 'service',
    phone: null,
    email: null,
    address: null,
    socialLinks: {},
    products: [],
    services: [],
    openingHours: null,
    features: [],
    testimonials: [],
    galleryImages: [],
    sourceType,
    scrapedAt: new Date().toISOString(),
    confidence,
  };
}

// ==================== EXPORTS ====================

export { scrapeUrl as scrapeWebsite };

// ==================== UTILITY EXPORTS ====================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

export function generateUniqueSlug(name: string): string {
  const baseSlug = generateSlug(name);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
}
