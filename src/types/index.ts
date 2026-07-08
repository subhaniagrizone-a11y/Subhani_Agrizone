export type PriceTier = "retail" | "wholesale" | "dealer" | "farmer";

export type Category = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  productCount: number;
  accent: string;
};

export type Brand = {
  name: string;
  slug: string;
  logo: string;
  description: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  barcode: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  salePrice: number;
  wholesalePrice: number;
  dealerPrice: number;
  farmerPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  badge: string;
  images: string[];
  videoUrl: string;
  shortDescription: string;
  description: string;
  specifications: Record<string, unknown>;
  usage: string;
  dosage: string;
  benefits: string[];
  safetyInstructions: string[];
  downloads: { label: string; href: string }[];
  variants: { name: string; values: string[] }[];
  related: string[];
};

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
};

export type CmsSection = {
  key: string;
  title: string;
  status: "Published" | "Draft" | "Scheduled";
  updatedAt: string;
  fields: string[];
};
