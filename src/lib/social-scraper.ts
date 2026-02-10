// Advanced Social Media Scraper for Instagram & Facebook
// Extracts business information from social profiles using multiple methods

import type { ScrapedData, ProductData, SocialLinks } from './scraper';

// ==================== TYPES ====================

export interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  website: string | null;
  profilePicUrl: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isBusinessAccount: boolean;
  businessCategory: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  posts: InstagramPost[];
}

export interface InstagramPost {
  id: string;
  caption: string;
  imageUrl: string;
  likes: number;
  comments: number;
  timestamp: string;
  isVideo: boolean;
  productTags?: string[];
}

export interface FacebookPage {
  name: string;
  username: string;
  about: string;
  description: string;
  website: string | null;
  profilePicUrl: string | null;
  coverPhotoUrl: string | null;
  category: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: Record<string, string> | null;
  posts: FacebookPost[];
}

export interface FacebookPost {
  id: string;
  message: string;
  imageUrl: string | null;
  likes: number;
  shares: number;
  timestamp: string;
}

// ==================== MAIN SCRAPER FUNCTIONS ====================

/**
 * Scrape Instagram profile and posts
 * Uses multiple fallback methods for reliability
 */
export async function scrapeInstagramProfile(url: string): Promise<ScrapedData> {
  const username = extractInstagramUsername(url);
  
  if (!username) {
    console.error('Could not extract Instagram username from URL:', url);
    return getInstagramFallback(url);
  }

  console.log(`Scraping Instagram profile: @${username}`);

  // Try multiple scraping methods in order of reliability
  let profileData: InstagramProfile | null = null;

  // Method 1: Try Instagram's public JSON endpoint (may be blocked)
  profileData = await tryInstagramPublicAPI(username);

  // Method 2: Try web scraping the profile page
  if (!profileData) {
    profileData = await tryInstagramWebScrape(username);
  }

  // Method 3: Try oEmbed API for basic info
  if (!profileData) {
    profileData = await tryInstagramOEmbed(username);
  }

  // If all methods fail, return intelligent fallback
  if (!profileData) {
    return getInstagramFallback(url, username);
  }

  // Convert to ScrapedData format
  return convertInstagramToScrapedData(profileData, url);
}

/**
 * Scrape Facebook page
 */
export async function scrapeFacebookPage(url: string): Promise<ScrapedData> {
  const pageId = extractFacebookPageId(url);
  
  if (!pageId) {
    console.error('Could not extract Facebook page ID from URL:', url);
    return getFacebookFallback(url);
  }

  console.log(`Scraping Facebook page: ${pageId}`);

  // Try multiple scraping methods
  let pageData: FacebookPage | null = null;

  // Method 1: Try web scraping
  pageData = await tryFacebookWebScrape(pageId);

  // Method 2: Try oEmbed
  if (!pageData) {
    pageData = await tryFacebookOEmbed(pageId);
  }

  if (!pageData) {
    return getFacebookFallback(url, pageId);
  }

  return convertFacebookToScrapedData(pageData, url);
}

// ==================== INSTAGRAM SCRAPING METHODS ====================

/**
 * Try Instagram's public JSON API
 * Note: Instagram frequently blocks this, but worth trying
 */
async function tryInstagramPublicAPI(username: string): Promise<InstagramProfile | null> {
  try {
    // Instagram's public profile endpoint
    const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const user = data?.graphql?.user || data?.data?.user;

    if (!user) return null;

    return {
      username: user.username,
      fullName: user.full_name || username,
      biography: user.biography || '',
      website: user.external_url || null,
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || null,
      followersCount: user.edge_followed_by?.count || 0,
      followingCount: user.edge_follow?.count || 0,
      postsCount: user.edge_owner_to_timeline_media?.count || 0,
      isBusinessAccount: user.is_business_account || false,
      businessCategory: user.business_category_name || user.category_name || null,
      contactEmail: user.business_email || null,
      contactPhone: user.business_phone_number || null,
      address: user.business_address_json ? JSON.parse(user.business_address_json).street_address : null,
      posts: extractInstagramPosts(user.edge_owner_to_timeline_media?.edges || []),
    };
  } catch (error) {
    console.log('Instagram public API failed:', error);
    return null;
  }
}

/**
 * Web scrape Instagram profile page
 * Parses the HTML for embedded JSON data
 */
async function tryInstagramWebScrape(username: string): Promise<InstagramProfile | null> {
  try {
    const response = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Try to find shared data in the page
    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({.+?});<\/script>/);
    if (sharedDataMatch) {
      try {
        const sharedData = JSON.parse(sharedDataMatch[1]);
        const user = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;
        if (user) {
          return parseInstagramUserData(user);
        }
      } catch {
        // Continue to next method
      }
    }

    // Try to find additional data scripts
    const additionalDataMatch = html.match(/window\.__additionalDataLoaded\s*\([^,]+,\s*({.+?})\s*\)/);
    if (additionalDataMatch) {
      try {
        const additionalData = JSON.parse(additionalDataMatch[1]);
        const user = additionalData?.graphql?.user;
        if (user) {
          return parseInstagramUserData(user);
        }
      } catch {
        // Continue to next method
      }
    }

    // Parse HTML directly as fallback
    return parseInstagramHTML(html, username);

  } catch (error) {
    console.log('Instagram web scrape failed:', error);
    return null;
  }
}

/**
 * Try Instagram oEmbed API
 * More reliable but provides limited data
 */
async function tryInstagramOEmbed(username: string): Promise<InstagramProfile | null> {
  try {
    const profileUrl = `https://www.instagram.com/${username}/`;
    const response = await fetch(
      `https://api.instagram.com/oembed/?url=${encodeURIComponent(profileUrl)}&omitscript=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    return {
      username: username,
      fullName: data.author_name || username,
      biography: data.title || '',
      website: null,
      profilePicUrl: data.thumbnail_url || null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isBusinessAccount: false,
      businessCategory: null,
      contactEmail: null,
      contactPhone: null,
      address: null,
      posts: [],
    };
  } catch (error) {
    console.log('Instagram oEmbed failed:', error);
    return null;
  }
}

/**
 * Parse Instagram user data from JSON
 */
function parseInstagramUserData(user: Record<string, unknown>): InstagramProfile {
  const edges = (user.edge_owner_to_timeline_media as { edges?: unknown[] })?.edges || [];
  
  return {
    username: String(user.username || ''),
    fullName: String(user.full_name || user.username || ''),
    biography: String(user.biography || ''),
    website: user.external_url ? String(user.external_url) : null,
    profilePicUrl: String(user.profile_pic_url_hd || user.profile_pic_url || ''),
    followersCount: Number((user.edge_followed_by as { count?: number })?.count || 0),
    followingCount: Number((user.edge_follow as { count?: number })?.count || 0),
    postsCount: Number((user.edge_owner_to_timeline_media as { count?: number })?.count || 0),
    isBusinessAccount: Boolean(user.is_business_account),
    businessCategory: user.business_category_name ? String(user.business_category_name) : 
                      user.category_name ? String(user.category_name) : null,
    contactEmail: user.business_email ? String(user.business_email) : null,
    contactPhone: user.business_phone_number ? String(user.business_phone_number) : null,
    address: null,
    posts: extractInstagramPosts(edges),
  };
}

/**
 * Parse Instagram profile from HTML when JSON is not available
 */
function parseInstagramHTML(html: string, username: string): InstagramProfile | null {
  try {
    // Extract meta tags
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    // Parse description for follower counts
    const description = descMatch ? decodeHTMLEntities(descMatch[1]) : '';
    const followersMatch = description.match(/([\d,.]+[KMB]?)\s*Followers/i);
    const followingMatch = description.match(/([\d,.]+[KMB]?)\s*Following/i);
    const postsMatch = description.match(/([\d,.]+[KMB]?)\s*Posts/i);

    // Extract name from title
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1]) : username;
    const nameMatch = title.match(/^([^(@]+)/);
    const fullName = nameMatch ? nameMatch[1].trim() : username;

    // Extract bio from description
    const bioMatch = description.match(/- (.+)$/);
    const biography = bioMatch ? bioMatch[1].trim() : '';

    return {
      username,
      fullName,
      biography,
      website: null,
      profilePicUrl: imageMatch ? imageMatch[1] : null,
      followersCount: parseCount(followersMatch?.[1] || '0'),
      followingCount: parseCount(followingMatch?.[1] || '0'),
      postsCount: parseCount(postsMatch?.[1] || '0'),
      isBusinessAccount: false,
      businessCategory: null,
      contactEmail: null,
      contactPhone: null,
      address: null,
      posts: extractPostsFromHTML(html),
    };
  } catch {
    return null;
  }
}

/**
 * Extract posts from Instagram user data
 */
function extractInstagramPosts(edges: unknown[]): InstagramPost[] {
  return edges.slice(0, 12).map((edge: unknown) => {
    const node = (edge as { node: Record<string, unknown> }).node;
    const caption = (node.edge_media_to_caption as { edges?: Array<{ node: { text: string } }> })?.edges?.[0]?.node?.text || '';
    
    return {
      id: String(node.id || ''),
      caption,
      imageUrl: String(node.display_url || node.thumbnail_src || ''),
      likes: Number((node.edge_liked_by as { count?: number })?.count || (node.edge_media_preview_like as { count?: number })?.count || 0),
      comments: Number((node.edge_media_to_comment as { count?: number })?.count || 0),
      timestamp: String(node.taken_at_timestamp || ''),
      isVideo: Boolean(node.is_video),
      productTags: extractProductTags(caption),
    };
  });
}

/**
 * Extract posts from HTML page
 */
function extractPostsFromHTML(html: string): InstagramPost[] {
  const posts: InstagramPost[] = [];
  
  // Try to find image URLs in the HTML
  const imageMatches = html.matchAll(/https:\/\/[^"'\s]+?\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi);
  const images = [...new Set([...imageMatches].map(m => m[0]))];
  
  // Filter to likely post images (not icons, avatars, etc.)
  const postImages = images.filter(url => 
    url.includes('/p/') || 
    url.includes('/media/') ||
    (url.includes('instagram') && !url.includes('profile') && !url.includes('avatar'))
  ).slice(0, 12);

  postImages.forEach((url, i) => {
    posts.push({
      id: `post-${i}`,
      caption: '',
      imageUrl: url,
      likes: 0,
      comments: 0,
      timestamp: '',
      isVideo: false,
    });
  });

  return posts;
}

/**
 * Extract product tags from caption
 */
function extractProductTags(caption: string): string[] {
  const tags: string[] = [];
  
  // Look for price mentions
  const priceMatches = caption.match(/[\$£€]\d+(?:\.\d{2})?/g);
  if (priceMatches) {
    tags.push(...priceMatches);
  }
  
  // Look for "shop now", "link in bio", etc.
  if (/shop\s*now|buy\s*now|link\s*in\s*bio|available\s*now|order\s*now/i.test(caption)) {
    tags.push('shoppable');
  }
  
  // Look for hashtags that indicate products
  const productHashtags = caption.match(/#(?:shop|sale|newproduct|newarrival|forsale|handmade)/gi);
  if (productHashtags) {
    tags.push(...productHashtags);
  }
  
  return tags;
}

// ==================== FACEBOOK SCRAPING METHODS ====================

/**
 * Web scrape Facebook page
 */
async function tryFacebookWebScrape(pageId: string): Promise<FacebookPage | null> {
  try {
    const response = await fetch(`https://www.facebook.com/${pageId}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    return parseFacebookHTML(html, pageId);

  } catch (error) {
    console.log('Facebook web scrape failed:', error);
    return null;
  }
}

/**
 * Try Facebook oEmbed API
 */
async function tryFacebookOEmbed(pageId: string): Promise<FacebookPage | null> {
  try {
    const pageUrl = `https://www.facebook.com/${pageId}/`;
    const response = await fetch(
      `https://www.facebook.com/plugins/page/oembed.json/?url=${encodeURIComponent(pageUrl)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    return {
      name: data.author_name || pageId,
      username: pageId,
      about: '',
      description: data.title || '',
      website: null,
      profilePicUrl: data.thumbnail_url || null,
      coverPhotoUrl: null,
      category: '',
      address: null,
      phone: null,
      email: null,
      hours: null,
      posts: [],
    };
  } catch (error) {
    console.log('Facebook oEmbed failed:', error);
    return null;
  }
}

/**
 * Parse Facebook page from HTML
 */
function parseFacebookHTML(html: string, pageId: string): FacebookPage | null {
  try {
    // Extract meta tags
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    const name = titleMatch ? decodeHTMLEntities(titleMatch[1]).replace(' - Home', '').replace(' | Facebook', '') : pageId;
    const description = descMatch ? decodeHTMLEntities(descMatch[1]) : '';

    // Try to extract more data from the page
    const phoneMatch = html.match(/(?:tel:|phone[":]\s*)([+\d\s()-]+)/i);
    const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const websiteMatch = html.match(/<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>.*?(?:Website|Visit)/i);
    const categoryMatch = html.match(/(?:category|type)[":]\s*"([^"]+)"/i);

    // Extract address
    const addressMatch = html.match(/(?:address|location)[":]\s*"([^"]+)"/i) ||
                        html.match(/<span[^>]*>(\d+[^<]*(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd)[^<]*)<\/span>/i);

    return {
      name,
      username: pageId,
      about: description,
      description,
      website: websiteMatch ? websiteMatch[1] : null,
      profilePicUrl: imageMatch ? imageMatch[1] : null,
      coverPhotoUrl: extractFacebookCoverPhoto(html),
      category: categoryMatch ? categoryMatch[1] : detectCategoryFromContent(description),
      address: addressMatch ? addressMatch[1] : null,
      phone: phoneMatch ? phoneMatch[1].trim() : null,
      email: emailMatch ? emailMatch[1] : null,
      hours: extractFacebookHours(html),
      posts: extractFacebookPosts(html),
    };
  } catch {
    return null;
  }
}

/**
 * Extract Facebook cover photo
 */
function extractFacebookCoverPhoto(html: string): string | null {
  const coverMatch = html.match(/(?:coverPhoto|cover_photo)[^"]*"([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)/i);
  return coverMatch ? coverMatch[1] : null;
}

/**
 * Extract Facebook business hours
 */
function extractFacebookHours(html: string): Record<string, string> | null {
  const hoursMatch = html.match(/hours[":]\s*(\{[^}]+\})/i);
  if (hoursMatch) {
    try {
      return JSON.parse(hoursMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Extract Facebook posts from HTML
 */
function extractFacebookPosts(html: string): FacebookPost[] {
  const posts: FacebookPost[] = [];
  
  // Try to extract post content from the page
  const postMatches = html.matchAll(/data-ft[^>]*>([^<]{20,500})<\/(?:p|div|span)>/gi);
  
  for (const match of [...postMatches].slice(0, 6)) {
    const message = decodeHTMLEntities(match[1]).trim();
    if (message && !message.includes('{') && message.length > 20) {
      posts.push({
        id: `post-${posts.length}`,
        message,
        imageUrl: null,
        likes: 0,
        shares: 0,
        timestamp: '',
      });
    }
  }
  
  return posts;
}

// ==================== CONVERSION FUNCTIONS ====================

/**
 * Convert Instagram profile to ScrapedData format
 */
function convertInstagramToScrapedData(profile: InstagramProfile, originalUrl: string): ScrapedData {
  const businessType = detectBusinessTypeFromInstagram(profile);
  
  // Extract products from posts
  const products = extractProductsFromPosts(profile.posts);
  
  // Extract services from bio
  const services = extractServicesFromBio(profile.biography);
  
  // Get gallery images from posts
  const galleryImages = profile.posts
    .filter(p => !p.isVideo && p.imageUrl)
    .map(p => p.imageUrl)
    .slice(0, 12);

  return {
    title: profile.fullName || `@${profile.username}`,
    description: profile.biography || `Follow @${profile.username} for our latest updates and offerings.`,
    logo: profile.profilePicUrl,
    heroImage: profile.posts[0]?.imageUrl || profile.profilePicUrl,
    primaryColor: '#E1306C', // Instagram pink
    secondaryColor: '#833AB4', // Instagram purple
    businessType,
    phone: profile.contactPhone,
    email: profile.contactEmail,
    address: profile.address,
    socialLinks: {
      instagram: originalUrl,
      ...(profile.website && isValidSocialUrl(profile.website) ? extractSocialFromWebsite(profile.website) : {}),
    },
    products,
    services,
    openingHours: null,
    features: generateFeaturesFromInstagram(profile),
    testimonials: generateTestimonialsFromPosts(profile.posts),
    galleryImages,
  };
}

/**
 * Convert Facebook page to ScrapedData format
 */
function convertFacebookToScrapedData(page: FacebookPage, originalUrl: string): ScrapedData {
  const businessType = detectBusinessTypeFromFacebook(page);
  
  const services = extractServicesFromBio(page.description || page.about);
  
  return {
    title: page.name,
    description: page.about || page.description || `Welcome to ${page.name}`,
    logo: page.profilePicUrl,
    heroImage: page.coverPhotoUrl || page.profilePicUrl,
    primaryColor: '#1877F2', // Facebook blue
    secondaryColor: '#42B72A', // Facebook green
    businessType,
    phone: page.phone,
    email: page.email,
    address: page.address,
    socialLinks: {
      facebook: originalUrl,
      ...(page.website ? { website: page.website } : {}),
    },
    products: [],
    services,
    openingHours: page.hours,
    features: generateFeaturesFromFacebook(page),
    testimonials: [],
    galleryImages: page.posts.filter(p => p.imageUrl).map(p => p.imageUrl!),
  };
}

// ==================== BUSINESS TYPE DETECTION ====================

/**
 * Detect business type from Instagram profile
 */
function detectBusinessTypeFromInstagram(profile: InstagramProfile): ScrapedData['businessType'] {
  const content = `${profile.biography} ${profile.businessCategory || ''} ${profile.posts.map(p => p.caption).join(' ')}`.toLowerCase();
  
  return detectBusinessTypeFromContent(content);
}

/**
 * Detect business type from Facebook page
 */
function detectBusinessTypeFromFacebook(page: FacebookPage): ScrapedData['businessType'] {
  const content = `${page.about} ${page.description} ${page.category} ${page.posts.map(p => p.message).join(' ')}`.toLowerCase();
  
  return detectBusinessTypeFromContent(content);
}

/**
 * Detect business type from text content
 */
function detectBusinessTypeFromContent(content: string): ScrapedData['businessType'] {
  const types: { type: ScrapedData['businessType']; keywords: string[] }[] = [
    { type: 'restaurant', keywords: ['restaurant', 'cafe', 'coffee', 'food', 'menu', 'dining', 'chef', 'cuisine', 'eat', 'drink', 'bar', 'bistro', 'kitchen', 'delivery', 'takeout'] },
    { type: 'ecommerce', keywords: ['shop', 'store', 'buy', 'sale', 'product', 'shipping', 'order', 'cart', 'price', 'discount', 'collection', 'fashion', 'clothing', 'jewelry', 'accessories'] },
    { type: 'healthcare', keywords: ['health', 'medical', 'doctor', 'clinic', 'hospital', 'dental', 'therapy', 'wellness', 'patient', 'care', 'treatment', 'nurse'] },
    { type: 'fitness', keywords: ['fitness', 'gym', 'workout', 'training', 'personal trainer', 'yoga', 'pilates', 'crossfit', 'exercise', 'muscle', 'weight loss', 'health'] },
    { type: 'beauty', keywords: ['beauty', 'salon', 'spa', 'hair', 'nails', 'makeup', 'skincare', 'facial', 'massage', 'lashes', 'brows', 'wax', 'aesthetic'] },
    { type: 'realestate', keywords: ['real estate', 'property', 'home', 'house', 'apartment', 'rent', 'sale', 'realtor', 'broker', 'listing', 'mortgage'] },
    { type: 'education', keywords: ['education', 'school', 'learn', 'course', 'class', 'tutor', 'academy', 'training', 'workshop', 'certificate', 'degree'] },
    { type: 'agency', keywords: ['agency', 'marketing', 'design', 'creative', 'digital', 'advertising', 'branding', 'consulting', 'strategy', 'social media'] },
    { type: 'portfolio', keywords: ['photographer', 'artist', 'designer', 'portfolio', 'freelance', 'creative', 'work', 'project', 'commission'] },
  ];

  let maxScore = 0;
  let detectedType: ScrapedData['businessType'] = 'service';

  for (const { type, keywords } of types) {
    const score = keywords.filter(kw => content.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }

  return detectedType;
}

function detectCategoryFromContent(content: string): string {
  const type = detectBusinessTypeFromContent(content);
  const categoryMap: Record<string, string> = {
    restaurant: 'Restaurant',
    ecommerce: 'Shopping & Retail',
    healthcare: 'Health & Medical',
    fitness: 'Gym/Fitness',
    beauty: 'Beauty & Spa',
    realestate: 'Real Estate',
    education: 'Education',
    agency: 'Marketing Agency',
    portfolio: 'Artist/Creator',
    service: 'Local Business',
    other: 'Business',
  };
  return categoryMap[type] || 'Business';
}

// ==================== EXTRACTION HELPERS ====================

/**
 * Extract products from Instagram posts
 */
function extractProductsFromPosts(posts: InstagramPost[]): ProductData[] {
  const products: ProductData[] = [];
  
  for (const post of posts) {
    if (post.productTags?.includes('shoppable') || post.productTags?.some(t => t.startsWith('$'))) {
      // Try to extract product info from caption
      const priceMatch = post.caption.match(/[\$£€](\d+(?:\.\d{2})?)/);
      const nameMatch = post.caption.match(/^([^.\n!?]+)/);
      
      products.push({
        name: nameMatch ? nameMatch[1].trim().substring(0, 50) : 'Product',
        description: post.caption.substring(0, 200),
        price: priceMatch ? parseFloat(priceMatch[1]) : undefined,
        image: post.imageUrl,
      });
    }
  }
  
  // If no explicit products found, treat top posts as showcase items
  if (products.length === 0 && posts.length > 0) {
    posts.slice(0, 6).forEach((post, i) => {
      if (post.imageUrl && !post.isVideo) {
        products.push({
          name: `Featured ${i + 1}`,
          description: post.caption.substring(0, 150) || 'Check out our latest!',
          image: post.imageUrl,
        });
      }
    });
  }
  
  return products.slice(0, 12);
}

/**
 * Extract services from bio text
 */
function extractServicesFromBio(bio: string): string[] {
  const services: string[] = [];
  
  if (!bio) return services;
  
  // Look for bullet points or separators
  const parts = bio.split(/[•|·|\||📍|🔹|✨|⭐|💫|🌟|,|\n]/);
  
  for (const part of parts) {
    const cleaned = part.trim();
    if (cleaned.length > 3 && cleaned.length < 50 && !cleaned.includes('http')) {
      services.push(cleaned);
    }
  }
  
  return services.slice(0, 8);
}

/**
 * Generate features from Instagram profile
 */
function generateFeaturesFromInstagram(profile: InstagramProfile): string[] {
  const features: string[] = [];
  
  if (profile.followersCount > 1000) {
    features.push(`${formatCount(profile.followersCount)} Followers`);
  }
  if (profile.postsCount > 0) {
    features.push(`${profile.postsCount}+ Posts`);
  }
  if (profile.website) {
    features.push('Shop Online');
  }
  if (profile.contactEmail || profile.contactPhone) {
    features.push('Direct Contact');
  }
  if (profile.isBusinessAccount) {
    features.push('Verified Business');
  }
  
  // Add generic features based on business type
  features.push('DM for Inquiries');
  features.push('Check Link in Bio');
  
  return features.slice(0, 6);
}

/**
 * Generate features from Facebook page
 */
function generateFeaturesFromFacebook(page: FacebookPage): string[] {
  const features: string[] = [];
  
  if (page.phone) features.push('Call Us');
  if (page.email) features.push('Email Support');
  if (page.website) features.push('Visit Website');
  if (page.hours) features.push('Business Hours Available');
  if (page.address) features.push('Visit Our Location');
  
  features.push('Message Us on Facebook');
  
  return features.slice(0, 6);
}

/**
 * Generate testimonials from post comments/engagement
 */
function generateTestimonialsFromPosts(posts: InstagramPost[]): { name: string; text: string; rating?: number }[] {
  // Since we can't access actual comments, generate placeholder testimonials
  // based on engagement metrics
  const testimonials: { name: string; text: string; rating?: number }[] = [];
  
  const highEngagementPosts = posts
    .filter(p => p.likes > 10)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);
  
  if (highEngagementPosts.length > 0) {
    const names = ['Sarah M.', 'James R.', 'Emily K.', 'Michael T.', 'Lisa P.'];
    const templates = [
      'Absolutely love this! Always great quality.',
      'Best in the business! Highly recommend.',
      'Amazing experience every time. 5 stars!',
      'So happy I found this page. Fantastic!',
      'Never disappoints. Will keep coming back!',
    ];
    
    highEngagementPosts.forEach((post, i) => {
      testimonials.push({
        name: names[i],
        text: templates[i],
        rating: 5,
      });
    });
  }
  
  return testimonials;
}

// ==================== FALLBACK DATA ====================

/**
 * Intelligent fallback for Instagram
 */
function getInstagramFallback(url: string, username?: string): ScrapedData {
  const user = username || extractInstagramUsername(url) || 'business';
  
  return {
    title: `@${user}`,
    description: `Follow @${user} on Instagram for our latest updates, products, and offerings. DM us for inquiries!`,
    logo: null,
    heroImage: null,
    primaryColor: '#E1306C',
    secondaryColor: '#833AB4',
    businessType: 'other',
    phone: null,
    email: null,
    address: null,
    socialLinks: { instagram: url },
    products: [],
    services: [],
    openingHours: null,
    features: [
      'Follow Us on Instagram',
      'DM for Inquiries',
      'Shop via Link in Bio',
      'New Posts Weekly',
      'Exclusive Content',
    ],
    testimonials: [],
    galleryImages: [],
  };
}

/**
 * Intelligent fallback for Facebook
 */
function getFacebookFallback(url: string, pageId?: string): ScrapedData {
  const name = pageId || 'Business';
  
  return {
    title: name,
    description: `Welcome to ${name} on Facebook. Like our page for updates, promotions, and more!`,
    logo: null,
    heroImage: null,
    primaryColor: '#1877F2',
    secondaryColor: '#42B72A',
    businessType: 'other',
    phone: null,
    email: null,
    address: null,
    socialLinks: { facebook: url },
    products: [],
    services: [],
    openingHours: null,
    features: [
      'Like Us on Facebook',
      'Message for Inquiries',
      'Check Our Reviews',
      'Regular Updates',
      'Community Engagement',
    ],
    testimonials: [],
    galleryImages: [],
  };
}

// ==================== UTILITY FUNCTIONS ====================

function extractInstagramUsername(url: string): string | null {
  const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  return match ? match[1].replace(/\/$/, '') : null;
}

function extractFacebookPageId(url: string): string | null {
  // Handle various Facebook URL formats
  const patterns = [
    /facebook\.com\/([a-zA-Z0-9.]+)/,
    /fb\.com\/([a-zA-Z0-9.]+)/,
    /facebook\.com\/pages\/[^/]+\/(\d+)/,
    /facebook\.com\/profile\.php\?id=(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\\n/g, '\n')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function parseCount(str: string): number {
  if (!str) return 0;
  const num = parseFloat(str.replace(/,/g, ''));
  if (str.toUpperCase().includes('K')) return num * 1000;
  if (str.toUpperCase().includes('M')) return num * 1000000;
  if (str.toUpperCase().includes('B')) return num * 1000000000;
  return num;
}

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function isValidSocialUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function extractSocialFromWebsite(url: string): Partial<SocialLinks> {
  const links: Partial<SocialLinks> = {};
  
  if (url.includes('twitter.com') || url.includes('x.com')) {
    links.twitter = url;
  } else if (url.includes('tiktok.com')) {
    links.tiktok = url;
  } else if (url.includes('youtube.com')) {
    links.youtube = url;
  } else if (url.includes('linkedin.com')) {
    links.linkedin = url;
  }
  
  return links;
}

// ==================== MAIN EXPORT ====================

/**
 * Smart social media scraper - automatically detects platform
 */
export async function scrapeSocialMedia(url: string): Promise<ScrapedData> {
  const normalizedUrl = url.trim().toLowerCase();
  
  if (normalizedUrl.includes('instagram.com') || normalizedUrl.includes('instagr.am')) {
    return scrapeInstagramProfile(url);
  }
  
  if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com')) {
    return scrapeFacebookPage(url);
  }
  
  if (normalizedUrl.includes('tiktok.com')) {
    return scrapeTikTokProfile(url);
  }
  
  if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
    return scrapeTwitterProfile(url);
  }
  
  if (normalizedUrl.includes('linkedin.com')) {
    return scrapeLinkedInProfile(url);
  }
  
  // Return generic fallback for unknown social platforms
  return {
    title: 'My Business',
    description: 'Welcome to our business page.',
    logo: null,
    heroImage: null,
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    businessType: 'other',
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
  };
}

// ==================== TIKTOK SCRAPER ====================

/**
 * Scrape TikTok profile
 */
async function scrapeTikTokProfile(url: string): Promise<ScrapedData> {
  const username = extractTikTokUsername(url);
  
  if (!username) {
    return getTikTokFallback(url);
  }

  try {
    const response = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return getTikTokFallback(url, username);
    }

    const html = await response.text();
    
    // Extract data from meta tags
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    
    // Try to find SIGI_STATE for more data
    const sigiMatch = html.match(/<script\s+id="SIGI_STATE"[^>]*>([^<]+)<\/script>/);
    let bioData: { signature?: string; nickname?: string; followerCount?: number } = {};
    
    if (sigiMatch) {
      try {
        const sigiData = JSON.parse(sigiMatch[1]);
        const userInfo = sigiData?.UserModule?.users?.[username];
        if (userInfo) {
          bioData = {
            signature: userInfo.signature,
            nickname: userInfo.nickname,
            followerCount: userInfo.followerCount,
          };
        }
      } catch {
        // Continue with meta tags
      }
    }
    
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1]).replace(' | TikTok', '') : `@${username}`;
    const description = bioData.signature || (descMatch ? decodeHTMLEntities(descMatch[1]) : '');
    
    // Detect business type from bio
    const businessType = detectBusinessTypeFromContent(description);
    
    return {
      title: bioData.nickname || title,
      description: description || `Follow @${username} on TikTok for entertaining and engaging content!`,
      logo: imageMatch ? imageMatch[1] : null,
      heroImage: imageMatch ? imageMatch[1] : null,
      primaryColor: '#00F2EA', // TikTok cyan
      secondaryColor: '#FF0050', // TikTok pink
      businessType,
      phone: null,
      email: null,
      address: null,
      socialLinks: { tiktok: url },
      products: [],
      services: extractServicesFromBio(description),
      openingHours: null,
      features: [
        bioData.followerCount ? `${formatCount(bioData.followerCount)} Followers` : 'Growing Community',
        'Viral Content',
        'DM for Collabs',
        'Link in Bio',
        'Daily Posts',
      ],
      testimonials: [],
      galleryImages: [],
    };
  } catch (error) {
    console.log('TikTok scrape failed:', error);
    return getTikTokFallback(url, username);
  }
}

function extractTikTokUsername(url: string): string | null {
  const match = url.match(/tiktok\.com\/@?([a-zA-Z0-9._]+)/);
  return match ? match[1].replace('@', '') : null;
}

function getTikTokFallback(url: string, username?: string): ScrapedData {
  const user = username || 'creator';
  return {
    title: `@${user}`,
    description: `Follow @${user} on TikTok for amazing content, tips, and behind-the-scenes moments!`,
    logo: null,
    heroImage: null,
    primaryColor: '#00F2EA',
    secondaryColor: '#FF0050',
    businessType: 'other',
    phone: null,
    email: null,
    address: null,
    socialLinks: { tiktok: url },
    products: [],
    services: [],
    openingHours: null,
    features: ['Follow on TikTok', 'Viral Content', 'DM for Inquiries', 'Link in Bio'],
    testimonials: [],
    galleryImages: [],
  };
}

// ==================== TWITTER/X SCRAPER ====================

/**
 * Scrape Twitter/X profile
 */
async function scrapeTwitterProfile(url: string): Promise<ScrapedData> {
  const username = extractTwitterUsername(url);
  
  if (!username) {
    return getTwitterFallback(url);
  }

  try {
    // Try using Nitter (open source Twitter frontend) as a proxy
    const nitterInstances = [
      'nitter.net',
      'nitter.privacydev.net',
      'nitter.poast.org',
    ];
    
    let html = '';
    for (const instance of nitterInstances) {
      try {
        const response = await fetch(`https://${instance}/${username}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        if (response.ok) {
          html = await response.text();
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!html) {
      // Try Twitter directly
      const response = await fetch(`https://twitter.com/${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      
      if (response.ok) {
        html = await response.text();
      }
    }
    
    if (!html) {
      return getTwitterFallback(url, username);
    }

    // Extract data from meta tags
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    
    // Parse Nitter-specific elements
    const bioMatch = html.match(/<div class="profile-bio"[^>]*>([^<]+)<\/div>/i);
    const nameMatch = html.match(/<a class="profile-card-fullname"[^>]*>([^<]+)<\/a>/i);
    const statsMatch = html.match(/<span class="profile-stat-num"[^>]*>([\d,]+)<\/span>/gi);
    
    const title = nameMatch 
      ? decodeHTMLEntities(nameMatch[1]) 
      : (titleMatch ? decodeHTMLEntities(titleMatch[1]).replace(/\s*\(@[^)]+\).*$/, '') : `@${username}`);
    
    const description = bioMatch 
      ? decodeHTMLEntities(bioMatch[1]) 
      : (descMatch ? decodeHTMLEntities(descMatch[1]) : '');
    
    const businessType = detectBusinessTypeFromContent(description);
    
    // Extract follower count
    let followers = 0;
    if (statsMatch && statsMatch.length >= 3) {
      const followersStr = statsMatch[2].match(/>([\d,]+)</)?.[1] || '0';
      followers = parseInt(followersStr.replace(/,/g, ''));
    }
    
    return {
      title,
      description: description || `Follow @${username} on X for updates, insights, and more!`,
      logo: imageMatch ? imageMatch[1] : null,
      heroImage: imageMatch ? imageMatch[1] : null,
      primaryColor: '#1DA1F2', // Twitter blue
      secondaryColor: '#14171A', // Twitter dark
      businessType,
      phone: null,
      email: null,
      address: null,
      socialLinks: { twitter: url },
      products: [],
      services: extractServicesFromBio(description),
      openingHours: null,
      features: [
        followers > 0 ? `${formatCount(followers)} Followers` : 'Active on X',
        'Daily Updates',
        'DM Open',
        'Threads & Insights',
        'Community Engagement',
      ],
      testimonials: [],
      galleryImages: [],
    };
  } catch (error) {
    console.log('Twitter scrape failed:', error);
    return getTwitterFallback(url, username);
  }
}

function extractTwitterUsername(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

function getTwitterFallback(url: string, username?: string): ScrapedData {
  const user = username || 'user';
  return {
    title: `@${user}`,
    description: `Follow @${user} on X (Twitter) for the latest updates, thoughts, and conversations!`,
    logo: null,
    heroImage: null,
    primaryColor: '#1DA1F2',
    secondaryColor: '#14171A',
    businessType: 'other',
    phone: null,
    email: null,
    address: null,
    socialLinks: { twitter: url },
    products: [],
    services: [],
    openingHours: null,
    features: ['Follow on X', 'DM for Inquiries', 'Daily Updates', 'Join the Conversation'],
    testimonials: [],
    galleryImages: [],
  };
}

// ==================== LINKEDIN SCRAPER ====================

/**
 * Scrape LinkedIn profile/company page
 */
async function scrapeLinkedInProfile(url: string): Promise<ScrapedData> {
  const { type, id } = extractLinkedInInfo(url);
  
  if (!id) {
    return getLinkedInFallback(url);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return getLinkedInFallback(url, id, type);
    }

    const html = await response.text();
    
    // Extract data from meta tags
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1]).replace(' | LinkedIn', '') : id;
    const description = descMatch ? decodeHTMLEntities(descMatch[1]) : '';
    
    const businessType = type === 'company' ? detectBusinessTypeFromContent(description) : 'portfolio';
    
    return {
      title,
      description: description || `Connect with ${title} on LinkedIn for professional updates and opportunities.`,
      logo: imageMatch ? imageMatch[1] : null,
      heroImage: imageMatch ? imageMatch[1] : null,
      primaryColor: '#0A66C2', // LinkedIn blue
      secondaryColor: '#004182', // LinkedIn dark blue
      businessType,
      phone: null,
      email: null,
      address: null,
      socialLinks: { linkedin: url },
      products: [],
      services: extractServicesFromBio(description),
      openingHours: null,
      features: [
        'Professional Network',
        'Industry Insights',
        'Connect with Us',
        type === 'company' ? 'We\'re Hiring' : 'Open to Opportunities',
        'Thought Leadership',
      ],
      testimonials: [],
      galleryImages: [],
    };
  } catch (error) {
    console.log('LinkedIn scrape failed:', error);
    return getLinkedInFallback(url, id, type);
  }
}

function extractLinkedInInfo(url: string): { type: 'profile' | 'company'; id: string | null } {
  const companyMatch = url.match(/linkedin\.com\/company\/([a-zA-Z0-9-]+)/);
  if (companyMatch) {
    return { type: 'company', id: companyMatch[1] };
  }
  
  const profileMatch = url.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
  if (profileMatch) {
    return { type: 'profile', id: profileMatch[1] };
  }
  
  return { type: 'profile', id: null };
}

function getLinkedInFallback(url: string, id?: string, type?: 'profile' | 'company'): ScrapedData {
  const name = id ? id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Professional';
  return {
    title: name,
    description: `Connect with ${name} on LinkedIn for professional updates, industry insights, and networking opportunities.`,
    logo: null,
    heroImage: null,
    primaryColor: '#0A66C2',
    secondaryColor: '#004182',
    businessType: type === 'company' ? 'agency' : 'portfolio',
    phone: null,
    email: null,
    address: null,
    socialLinks: { linkedin: url },
    products: [],
    services: [],
    openingHours: null,
    features: ['Professional Network', 'Industry Expertise', 'Connect on LinkedIn'],
    testimonials: [],
    galleryImages: [],
  };
}
