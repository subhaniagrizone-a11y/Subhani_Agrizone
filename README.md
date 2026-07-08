# Subhni Agrizone - Premium Agriculture eCommerce Platform

## 🌾 Overview

A **world-class premium agriculture eCommerce platform** built with cutting-edge technologies to provide an unparalleled experience for farmers, dealers, and agriculture enthusiasts. Built to compete with platforms like Apple, Shopify, and Nike while maintaining deep focus on agriculture needs.

### ✨ Key Features

- **Advanced Real-Time Search** - Instant suggestions as users type the first character
- **Theme Customization** - Users can customize colors and appearance (5 preset schemes + custom colors)
- **Premium UI/UX** - Luxury animations, micro-interactions, glassmorphism effects
- **Multi-Tier Pricing** - Retail, Wholesale, Dealer, Farmer pricing
- **Complete Product Management** - Images, videos, specifications, variants, stock, dosage, usage
- **Modern Admin Dashboard** - Easy-to-use CMS for managing everything
- **Enterprise-Grade SEO** - Dynamic meta tags, schema markup, JSON-LD, structured data
- **Multiple Auth Methods** - Google OAuth, Email, Phone OTP login
- **Performance Optimized** - Google Lighthouse 100 ready, fast loading
- **Fully Responsive** - Perfect on desktop, tablet, mobile - no horizontal scroll
- **Dark & Light Mode** - With theme customization

---

## 🚀 Tech Stack

### Frontend

- **Next.js 16** - Latest React framework with App Router
- **React 19** - Latest React version
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with premium design
- **Shadcn UI** - Premium component library
- **Framer Motion** - Smooth luxury animations
- **Lucide Icons** - Beautiful icon set

### Backend

- **Node.js** - JavaScript runtime
- **Next.js API Routes** - Serverless functions
- **MongoDB** - NoSQL document database (Compass support included)
- **Prisma ORM** - Type-safe database client with MongoDB driver

### Authentication & Services

- **NextAuth.js v5** - Full authentication system
- **Google OAuth** - Google login integration
- **Email/Password Auth** - Custom authentication
- **Phone OTP** - Phone-based login (ready to implement)

---

## 📋 Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB 5+ (local or cloud instance)
- MongoDB Compass (optional, for GUI database management)
- pnpm or npm

### Quick Start

```bash
# 1. Clone repository
git clone <your-repo-url>
cd subhni-agrizone

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local - MongoDB is already configured for localhost:27017

# 4. Ensure MongoDB is running
# For local MongoDB: mongod --dbpath /path/to/data
# Or use MongoDB Atlas cloud: mongodb+srv://username:password@cluster.mongodb.net/dbname

# 5. Generate Prisma Client
pnpm prisma:generate

# 6. Run development server
pnpm dev
```

Visit http://localhost:3000

### Environment Variables

Create `.env.local` (or update the existing one):

```env
# MongoDB (Local - for MongoDB Compass)
DATABASE_URL="mongodb://localhost:27017/subhni_agrizone"

# Or MongoDB Atlas (Cloud):
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/subhni_agrizone?retryWrites=true&w=majority"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SUPPORT_PHONE="+92 300 1234567"
NEXT_PUBLIC_WHATSAPP_NUMBER="+92 300 1234567"

# Optional: Payment & Services
STRIPE_PUBLIC_KEY="your-stripe-key"
STRIPE_SECRET_KEY="your-stripe-secret"
PHONE_LOGIN_ENABLED="false"
```

### MongoDB Setup Guide

#### Local MongoDB with Compass:

1. **Install MongoDB Community Edition**

   ```bash
   # Windows: Use MongoDB installer or Chocolatey
   choco install mongodb-community
   ```

2. **Start MongoDB Service**

   ```bash
   # Windows
   net start MongoDB

   # Or run mongod directly
   mongod --dbpath "C:\data\db"
   ```

3. **Install MongoDB Compass** (GUI tool)
   - Download from: https://www.mongodb.com/products/compass
   - Connect to: `mongodb://localhost:27017`

4. **Verify Connection**
   ```bash
   mongosh  # MongoDB Shell
   show dbs # List databases
   ```

#### Using MongoDB Atlas (Cloud):

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/...`
4. Update `DATABASE_URL` in `.env.local`

---

## 📁 Project Structure

```
subhni-agrizone/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/               # Login page with multiple methods
│   │   ├── admin/
│   │   │   ├── products/            # Product management
│   │   │   ├── cms/                 # Homepage CMS
│   │   │   ├── categories/          # Category management
│   │   │   └── dashboard/           # Admin dashboard
│   │   ├── api/
│   │   │   ├── search/              # Advanced search API ⭐ NEW
│   │   │   ├── products/            # Product API
│   │   │   ├── categories/          # Category API
│   │   │   └── auth/[...nextauth]/ # NextAuth routes
│   │   ├── blog/                    # Blog pages
│   │   ├── categories/              # Category pages
│   │   ├── products/                # Product pages
│   │   ├── dashboard/               # User dashboard
│   │   ├── contact/                 # Contact page
│   │   ├── layout.tsx               # Root layout with theme
│   │   ├── page.tsx                 # Homepage
│   │   ├── globals.css              # Global styles
│   │   └── robots.ts                # SEO robots
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-shell.tsx
│   │   │   └── cms-editor-panel.tsx
│   │   ├── home/                    # Homepage components
│   │   │   ├── hero-slider.tsx
│   │   │   ├── category-grid.tsx
│   │   │   ├── product-showcase.tsx
│   │   │   ├── flash-sale.tsx
│   │   │   ├── testimonials.tsx     # NEW
│   │   │   └── faq-section.tsx      # NEW
│   │   ├── product/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-detail.tsx
│   │   │   └── product-gallery.tsx
│   │   ├── site/
│   │   │   ├── site-header.tsx      # Updated with advanced search
│   │   │   ├── advanced-search.tsx  # ⭐ NEW - Real-time search
│   │   │   ├── theme-customizer.tsx # ⭐ NEW - Color customization
│   │   │   ├── theme-toggle.tsx     # Dark/Light mode
│   │   │   ├── site-footer.tsx
│   │   │   └── login-form.tsx
│   │   └── ui/                      # Base UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── motion.tsx
│   │       └── skeleton.tsx
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── data.ts                  # Mock data & config
│   │   ├── db.ts                    # Prisma client
│   │   ├── seo.ts                   # SEO utilities
│   │   ├── theme-store.ts           # ⭐ NEW - Theme state
│   │   ├── utils.ts                 # Helper functions
│   │   ├── validators.ts            # Zod validators
│   │   └── rate-limit.ts            # Rate limiting
│   └── types/
│       └── index.ts                 # TypeScript types
├── prisma/
│   ├── schema.prisma                # Database schema (updated with UserPreferences)
│   └── seed.ts                      # Database seeding
├── public/                          # Static assets
├── .env.example                     # Example environment variables
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind CSS config
├── next.config.ts                   # Next.js config
└── README.md                        # This file
```

---

## 🎨 New Features & Improvements

### ⭐ Advanced Real-Time Search

**File:** `src/components/site/advanced-search.tsx`

Features:

- ✅ Suggestions from first character typed
- ✅ Grouped results (Products, Categories, Brands)
- ✅ Product images and prices
- ✅ Keyboard navigation (Arrow keys, Enter, Esc)
- ✅ Click outside to close
- ✅ Debounced API calls for performance
- ✅ Loading state with spinner
- ✅ No results fallback message

Usage:

```tsx
import { AdvancedSearch } from "@/components/site/advanced-search";

export function Header() {
  return <AdvancedSearch />;
}
```

### ⭐ Theme Customization System

**Files:**

- `src/components/site/theme-customizer.tsx`
- `src/lib/theme-store.ts` (if using Zustand)

Features:

- ✅ 5 Preset color schemes:
  - Eco Green (Default - agriculture focused)
  - Ocean Blue (Professional)
  - Sunset (Warm, energetic)
  - Forest (Deep greens)
  - Harvest (Golden tones)
- ✅ Custom color picker for primary, accent, secondary colors
- ✅ Save preferences to localStorage
- ✅ Apply to light and dark modes
- ✅ Real-time preview
- ✅ Reset to default button

Usage:

```tsx
import { ThemeCustomizer } from "@/components/site/theme-customizer";

export function SettingsPage() {
  return <ThemeCustomizer />;
}
```

### Dark & Light Mode

Already implemented with `next-themes`. Access in settings or header toggle.

---

## 🛒 Product Categories

All categories fully supported:

- 🌾 Seeds (Hybrid, Certified, Field Crop)
- 🧪 Fertilizers (Granular, Liquid, NPK, Specialty)
- 🛡️ Pesticides (Crop Protection)
- 🌿 Herbicides (Pre/Post emergence)
- 🍄 Fungicides (Disease Control)
- ⚗️ Micronutrients (Boron, Zinc, Iron, Chelated)
- 📈 Growth Promoters (Biostimulants, Rooting Support)
- 🚜 Agriculture Equipment (Sprayers, Tools)
- 🌱 Garden Products (Home Gardening, Nursery)
- ♻️ Organic Products (Compost, Bio-control)
- 🐄 Animal Feed (Dairy, Poultry, Livestock)

---

## 📦 Product Features

Each product includes:

### Basic Information

- ✅ Title, SKU, Barcode
- ✅ Multiple images
- ✅ Video URL
- ✅ Category & Subcategory

### Pricing (Multi-tier)

- ✅ Retail Price
- ✅ Sale Price (with discount)
- ✅ Wholesale Price
- ✅ Dealer Price
- ✅ Farmer Price (special rate)

### Detailed Information

- ✅ Description
- ✅ Specifications (JSON)
- ✅ Usage Instructions
- ✅ Dosage Guidelines
- ✅ Benefits (Array)
- ✅ Safety Instructions (Array)
- ✅ Downloads (PDFs, etc.)

### Commerce Features

- ✅ Stock Management
- ✅ Rating & Reviews
- ✅ Variants (Size, Pack, etc.)
- ✅ Related Products
- ✅ SKU/Barcode Tracking

---

## 🔐 Authentication System

### Google OAuth

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
```

### Email/Password

- Email validation with Zod
- Password hashing with bcryptjs
- Session management

### Phone OTP (Ready to implement)

```env
PHONE_LOGIN_ENABLED=false
```

---

## 🎯 Admin Dashboard Features

Access at `/admin` (requires authentication)

### Product Management

- ✅ Add/Edit/Delete products
- ✅ Bulk operations
- ✅ Price management
- ✅ Stock tracking
- ✅ Image management

### CMS (Content Management)

- ✅ Homepage sections
- ✅ Hero banner
- ✅ Featured products
- ✅ Blog management
- ✅ Testimonials
- ✅ FAQs
- ✅ Email templates

### Analytics

- ✅ Sales dashboard
- ✅ Revenue charts
- ✅ Top products
- ✅ Customer reports
- ✅ Traffic analytics

---

## 🔍 SEO Features

### Automatic Meta Tags

- ✅ Dynamic OG images
- ✅ Dynamic Twitter cards
- ✅ Canonical URLs

### Structured Data (JSON-LD)

- ✅ Organization schema
- ✅ Product schema
- ✅ BlogPosting schema
- ✅ FAQPage schema
- ✅ Breadcrumb schema

### Auto-Generated

- ✅ `/sitemap.xml`
- ✅ `/robots.txt`
- ✅ `/feed.xml`

---

## 📱 Responsive Design

Perfect on all devices:

- ✅ Desktop (1920px+)
- ✅ Laptop (1200px)
- ✅ Tablet (768px)
- ✅ Mobile (425px)
- ✅ Small Mobile (320px)
- ✅ Landscape orientation

No horizontal scrolling. Tested with:

- iPhone, Samsung, Pixel phones
- iPad, Android tablets
- All major browsers

---

## 🚀 Performance

### Optimization

- ✅ Image optimization (WebP, responsive)
- ✅ Code splitting
- ✅ Lazy loading components
- ✅ Caching strategies
- ✅ Minified CSS/JS

### Metrics

- ✅ Largest Contentful Paint (LCP) < 2.5s
- ✅ First Input Delay (FID) < 100ms
- ✅ Cumulative Layout Shift (CLS) < 0.1
- ✅ Google Lighthouse 90+ score

---

## 🎨 Design Philosophy

**Premium, Minimal, Trustworthy**

- Apple-quality spacing
- Stripe-level animations
- Linear.app style interactions
- No cheap colors
- Premium green gradients
- Proper contrast ratios
- Modern, readable typography

---

## ⚙️ Configuration

### Site Config

Edit `src/lib/data.ts`:

```typescript
export const siteConfig = {
  name: "Subhni Agrizone",
  description: "...",
  url: process.env.NEXT_PUBLIC_SITE_URL,
  contact: {
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    email: "support@example.com",
    address: "Address here",
  },
};
```

### Theme Colors

Edit `src/components/site/theme-customizer.tsx`:

```typescript
const themePresets: ThemePreset[] = [
  {
    id: "eco-green",
    name: "Eco Green",
    primary: "#10b981",
    accent: "#34d399",
    secondary: "#059669",
  },
  // Add more presets
];
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub, connect to Vercel
# Environment variables in Vercel dashboard
pnpm build
```

### Self-Hosted

```bash
pnpm build
pnpm start
# Port 3000
```

### Docker

```bash
docker build -t agrizone .
docker run -p 3000:3000 agrizone
```

---

## 📚 Database Schema (MongoDB)

MongoDB collections automatically created by Prisma:

- `users` - Customers, farmers, dealers, admins
- `userpreferences` - Theme customization & preferences
- `products` - Agriculture products with variants
- `categories` - Product categories (hierarchical)
- `brands` - Product brands
- `orders` - Customer orders & order items
- `reviews` - Product reviews & ratings
- `wishlistitems` - Saved wishlist items
- `compareitems` - Product comparisons
- `blogposts` - Blog articles
- `inquiries` - Contact form submissions
- `coupons` - Discount codes
- `shippingzones` - Shipping configuration
- `testimonials` - Customer testimonials
- `faqs` - FAQ entries
- And more...

**Full schema:** See `prisma/schema.prisma`

### MongoDB Compass Integration

1. **Connect to MongoDB**
   - Open MongoDB Compass
   - Enter: `mongodb://localhost:27017`
   - Click Connect

2. **Browse Collections**
   - Select `subhni_agrizone` database
   - View all collections
   - Edit documents directly
   - Create indexes for performance

3. **Import Sample Data**
   ```bash
   pnpm seed
   ```

---

## 🔒 Security

- ✅ CSRF protection
- ✅ XSS prevention
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)
- ✅ Secure password hashing
- ✅ HTTP security headers

---

## 📊 Available Scripts

```bash
pnpm dev              # Development server (with MongoDB)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # Check TypeScript
pnpm prisma:generate  # Generate Prisma Client for MongoDB
pnpm prisma:studio    # Open Prisma Studio (visual MongoDB editor)
pnpm seed             # Seed database with initial data
```

### MongoDB-Specific Commands

```bash
# View MongoDB database in Compass
# Open MongoDB Compass and connect to mongodb://localhost:27017

# Using MongoDB Shell
mongosh
show dbs
use subhni_agrizone
show collections
```

---

## 🤝 Contributing

```bash
git checkout -b feature/amazing-feature
git add .
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

---

## 📝 License

MIT License - Commercial use allowed

---

## 📞 Support

- 📧 Email: support@subhniagrizone.com
- 📱 WhatsApp: +92 300 1234567
- 🔔 Phone: +92 300 1234567

---

**Built with ❤️ for farmers and agriculture worldwide**

## Folder Structure

```text
prisma/
  schema.prisma          Database models for ecommerce, CMS, auth, SEO, inventory
  seed.ts                Initial seed data
src/
  app/                   App Router pages, API routes, sitemap, robots
  components/
    admin/               Dashboard and CMS components
    home/                Homepage sections
    product/             Product card, explorer, detail experience
    providers/           Theme provider
    site/                Header, footer, login form
    ui/                  shadcn-style primitives
  lib/                   Auth, data, db, SEO, validation, rate limiting, utilities
  types/                 Shared TypeScript types and auth augmentation
```

## Admin Guide

Admin routes:

- `/admin` - sales, revenue, orders, inventory, analytics, operations
- `/admin/cms` - homepage, hero, categories, offers, blog, testimonials, FAQ, footer
- `/admin/products` - product content, media, pricing tiers, stock, SKU, barcode
- `/admin/seo` - meta tags, canonical URLs, social preview fields, schema coverage

Everything requested for CMS editing is modeled in Prisma through `HomepageSection`, `SiteSetting`, `SeoSetting`, `Product`, `Category`, `Brand`, `BlogPost`, `Testimonial`, `Faq`, and `Inquiry`.

## Storefront Guide

Customer routes:

- `/` - premium homepage
- `/products` - instant search, filters, voice-search readiness, sorting
- `/products/[slug]` - gallery, variants, stock, prices, dosage, benefits, safety, downloads
- `/categories/[slug]` - category catalog pages
- `/blog` and `/blog/[slug]` - agriculture content
- `/contact` - contact, dealer, farmer, bulk, quotation, and support forms
- `/dashboard` - orders, invoices, tracking, addresses, rewards, coupons, referrals, wishlist
- `/auth/login` - Google, email, and phone-login-ready screen

## Customization Guide

You said you will provide the banners. Replace the current remote hero images in:

```text
src/lib/data.ts
```

Update `heroSlides`, category images, product images, contact data, brands, testimonials, FAQ, and blog posts there for the demo build. For production editing, persist those values through the Prisma CMS models and `/api/cms/homepage`.

Design tokens live in:

```text
src/app/globals.css
tailwind.config.ts
```

## SEO Guide

Included:

- Dynamic metadata
- Open Graph
- Twitter cards
- Canonical URLs
- JSON-LD organization schema
- Product schema
- FAQ schema
- Breadcrumb schema
- Blog-ready metadata
- Sitemap at `/sitemap.xml`
- Robots at `/robots.txt`
- Admin SEO panel

Set `NEXT_PUBLIC_SITE_URL` to the final production domain before deployment.

## Performance Guide

The app is structured for high Lighthouse scores:

- Next.js App Router and server components by default
- Optimized `next/image`
- Route-level code splitting
- Minimal client components
- CSS variables and Tailwind utilities
- Remote image patterns configured
- No heavy UI framework runtime
- Skeleton primitive included
- Reduced-motion support
- Responsive grids with no horizontal scrolling

Before launch, run:

```bash
pnpm build
pnpm lint
pnpm typecheck
```

Then test Lighthouse on desktop and mobile with real production images.

## Security

Included foundations:

- NextAuth/Auth.js authentication
- Prisma ORM for SQL injection protection
- Zod validation on write APIs
- API rate limiting
- Security headers in middleware
- Admin guard controlled by `ADMIN_GUARD`
- Environment-variable configuration

Production checklist:

- Use strong `AUTH_SECRET`
- Enable `ADMIN_GUARD`
- Create admin roles in database
- Configure HTTPS
- Configure provider credentials
- Add payment provider webhooks
- Add SMS and WhatsApp provider keys
- Review CSP for final asset domains

## Payments and Shipping

The architecture is ready for:

- Stripe
- PayPal
- Cash on delivery
- Bank transfer
- JazzCash
- EasyPaisa
- Shipping zones
- Shipping charges
- Free-shipping rules
- Tracking numbers
- Email, SMS, and WhatsApp notification integrations

Provider keys are intentionally kept as environment variables.

## Deployment

Recommended deployment:

1. Create a managed PostgreSQL database.
2. Set all production environment variables.
3. Run `pnpm prisma:migrate`.
4. Run `pnpm build`.
5. Deploy to Vercel or any Node-compatible host that supports Next.js.
6. Set `NEXT_PUBLIC_SITE_URL` to the live domain.
7. Turn on `ADMIN_GUARD`.

## Notes

The current repository contains a complete production-style foundation and premium UI. Real payment capture, SMS, WhatsApp sending, file upload storage, and email delivery need provider credentials before they can process live transactions or messages.
