# Subhani Agrizone

Subhani Agrizone is a Next.js commerce and CMS platform for agricultural products, dealer workflows, and customer support. This project keeps the existing UI and functionality intact while preparing it for deployment to GitHub, Vercel, and MongoDB Atlas.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- MongoDB Atlas / MongoDB
- NextAuth v5
- Vercel-ready serverless deployment

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the example file and set your local values:

```bash
copy .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open http://localhost:3000

## Required environment variables

Create a local `.env.local` file with values that match your own environment. The required production variable is:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/subhani_agrizone?retryWrites=true&w=majority"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_EMAIL="subhaniagrizone@gmail.com"
ADMIN_PASSWORD="replace-with-a-strong-admin-password"
```

Do not commit `.env` files or real secrets. Keep credentials in your local environment and Vercel environment variables.

## MongoDB Atlas setup

1. Create a MongoDB Atlas cluster.
2. Add a database user with a strong password.
3. Get the connection string for the cluster.
4. Set `MONGODB_URI` in local `.env.local` and in Vercel project settings.
5. Use the database name `subhani_agrizone` in the connection string.

> Rotate the MongoDB database password before production deployment if it was previously exposed in code or local files.

## Vercel deployment

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Use the framework preset: Next.js.
4. Add these environment variables in Vercel:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `NEXTAUTH_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL`
5. Trigger a production deployment.

## GitHub deployment workflow

```bash
git status
git add .
git commit -m "Prepare project for production deployment"
git push origin main
```

## Notes

- Do not commit `.env`, `.env.local`, or generated build artifacts.
- Use secure cookies and server-only env variables in production.
- Prefer `MONGODB_URI` and `AUTH_SECRET` from secure environment settings instead of hardcoded values.
- The current project already includes Prisma-based MongoDB models and a Next.js app router architecture, so the deployment work preserves the existing app rather than replacing it.

````

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
````

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
