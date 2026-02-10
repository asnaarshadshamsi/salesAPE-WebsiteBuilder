# 🏗️ HackSquad MVP - Complete Architecture & Technical Documentation

> **Version:** 1.0.0  
> **Last Updated:** February 4, 2026  
> **Status:** Production-Ready MVP

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Technology Stack](#technology-stack)
4. [Architecture Diagrams](#architecture-diagrams)
5. [Project Structure](#project-structure)
6. [Core Components Deep Dive](#core-components-deep-dive)
7. [Database Schema](#database-schema)
8. [Data Flow & User Journey](#data-flow--user-journey)
9. [API Reference](#api-reference)
10. [Business Type Templates](#business-type-templates)
11. [Security & Authentication](#security--authentication)
12. [Integrations](#integrations)
13. [Deployment Guide](#deployment-guide)
14. [Configuration Reference](#configuration-reference)

---

## Executive Summary

**HackSquad** is an AI-powered website builder that creates custom business websites from any URL or social media profile. Users simply provide a link to their existing online presence, and the system automatically:

1. **Scrapes** comprehensive business data from the source
2. **Analyzes** the business type and generates tailored content
3. **Creates** a beautiful, responsive website with lead capture
4. **Manages** leads through an integrated CRM
5. **Schedules** meetings via Google Calendar integration
6. **Notifies** business owners of new leads via email

### Key Value Propositions

- ⚡ **5-Minute Setup** - From URL to live website
- 🤖 **AI-Powered** - Content generation with Cohere AI
- 📱 **Multi-Platform Scraping** - Instagram, Facebook, TikTok, Twitter, LinkedIn, websites
- 🎨 **11 Industry Templates** - Restaurant, Healthcare, Fitness, Beauty, Real Estate, etc.
- 📊 **Built-in A/B Testing** - Automatic variant testing with conversion tracking
- 📅 **Calendar Integration** - Google Calendar for meeting scheduling
- 📧 **Lead Notifications** - Instant email alerts for new leads

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HackSquad MVP                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   Frontend   │◄──►│   Backend    │◄──►│   Database   │               │
│  │  (Next.js)   │    │ (Server Act) │    │   (SQLite)   │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│         │                   │                    │                       │
│         ▼                   ▼                    ▼                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │  React 19    │    │  Production  │    │   Prisma     │               │
│  │  Components  │    │   Scraper    │    │    ORM       │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                             │                                            │
│                             ▼                                            │
│  ┌──────────────────────────────────────────────────────┐               │
│  │                 External Services                     │               │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │               │
│  │  │ Cohere  │  │ Google  │  │  Email  │  │ Social  │ │               │
│  │  │   AI    │  │Calendar │  │ Service │  │  APIs   │ │               │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │               │
│  └──────────────────────────────────────────────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.4 | Full-stack React framework with App Router |
| **React** | 19.2.3 | UI component library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 4.x | Utility-first styling |

### Database & ORM
| Technology | Version | Purpose |
|------------|---------|---------|
| **SQLite** | - | Embedded relational database |
| **Prisma** | 7.3.0 | Type-safe ORM & migrations |
| **better-sqlite3** | 12.6.2 | Native SQLite driver |

### Authentication & Security
| Technology | Purpose |
|------------|---------|
| **jose** | JWT token generation/verification |
| **bcryptjs** | Password hashing (bcrypt algorithm) |
| **HTTP-only cookies** | Secure session management |

### External Services
| Service | Purpose |
|---------|---------|
| **Cohere AI** | Content generation & enhancement |
| **Google Calendar API** | Meeting scheduling |
| **Resend** | Transactional email delivery |

### UI & Components
| Library | Purpose |
|---------|---------|
| **lucide-react** | Icon library |
| **qrcode.react** | QR code generation |
| **canvas-confetti** | Success celebrations |
| **tailwind-merge** | Conditional class merging |

---

## Architecture Diagrams

### High-Level Architecture

```
                              ┌────────────────────┐
                              │     User/Client    │
                              │   (Web Browser)    │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │    Next.js App     │
                              │  ┌──────────────┐  │
                              │  │  App Router  │  │
                              │  │   (Pages)    │  │
                              │  └──────────────┘  │
                              │  ┌──────────────┐  │
                              │  │   Server     │  │
                              │  │   Actions    │  │
                              │  └──────────────┘  │
                              │  ┌──────────────┐  │
                              │  │  API Routes  │  │
                              │  └──────────────┘  │
                              └─────────┬──────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │     Prisma      │      │   Production    │      │    External     │
    │      ORM        │      │    Scraper      │      │    Services     │
    └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
             │                        │                         │
             ▼                        ▼                         ▼
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │     SQLite      │      │   Target URLs   │      │  Cohere/Google  │
    │    Database     │      │ (Any Website/   │      │  Calendar/Email │
    │    (dev.db)     │      │  Social Media)  │      │                 │
    └─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Request Flow Diagram

```
User Action                    System Response
    │                               │
    ▼                               │
┌─────────────────┐                │
│ Enter URL/Link  │                │
└────────┬────────┘                │
         │                         │
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│ analyzeUrl()    │─────►│ scrapeWebsite() │
│ Server Action   │      │ Production      │
└────────┬────────┘      │ Scraper         │
         │               └────────┬────────┘
         │                        │
         │               ┌────────┴────────┐
         │               │ Detect Source   │
         │               │ Type & Route    │
         │               └────────┬────────┘
         │                        │
         │    ┌───────────────────┴───────────────────┐
         │    │                                       │
         │    ▼                                       ▼
         │  ┌─────────┐                       ┌─────────────┐
         │  │Instagram│                       │   Website   │
         │  │Facebook │◄── Social ──────────► │  Multi-Page │
         │  │TikTok   │    Media              │   Crawler   │
         │  │Twitter  │    Scrapers           │             │
         │  │LinkedIn │                       └──────┬──────┘
         │  └────┬────┘                              │
         │       │                                   │
         │       └───────────────┬───────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  ScrapedData    │
         │              │  (Unified)      │
         │              └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐      ┌─────────────────┐
│ generateContent │◄─────│ Cohere AI       │
│ (AI-Enhanced)   │      │ Enhancement     │
└────────┬────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│ createBusiness  │
│ & Site          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQLite DB      │
│  (Prisma)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generated Site  │
│ /sites/{slug}   │
└─────────────────┘
```

---

## Project Structure

```
hack-squad/
├── 📁 prisma/
│   └── schema.prisma           # Database schema definitions
│
├── 📁 public/                  # Static assets
│
├── 📁 src/
│   ├── 📁 actions/             # Server Actions (Backend Logic)
│   │   ├── auth.ts             # Authentication (login, signup, signOut)
│   │   ├── business.ts         # Business CRUD, URL analysis
│   │   ├── leads.ts            # Lead management
│   │   └── meetings.ts         # Calendar & meeting scheduling
│   │
│   ├── 📁 app/                 # Next.js App Router Pages
│   │   ├── 📁 api/             # API Routes
│   │   │   ├── 📁 auth/google/ # Google OAuth endpoints
│   │   │   └── 📁 booking/     # Booking slots API
│   │   │
│   │   ├── 📁 create/          # Website creation wizard
│   │   ├── 📁 dashboard/       # Owner dashboard
│   │   │   ├── 📁 business/[id]/ # Business detail/edit
│   │   │   ├── 📁 leads/       # Lead management
│   │   │   └── 📁 meetings/    # Meeting calendar
│   │   │
│   │   ├── 📁 login/           # Login page
│   │   ├── 📁 signup/          # Signup page
│   │   ├── 📁 sites/[slug]/    # Public generated sites
│   │   │
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   │
│   ├── 📁 components/          # React Components
│   │   ├── 📁 cart/            # E-commerce cart components
│   │   ├── 📁 templates/       # 11 industry-specific templates
│   │   │   ├── AgencyTemplate.tsx
│   │   │   ├── BeautyTemplate.tsx
│   │   │   ├── EcommerceTemplate.tsx
│   │   │   ├── EducationTemplate.tsx
│   │   │   ├── FitnessTemplate.tsx
│   │   │   ├── HealthcareTemplate.tsx
│   │   │   ├── PortfolioTemplate.tsx
│   │   │   ├── RealEstateTemplate.tsx
│   │   │   ├── RestaurantTemplate.tsx
│   │   │   ├── ServiceTemplate.tsx
│   │   │   └── StartupTemplate.tsx
│   │   │
│   │   ├── 📁 ui/              # Base UI components
│   │   ├── BusinessEditForm.tsx
│   │   ├── LeadActions.tsx
│   │   ├── LeadStatusBadge.tsx
│   │   ├── LivePreview.tsx
│   │   ├── OnboardingForm.tsx
│   │   ├── QRCodeCard.tsx
│   │   ├── SiteTemplate.tsx    # Template router
│   │   └── ...
│   │
│   ├── 📁 contexts/            # React Contexts
│   │   └── CartContext.tsx     # Shopping cart state
│   │
│   ├── 📁 lib/                 # Core Libraries
│   │   ├── ai.ts               # AI content generation
│   │   ├── auth.ts             # Auth utilities
│   │   ├── cohere-ai.ts        # Cohere AI integration
│   │   ├── email-service.ts    # Email sending (Resend)
│   │   ├── google-calendar.ts  # Google Calendar API
│   │   ├── lead-notifications.ts # Lead email alerts
│   │   ├── prisma.ts           # Prisma client
│   │   ├── production-scraper.ts # Multi-platform scraper (2277 lines)
│   │   ├── social-scraper.ts   # Social media scraping utilities
│   │   └── utils.ts            # Helper functions
│   │
│   ├── 📁 types/               # TypeScript types
│   │
│   └── middleware.ts           # Route protection
│
├── .env                        # Environment variables
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── dev.db                      # SQLite database file
```

---

## Core Components Deep Dive

### 1. Production Scraper (`production-scraper.ts`)

The heart of HackSquad - a 2,277-line production-ready web scraper supporting multiple platforms.

#### Scraping Strategies

```typescript
// Main entry point
export async function scrapeUrl(url: string): Promise<ScrapedData> {
  // 1. Detect source type
  const sourceType = detectSourceType(url);
  
  // 2. Route to appropriate scraper
  switch (sourceType) {
    case 'instagram': return scrapeInstagram(url);
    case 'facebook':  return scrapeFacebook(url);
    case 'tiktok':    return scrapeTikTok(url);
    case 'twitter':   return scrapeTwitter(url);
    case 'linkedin':  return scrapeLinkedIn(url);
    case 'google_business': return scrapeGoogleBusiness(url);
    default:          return scrapeWebsite(url);
  }
  
  // 3. Enhance with AI if needed
  if (result.confidence === 'low') {
    result = await enhanceWithAI(result, url);
  }
}
```

#### Multi-Page Website Crawling

```typescript
async function scrapeWebsite(url: string): Promise<ScrapedData> {
  // 1. Fetch main page
  const html = await fetchWithRetry(url);
  
  // 2. Extract navigation links
  const navLinks = extractNavigationLinks(html, baseUrl);
  
  // 3. Crawl up to 8 additional pages
  const additionalData = await crawlAdditionalPages(navLinks);
  
  // Extracts from:
  // - Services page
  // - About page  
  // - Portfolio/Gallery page
  // - Testimonials page
  // - Contact page
  // - Team page
  // - Pricing page
}
```

#### Anti-Bot Measures

```typescript
// Rotating user agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
  // ... more agents
];

// Fetch with retry and anti-403 headers
async function fetchWithRetry(url, options, retries = 3) {
  const headers = {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml...',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    // ... more headers
  };
  
  // Exponential backoff on failures
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, { headers });
      if (response.status === 403 && i < retries) {
        await sleep(1500 * (i + 1));
        continue;
      }
      return response;
    } catch (error) {
      await sleep(1500 * (i + 1));
    }
  }
}
```

#### Unified ScrapedData Interface

```typescript
interface ScrapedData {
  // Basic Info
  title: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  
  // Branding
  primaryColor: string;
  secondaryColor: string;
  
  // Business Classification
  businessType: 'ecommerce' | 'restaurant' | 'service' | 'portfolio' | 
                'agency' | 'healthcare' | 'fitness' | 'beauty' | 
                'realestate' | 'education' | 'other';
  
  // Contact
  phone: string | null;
  email: string | null;
  address: string | null;
  
  // Social
  socialLinks: SocialLinks;
  
  // Content
  products: ProductData[];
  services: string[];
  features: string[];
  testimonials: { name: string; text: string; rating?: number }[];
  galleryImages: string[];
  
  // Multi-page Data
  portfolioItems?: { title: string; description?: string; image: string }[];
  teamMembers?: { name: string; role: string; image?: string; bio?: string }[];
  aboutContent?: string;
  pricingInfo?: { name: string; price: string; features: string[] }[];
  pages?: { url: string; type: string; title: string; content: string }[];
  
  // Metadata
  sourceType: 'website' | 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'linkedin';
  scrapedAt: string;
  confidence: 'high' | 'medium' | 'low';
}
```

### 2. AI Content Generator (`ai.ts` + `cohere-ai.ts`)

#### Template-Based Generation

```typescript
const templates: Record<BusinessType, {
  headlines: string[];
  alternateHeadlines: string[];
  subheadlines: string[];
  aboutTemplates: string[];
  ctaOptions: string[];
  defaultServices: string[];
  defaultFeatures: string[];
  sectionTitles: {...};
}> = {
  ecommerce: {
    headlines: [
      "Shop the Latest {name} Collection",
      "Discover Premium Products at {name}",
      // ...
    ],
    // ...
  },
  restaurant: { /* ... */ },
  healthcare: { /* ... */ },
  // ... 11 total business types
};
```

#### Cohere AI Enhancement

```typescript
export async function generateBusinessContent(
  context: BusinessContext
): Promise<GeneratedContent | null> {
  const prompt = buildContentPrompt(context);
  
  const response = await fetch('https://api.cohere.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'command',
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });
  
  return parseGeneratedContent(response);
}
```

### 3. Authentication System (`auth.ts`)

```typescript
// JWT-based session management
export async function createSession(userId: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
  
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Password hashing with bcrypt
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
```

### 4. Lead Management System

```typescript
// Lead Status Flow
enum LeadStatus {
  NEW        // Just submitted
  CONTACTED  // Owner reached out
  QUALIFIED  // Confirmed interest
  CONVERTED  // Became customer
  LOST       // Not interested
}

// Automatic Lead Notification
async function onLeadCreated(lead, business) {
  // 1. Notify owner via email
  await notifyOwnerOfNewLead(lead, business);
  
  // 2. Send auto-response to lead
  if (business.autoResponder) {
    await sendLeadAutoResponse(lead, business);
  }
  
  // 3. Track A/B variant
  await recordConversion(lead.variant);
}
```

### 5. Google Calendar Integration

```typescript
// OAuth Flow
export function getGoogleOAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: CALENDAR_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Create Calendar Event
export async function createCalendarEvent(
  tokens: GoogleTokens,
  event: CalendarEvent
): Promise<CalendarEvent | null> {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );
  return response.json();
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  ┌──────────┐       ┌──────────────┐       ┌────────────┐            │
│  │   User   │       │   Business   │       │    Site    │            │
│  ├──────────┤       ├──────────────┤       ├────────────┤            │
│  │ id (PK)  │◄──┐   │ id (PK)      │◄──┐   │ id (PK)    │            │
│  │ email    │   │   │ userId (FK)  │───┘   │ businessId │───┐        │
│  │ password │   │   │ name         │◄──────│ slug       │   │        │
│  │ name     │   │   │ description  │       │ headline   │   │        │
│  │ createdAt│   │   │ sourceUrl    │       │ subheadline│   │        │
│  │ updatedAt│   │   │ logo         │       │ aboutText  │   │        │
│  └──────────┘   │   │ heroImage    │       │ ctaText    │   │        │
│                 │   │ primaryColor │       │ features   │   │        │
│                 │   │ businessType │       │ heroVariant│   │        │
│                 │   │ services     │       │ viewsA/B   │   │        │
│                 │   │ phone/email  │       │ conversionsA/B│ │        │
│                 │   │ address      │       └────────────┘   │        │
│                 │   │ calendlyUrl  │                        │        │
│                 │   │ socialLinks  │                        │        │
│                 │   │ calendarTokens│                       │        │
│                 │   └──────────────┘                        │        │
│                 │          │                                │        │
│                 │          │                                │        │
│                 │          ▼                                │        │
│                 │   ┌──────────────┐                        │        │
│                 │   │   Product    │                        │        │
│                 │   ├──────────────┤                        │        │
│                 │   │ id (PK)      │                        │        │
│                 │   │ businessId   │                        │        │
│                 │   │ name         │                        │        │
│                 │   │ description  │                        │        │
│                 │   │ price        │                        │        │
│                 │   │ salePrice    │                        │        │
│                 │   │ image        │                        │        │
│                 │   │ category     │                        │        │
│                 │   │ featured     │                        │        │
│                 │   └──────────────┘                        │        │
│                 │                                           │        │
│                 │   ┌──────────────┐                        │        │
│                 │   │   Meeting    │                        │        │
│                 │   ├──────────────┤                        │        │
│                 └───│ businessId   │                        │        │
│                     │ guestName    │                        │        │
│                     │ guestEmail   │                        │        │
│                     │ startTime    │                        │        │
│                     │ endTime      │                        │        │
│                     │ status       │                        │        │
│                     │ calendarEventId│                      │        │
│                     └──────────────┘                        │        │
│                                                             │        │
│  ┌──────────────┐       ┌──────────────┐                   │        │
│  │     Lead     │       │    Order     │                   │        │
│  ├──────────────┤       ├──────────────┤                   │        │
│  │ id (PK)      │       │ id (PK)      │                   │        │
│  │ siteId (FK)  │◄──────│ siteId (FK)  │◄──────────────────┘        │
│  │ name         │       │ orderId      │                            │
│  │ email        │       │ customerName │                            │
│  │ phone        │       │ customerEmail│                            │
│  │ message      │       │ items (JSON) │                            │
│  │ status       │       │ total        │                            │
│  │ variant      │       │ status       │                            │
│  │ source       │       └──────────────┘                            │
│  └──────────────┘                                                    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Key Models

#### User
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String?
  businesses Business[]
}
```

#### Business
```prisma
model Business {
  id               String   @id @default(uuid())
  userId           String
  name             String
  description      String?
  sourceUrl        String?  // Original scraped URL
  logo             String?
  heroImage        String?
  primaryColor     String   @default("#6366f1")
  businessType     String   @default("service")
  services         String?  // JSON array
  phone            String?
  email            String?
  address          String?
  socialLinks      String?  // JSON object
  calendarConnected Boolean @default(false)
  calendarTokens    String? // Encrypted Google tokens
  meetingDuration   Int     @default(30)
  
  user     User      @relation(...)
  site     Site?
  products Product[]
  meetings Meeting[]
}
```

#### Site (with A/B Testing)
```prisma
model Site {
  id           String  @id @default(uuid())
  businessId   String  @unique
  slug         String  @unique
  headline     String
  subheadline  String?
  heroVariant  String  @default("A") // "A" or "B"
  viewsA       Int     @default(0)
  viewsB       Int     @default(0)
  conversionsA Int     @default(0)
  conversionsB Int     @default(0)
  // AI-enhanced metadata
  tagline      String?
  valuePropositions String? // JSON array
  serviceDescriptions String? // JSON array
}
```

#### Lead Status Enum
```prisma
enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}
```

---

## Data Flow & User Journey

### Complete User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. DISCOVERY                                                            │
│  ┌──────────┐                                                           │
│  │ Landing  │ ──► User sees value proposition                           │
│  │  Page    │     "Create website in 5 minutes from any URL"            │
│  └────┬─────┘                                                           │
│       │                                                                  │
│       ▼                                                                  │
│  2. SIGNUP/LOGIN                                                         │
│  ┌──────────┐                                                           │
│  │  Auth    │ ──► Email + Password                                      │
│  │  Flow    │     JWT session created                                   │
│  └────┬─────┘                                                           │
│       │                                                                  │
│       ▼                                                                  │
│  3. URL INPUT                                                            │
│  ┌──────────┐                                                           │
│  │ /create  │ ──► User enters business URL or social link               │
│  │  Page    │     Examples:                                             │
│  └────┬─────┘     • https://mybusiness.com                              │
│       │           • instagram.com/mybrand                                │
│       │           • facebook.com/mybusiness                              │
│       ▼                                                                  │
│  4. SCRAPING (analyzeUrl Server Action)                                  │
│  ┌──────────┐                                                           │
│  │Production│ ──► Detects source type                                   │
│  │ Scraper  │     Multi-strategy extraction                             │
│  └────┬─────┘     Multi-page crawling (if website)                      │
│       │           Returns ScrapedData                                    │
│       ▼                                                                  │
│  5. AI ENHANCEMENT                                                       │
│  ┌──────────┐                                                           │
│  │ Cohere   │ ──► Generates headlines, CTAs                             │
│  │   AI     │     Creates value propositions                            │
│  └────┬─────┘     Writes about text                                     │
│       │                                                                  │
│       ▼                                                                  │
│  6. PREVIEW & CUSTOMIZE                                                  │
│  ┌──────────┐                                                           │
│  │  Live    │ ──► Real-time preview of generated site                   │
│  │ Preview  │     User can edit:                                        │
│  └────┬─────┘     • Business name                                       │
│       │           • Colors                                               │
│       │           • Services                                             │
│       ▼           • Contact info                                         │
│  7. SITE CREATION                                                        │
│  ┌──────────┐                                                           │
│  │createBus │ ──► Saves to database                                     │
│  │  iness() │     Generates unique slug                                 │
│  └────┬─────┘     Creates Site record                                   │
│       │                                                                  │
│       ▼                                                                  │
│  8. LIVE SITE                                                            │
│  ┌──────────┐                                                           │
│  │/sites/   │ ──► Public URL: /sites/{slug}                             │
│  │ {slug}   │     Mobile responsive                                     │
│  └────┬─────┘     Industry-specific template                            │
│       │           A/B variant assignment                                 │
│       ▼                                                                  │
│  9. LEAD CAPTURE                                                         │
│  ┌──────────┐                                                           │
│  │Contact   │ ──► Visitor fills form                                    │
│  │  Form    │     Lead saved to DB                                      │
│  └────┬─────┘     Owner notified via email                              │
│       │           A/B conversion tracked                                 │
│       ▼                                                                  │
│  10. CRM DASHBOARD                                                       │
│  ┌──────────┐                                                           │
│  │/dashboard│ ──► View all leads                                        │
│  │ /leads   │     Update status                                         │
│  └──────────┘     Track conversions                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API Reference

### Server Actions (Backend)

#### `actions/auth.ts`
| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `signUp` | email, password, name | `{success, error}` | Create new user |
| `signIn` | email, password | `{success, error}` | Authenticate user |
| `signOut` | - | redirect | Clear session |

#### `actions/business.ts`
| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `analyzeUrl` | url: string | `AnalyzeResult` | Scrape & analyze URL |
| `createBusiness` | data: CreateBusinessInput | `{success, businessId}` | Create business + site |
| `updateBusiness` | id, data | `{success}` | Update business details |
| `deleteBusiness` | id | `{success}` | Delete business + site |
| `getBusinesses` | - | `Business[]` | Get user's businesses |

#### `actions/leads.ts`
| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `createLead` | siteId, name, email, phone, message | `{success, leadId}` | Create new lead |
| `getLeadsForUser` | - | `Lead[]` | Get all user's leads |
| `updateLeadStatus` | leadId, status | `{success}` | Update lead status |

#### `actions/meetings.ts`
| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getMeetings` | businessId | `Meeting[]` | Get scheduled meetings |
| `createMeeting` | businessId, data | `{success}` | Create calendar event |

### API Routes

#### `POST /api/booking/[slug]/slots`
Get available time slots for booking.

**Request:**
```json
{
  "date": "2026-02-10"
}
```

**Response:**
```json
{
  "slots": [
    { "start": "09:00", "end": "09:30", "available": true },
    { "start": "09:30", "end": "10:00", "available": false }
  ]
}
```

#### `GET /api/auth/google`
Initiates Google OAuth flow for calendar connection.

#### `GET /api/auth/google/callback`
Handles OAuth callback and stores tokens.

---

## Business Type Templates

HackSquad includes 11 industry-specific templates:

| Template | Use Case | Key Features |
|----------|----------|--------------|
| **Restaurant** | Cafes, Bakeries, Bars | Menu display, Hours, Order CTA |
| **Healthcare** | Clinics, Dentists, Therapy | Appointment booking, Services |
| **Fitness** | Gyms, Yoga Studios | Class schedules, Membership |
| **Beauty** | Salons, Spas | Service menu, Booking |
| **Real Estate** | Realtors, Brokers | Property listings, Contact |
| **Education** | Schools, Tutors, Courses | Course catalog, Enrollment |
| **Agency** | Marketing, Creative | Portfolio, Case studies |
| **Portfolio** | Freelancers, Artists | Gallery, Projects |
| **E-commerce** | Online Shops | Product grid, Cart, Checkout |
| **Service** | General Services | Service list, Lead form |
| **Startup** | Tech Companies | Features, Pricing, CTA |

### Template Selection Logic

```typescript
function getTemplateForBusinessType(businessType: string) {
  const type = businessType.toLowerCase();
  
  if (['restaurant', 'cafe', 'bakery', 'food'].some(t => type.includes(t))) {
    return 'restaurant';
  }
  if (['healthcare', 'medical', 'clinic', 'doctor'].some(t => type.includes(t))) {
    return 'healthcare';
  }
  // ... additional mappings
  
  return 'service'; // default fallback
}
```

---

## Security & Authentication

### Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │    │  Login   │    │  Server  │    │ Database │
│ Browser  │    │  Form    │    │  Action  │    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ Enter creds   │               │               │
     │──────────────►│               │               │
     │               │ signIn()      │               │
     │               │──────────────►│               │
     │               │               │ Find user     │
     │               │               │──────────────►│
     │               │               │◄──────────────│
     │               │               │ Verify bcrypt │
     │               │               │               │
     │               │               │ Create JWT    │
     │               │◄──────────────│               │
     │ Set cookie    │               │               │
     │◄──────────────│               │               │
     │               │               │               │
     │ Redirect      │               │               │
     │ /dashboard    │               │               │
     └───────────────┴───────────────┴───────────────┘
```

### Security Measures

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **Session Tokens**: JWT with 7-day expiration
3. **HTTP-Only Cookies**: Prevents XSS token theft
4. **CSRF Protection**: Same-site cookie policy
5. **Route Protection**: Middleware checks session
6. **Input Validation**: Server-side validation

### Protected Routes

```typescript
// middleware.ts
const protectedRoutes = ['/dashboard', '/create', '/api/business'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const isProtected = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtected && !session) {
    return NextResponse.redirect('/login');
  }
}
```

---

## Integrations

### 1. Cohere AI

**Purpose**: AI-powered content generation

**Configuration**:
```env
COHERE_API_KEY=your_cohere_api_key
```

**Usage**:
```typescript
const content = await generateBusinessContent({
  businessName: "Daisy Rose Garden Design",
  businessType: "service",
  services: ["Garden Design", "Landscaping"],
  description: "Professional garden design in Bath",
});
```

### 2. Google Calendar

**Purpose**: Meeting scheduling integration

**Configuration**:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Features**:
- OAuth 2.0 authentication
- Create calendar events
- Check availability slots
- Automatic meeting reminders

### 3. Email Service (Resend)

**Purpose**: Transactional emails

**Configuration**:
```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**Email Types**:
- Lead notifications to owners
- Auto-responses to leads
- Meeting confirmations

---

## Deployment Guide

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (recommended)

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# AI
COHERE_API_KEY=your_cohere_api_key

# Google Calendar (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Email (optional)
RESEND_API_KEY=
EMAIL_FROM=

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Vercel Deployment

1. **Connect Repository**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Import your GitHub repo
   - Configure environment variables

3. **Build Settings**
   ```json
   {
     "buildCommand": "prisma generate && prisma db push && next build",
     "outputDirectory": ".next"
   }
   ```

### Local Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

---

## Configuration Reference

### `package.json` Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server |
| `build` | `prisma generate && prisma db push && next build` | Production build |
| `start` | `next start` | Start production server |
| `db:push` | `prisma db push` | Push schema to database |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.4 | React framework |
| react | 19.2.3 | UI library |
| prisma | 7.3.0 | Database ORM |
| jose | 6.1.3 | JWT handling |
| bcryptjs | 3.0.3 | Password hashing |
| lucide-react | 0.563.0 | Icons |

---

## Feature Checklist

### ✅ Completed Features

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-platform scraping | ✅ | Instagram, Facebook, TikTok, Twitter, LinkedIn, websites |
| Multi-page crawling | ✅ | Services, Portfolio, Testimonials, Contact pages |
| Cart/checkout filtering | ✅ | Automatically skipped during scraping |
| AI content generation | ✅ | Cohere AI integration |
| 11 industry templates | ✅ | Restaurant to Startup |
| Lead capture forms | ✅ | On all templates |
| Lead CRM dashboard | ✅ | Status tracking |
| Email notifications | ✅ | Owner alerts, auto-responses |
| A/B testing | ✅ | Hero variant testing |
| Google Calendar | ✅ | Meeting scheduling |
| QR code generation | ✅ | For business cards |
| Mobile responsive | ✅ | All templates |
| Dark theme UI | ✅ | Pink accent branding |

### 🚧 Future Enhancements

| Feature | Priority | Notes |
|---------|----------|-------|
| Custom domains | High | Connect own domain |
| Payment processing | High | Stripe integration |
| SEO optimization | Medium | Meta tags, sitemap |
| Analytics dashboard | Medium | Visitor tracking |
| Email marketing | Medium | Campaign management |
| Multi-language | Low | i18n support |

---

## Summary

**HackSquad** is a production-ready MVP that demonstrates the power of combining:

1. **Intelligent Web Scraping** - Extract business data from any source
2. **AI Content Generation** - Create tailored marketing copy
3. **Modern Web Tech** - Next.js 16, React 19, Prisma
4. **Industry Templates** - 11 specialized designs
5. **Lead Management** - Full CRM capabilities
6. **Calendar Integration** - Google Calendar scheduling

The architecture is designed for:
- **Scalability** - SQLite → PostgreSQL migration path
- **Maintainability** - Clean separation of concerns
- **Extensibility** - Easy to add new templates/scrapers
- **Security** - JWT auth, bcrypt, HTTP-only cookies

**Total Lines of Code**: ~15,000+
**Key Files**: 50+
**Development Time**: Optimized for rapid iteration

---

*Generated by HackSquad Architecture Documentation*
