import type {
  BlogPost,
  Brand,
  Category,
  CmsSection,
  FaqItem,
  Product,
  Testimonial,
} from "@/types";
import { normalizePkPhone } from "@/lib/utils";

export const siteConfig = {
  name: "Subhani Agrizone",
  tagline: "Growing Trust, Harvesting Success.",
  taglineUrdu:
    "ہم معیاری زرعی مصنوعات کے ذریعے کسانوں کی کامیابی کے ساتھی ہیں۔",
  description:
    "Subhani Agrizone is a trusted agriculture company providing premium seeds, fertilizers, pesticides, herbicides, fungicides, micronutrients, equipment, and expert farming solutions for Pakistani farmers.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    phone: normalizePkPhone(
      process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+923007172382",
    ),
    phone2: normalizePkPhone(
      process.env.NEXT_PUBLIC_SUPPORT_PHONE_2 ?? "+923167330089",
    ),
    whatsapp: normalizePkPhone(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+923007172382",
    ),
    whatsapp2: normalizePkPhone(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2 ?? "+923167330089",
    ),
    email: "subhaniagrizone@gmail.com",
    salesEmail: "subhaniagrizone@gmail.com",
    supportEmail: "subhaniagrizone@gmail.com",
    senderName: "Sikandar Subhani",
    address: "Gujranwala Road, Near Faisal Motors, Pakistan",
    mapsUrl: "https://maps.app.goo.gl/o7r273zdRKZRVG8r5",
    workingHours: "Monday - Saturday, 08:00 AM - 05:00 PM",
  },
  socials: {
    facebook: "https://www.facebook.com/569121816289640",
    instagram: "https://www.instagram.com/s_agrizone1",
    youtube: "https://www.youtube.com/@SubhaniAgrizone",
    linkedin: "https://www.linkedin.com/in/subhani-agrizone-483317420",
    tiktok: "https://www.tiktok.com/@subhani.agri.zone",
    x: "https://x.com/subhaniagrizone",
  },
  payment: {
    bankName: "UBL",
    accountTitle: "SUBHANI AGRIZONE",
    iban: "PK55UNIL0109000318708043",
    accountNumber: "0666318708043",
    instructions:
      "After transfer, add transaction reference in checkout so support can verify your payment quickly.",
  },
};

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about-us" },
  { label: "Categories", href: "/categories" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export const heroSlides = [
  {
    eyebrow: "Premium crop inputs",
    title: "Farm smarter with verified agriculture products",
    description:
      "Seeds, fertilizers, crop protection, sprayers, and expert-backed farm supplies delivered with transparent pricing.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=85",
    href: "/products",
  },
  {
    eyebrow: "Season-ready bundles",
    title: "Everything farmers need before the weather turns",
    description:
      "Curated seasonal kits, dosage guidance, wholesale pricing, and fast support on call or WhatsApp.",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1800&q=85",
    href: "/categories/seeds",
  },
  {
    eyebrow: "Dealer-grade commerce",
    title: "Bulk inquiry, dealer price, and quotation in one flow",
    description:
      "A professional buying experience for farmers, dealers, nurseries, and institutional buyers.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85",
    href: "/contact",
  },
];

export const categories: Category[] = [
  {
    name: "Seeds",
    slug: "seeds",
    description: "Hybrid, certified, vegetable, and field crop seeds.",
    icon: "Sprout",
    image:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=900&q=80",
    productCount: 186,
    accent: "from-emerald-500 to-lime-400",
  },
  {
    name: "Fertilizers",
    slug: "fertilizers",
    description: "Granular, liquid, NPK, and speciality nutrition.",
    icon: "FlaskConical",
    image:
      "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=900&q=80",
    productCount: 142,
    accent: "from-green-600 to-teal-400",
  },
  {
    name: "Pesticides",
    slug: "pesticides",
    description: "Crop protection products with safety guidance.",
    icon: "ShieldCheck",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
    productCount: 98,
    accent: "from-teal-600 to-sky-400",
  },
  {
    name: "Herbicides",
    slug: "herbicides",
    description: "Weed control for pre and post emergence.",
    icon: "Leaf",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
    productCount: 64,
    accent: "from-emerald-700 to-green-500",
  },
  {
    name: "Fungicides",
    slug: "fungicides",
    description: "Disease control and crop health protection.",
    icon: "BadgeCheck",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=900&q=80",
    productCount: 73,
    accent: "from-cyan-600 to-emerald-400",
  },
  {
    name: "Micronutrients",
    slug: "micronutrients",
    description: "Boron, zinc, iron, calcium, and chelated formulas.",
    icon: "Atom",
    image:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=80",
    productCount: 58,
    accent: "from-lime-600 to-yellow-400",
  },
  {
    name: "Growth Promoters",
    slug: "growth-promoters",
    description: "Biostimulants, boosters, and rooting support.",
    icon: "TrendingUp",
    image:
      "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=900&q=80",
    productCount: 49,
    accent: "from-green-500 to-emerald-300",
  },
  {
    name: "Agriculture Equipment",
    slug: "agriculture-equipment",
    description: "Tools, accessories, and field-ready equipment.",
    icon: "Tractor",
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
    productCount: 121,
    accent: "from-slate-700 to-emerald-500",
  },
  {
    name: "Sprayers",
    slug: "sprayers",
    description: "Battery, manual, boom, and pressure sprayers.",
    icon: "SprayCan",
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=900&q=80",
    productCount: 37,
    accent: "from-blue-600 to-emerald-400",
  },
  {
    name: "Garden Products",
    slug: "garden-products",
    description: "Home gardening, nursery, and landscaping supplies.",
    icon: "Flower2",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
    productCount: 96,
    accent: "from-rose-500 to-emerald-400",
  },
  {
    name: "Organic Products",
    slug: "organic-products",
    description: "Compost, bio-control, and residue-conscious inputs.",
    icon: "Recycle",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    productCount: 83,
    accent: "from-lime-700 to-amber-400",
  },
  {
    name: "Animal Feed",
    slug: "animal-feed",
    description: "Nutrition for dairy, poultry, and livestock.",
    icon: "Wheat",
    image:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80",
    productCount: 42,
    accent: "from-amber-600 to-green-500",
  },
];

export const brands: Brand[] = [
  {
    name: "AgriNova",
    slug: "agrinova",
    logo: "AN",
    description: "Certified crop nutrition and biological inputs.",
  },
  {
    name: "CropShield",
    slug: "cropshield",
    logo: "CS",
    description: "Reliable crop protection for commercial growers.",
  },
  {
    name: "SeedPrime",
    slug: "seedprime",
    logo: "SP",
    description: "High germination hybrid and certified seeds.",
  },
  {
    name: "FieldPro",
    slug: "fieldpro",
    logo: "FP",
    description: "Durable equipment and sprayer systems.",
  },
  {
    name: "BioRoot",
    slug: "bioroot",
    logo: "BR",
    description: "Organic soil health and growth support.",
  },
];

export const products: Product[] = [];

export const testimonials: Testimonial[] = [
  {
    name: "Ali Raza",
    role: "Progressive farmer, Multan",
    quote:
      "The product guidance, quick delivery, and clear dosage notes saved us time during the maize season.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Sana Farms",
    role: "Vegetable grower, Lahore",
    quote:
      "Bulk inquiry and WhatsApp support made purchasing far easier than calling multiple shops.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Khan Agro Dealer",
    role: "Dealer partner, Faisalabad",
    quote:
      "Dealer pricing, invoice downloads, and stock visibility make repeat ordering smooth.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80",
  },
];

export const faqs: FaqItem[] = [
  {
    question: "Can farmers request product guidance before buying?",
    answer:
      "Yes. Every product includes inquiry, WhatsApp, and call actions so customers can confirm crop fit, dosage, and availability.",
  },
  {
    question: "Do you support wholesale and dealer pricing?",
    answer:
      "Yes. Products support retail, wholesale, dealer, and farmer prices with quotation workflows for bulk orders.",
  },
  {
    question: "Can banners and homepage content be changed without coding?",
    answer:
      "Yes. The admin CMS is structured for editing hero banners, sections, categories, products, blog, testimonials, FAQs, SEO, and contact data.",
  },
  {
    question: "Which payment methods are prepared?",
    answer:
      "The architecture is ready for Stripe, PayPal, COD, bank transfer, JazzCash, and EasyPaisa configuration.",
  },
];

export const blogPosts: BlogPost[] = [];

export const cmsSections: CmsSection[] = [
  {
    key: "hero",
    title: "Hero Banner",
    status: "Published",
    updatedAt: "Today",
    fields: ["Slides", "Buttons", "Images", "Mobile crop", "SEO title"],
  },
  {
    key: "categories",
    title: "Category Grid",
    status: "Published",
    updatedAt: "Today",
    fields: ["Name", "Slug", "Icon", "Image", "Sort order"],
  },
  {
    key: "products",
    title: "Product Catalog",
    status: "Published",
    updatedAt: "Yesterday",
    fields: ["Media", "Variants", "Prices", "Stock", "Dosage", "Downloads"],
  },
  {
    key: "offers",
    title: "Offers and Flash Sale",
    status: "Scheduled",
    updatedAt: "2 days ago",
    fields: ["Timer", "Discount", "Coupon", "Collections"],
  },
  {
    key: "blog",
    title: "Blog and Success Stories",
    status: "Published",
    updatedAt: "3 days ago",
    fields: ["Article", "Schema", "Author", "Cover image"],
  },
  {
    key: "footer",
    title: "Footer and Social Links",
    status: "Published",
    updatedAt: "This week",
    fields: ["Contact", "Socials", "Policies", "Newsletter"],
  },
];

export const adminMetrics = [
  { label: "Revenue", value: "Rs. 0", change: "0%" },
  { label: "Orders", value: "0", change: "0%" },
  { label: "Conversion", value: "0%", change: "0%" },
  { label: "Low Stock", value: "0", change: "0" },
];

export const recentOrders: {
  id: string;
  customer: string;
  city: string;
  total: string;
  status: string;
}[] = [];

export const homepageStats = [
  { label: "Verified products", value: "0" },
  { label: "Dealer partners", value: "0" },
  { label: "Cities served", value: "0" },
  { label: "Avg. support reply", value: "0" },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];
  return products.filter((product) => product.category === category.name);
}
