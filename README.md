# 🚀 Hack Squad - Instant Business Launcher

**Powered by APE AI** | Transform any URL into a fully operational business website in 60 seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 What It Does

Paste any URL (website, Instagram, Facebook, etc.) → Get a complete business website with:
- ✅ Auto-extracted branding (logo, colors, images)
- ✅ Lead capture forms + Mini CRM
- ✅ Calendar booking integration
- ✅ A/B testing with analytics
- ✅ 11 industry-specific templates

**Target:** Micro businesses that need a professional web presence fast.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔗 **Multi-Platform Scraping** | Instagram, Facebook, Twitter/X, LinkedIn, TikTok, Google Business, any website |
| 🎙️ **Voice Input** | Describe your business using voice |
| 🎨 **Brand Extraction** | Auto-extracts colors, logo, images, products |
| 📝 **Lead Capture** | Built-in forms on every site |
| 📊 **Mini CRM** | Track leads: NEW → CONTACTED → BOOKED → CONVERTED |
| 📅 **Calendar** | Calendly integration for bookings |
| 🧪 **A/B Testing** | Automatic variant testing with tracking |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend:** Prisma ORM, SQLite, JWT Auth
- **Scraping:** Multi-strategy extraction, multi-page crawling

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone & install
git clone https://github.com/asnaarshad/SalesAPE_Website_Builder.git
cd hack-squad
npm install

# Setup environment
cp .env.example .env

# Initialize database
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 Project Structure

```
src/
├── actions/          # Server actions (auth, business, leads)
├── app/              # Next.js pages & API routes
├── components/       # UI + 11 business templates
└── lib/              # Scraper, AI content, utilities
```

---

## 📱 Templates

Restaurant • Healthcare • Fitness • Beauty • Real Estate • Education • Agency • Portfolio • Service • E-commerce • Startup

---

## 📄 License

MIT License

---

## 👥 Team

**Hack Squad** - Built for SalesAPE Hackathon 2026

<p align="center">Built with 💗 for SalesAPE</p>
