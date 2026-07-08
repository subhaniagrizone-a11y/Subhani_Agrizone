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

export const products: Product[] = [
  {
    id: "prod-seed-001",
    title: "Hybrid Maize Seed Premium 10kg",
    slug: "hybrid-maize-seed-premium-10kg",
    sku: "SAG-SEED-MAIZE-10",
    barcode: "8964001000010",
    brand: "SeedPrime",
    category: "Seeds",
    subcategory: "Field Crop Seeds",
    price: 12800,
    salePrice: 11950,
    wholesalePrice: 11100,
    dealerPrice: 10650,
    farmerPrice: 11400,
    rating: 4.9,
    reviews: 214,
    stock: 86,
    badge: "Best Seller",
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "High germination maize seed designed for strong stand establishment and uniform crop growth.",
    description:
      "A premium hybrid maize seed selected for vigorous emergence, yield stability, and strong field performance across common Pakistani maize belts.",
    specifications: {
      Pack: "10kg",
      Germination: "90%+",
      Crop: "Maize",
      Season: "Spring and autumn",
      Origin: "Certified import",
    },
    usage:
      "Prepare a fine seedbed, use recommended seed rate, and irrigate immediately after sowing where needed.",
    dosage: "8 to 10kg per acre depending on spacing and soil conditions.",
    benefits: [
      "Strong early vigor",
      "Uniform cob formation",
      "High stand establishment",
      "Suitable for commercial farms",
    ],
    safetyInstructions: [
      "Store in a cool and dry place",
      "Keep away from children and animals",
      "Do not use damaged or wet seed packs",
    ],
    downloads: [
      { label: "Technical sheet", href: "/downloads/maize-seed.pdf" },
    ],
    variants: [{ name: "Pack Size", values: ["5kg", "10kg", "20kg"] }],
    related: ["npk-balanced-fertilizer-25kg", "zinc-boron-micronutrient-1l"],
  },
  {
    id: "prod-fert-001",
    title: "NPK Balanced Fertilizer 25kg",
    slug: "npk-balanced-fertilizer-25kg",
    sku: "SAG-FERT-NPK-25",
    barcode: "8964001000027",
    brand: "AgriNova",
    category: "Fertilizers",
    subcategory: "NPK Fertilizers",
    price: 7600,
    salePrice: 6990,
    wholesalePrice: 6520,
    dealerPrice: 6200,
    farmerPrice: 6750,
    rating: 4.8,
    reviews: 171,
    stock: 132,
    badge: "Season Pick",
    images: [
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "Balanced nutrition for vegetative strength, root development, and crop uniformity.",
    description:
      "A dependable NPK fertilizer formulated for field crops, vegetables, orchards, and general farm nutrition plans.",
    specifications: {
      Pack: "25kg",
      Form: "Granular",
      Nutrients: "NPK plus trace elements",
      Application: "Basal and top dressing",
      Storage: "Dry warehouse",
    },
    usage:
      "Apply evenly near root zone and irrigate after application. Follow crop-specific agronomist advice.",
    dosage: "1 to 2 bags per acre depending on soil report and crop stage.",
    benefits: [
      "Balanced plant nutrition",
      "Improves crop color",
      "Supports root and shoot growth",
      "Easy field application",
    ],
    safetyInstructions: [
      "Wear gloves during handling",
      "Avoid inhaling dust",
      "Keep bags sealed after opening",
    ],
    downloads: [{ label: "Dosage guide", href: "/downloads/npk-guide.pdf" }],
    variants: [{ name: "Pack Size", values: ["10kg", "25kg", "50kg"] }],
    related: ["hybrid-maize-seed-premium-10kg", "organic-compost-booster-20kg"],
  },
  {
    id: "prod-micro-001",
    title: "Zinc Boron Micronutrient 1L",
    slug: "zinc-boron-micronutrient-1l",
    sku: "SAG-MIC-ZB-1L",
    barcode: "8964001000034",
    brand: "AgriNova",
    category: "Micronutrients",
    subcategory: "Chelated Micronutrients",
    price: 2450,
    salePrice: 2190,
    wholesalePrice: 1980,
    dealerPrice: 1850,
    farmerPrice: 2090,
    rating: 4.7,
    reviews: 93,
    stock: 44,
    badge: "Fast Moving",
    images: [
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "Liquid zinc and boron support for flowering, fruit setting, and deficiency correction.",
    description:
      "A premium micronutrient formula for foliar and fertigation use where zinc and boron deficiency affects crop quality.",
    specifications: {
      Pack: "1L",
      Form: "Liquid",
      Application: "Foliar or fertigation",
      Crops: "Vegetables, orchards, cotton, maize",
      Compatibility: "Check jar test before mixing",
    },
    usage:
      "Spray during active growth and avoid application during strong heat or wind.",
    dosage: "250ml to 500ml per acre in recommended water volume.",
    benefits: [
      "Improves flowering",
      "Supports fruit setting",
      "Corrects micronutrient deficiency",
      "Easy tank mixing",
    ],
    safetyInstructions: [
      "Use mask and gloves",
      "Do not spray against wind",
      "Wash hands after use",
    ],
    downloads: [
      { label: "Compatibility sheet", href: "/downloads/zinc-boron.pdf" },
    ],
    variants: [{ name: "Pack Size", values: ["500ml", "1L", "5L"] }],
    related: ["npk-balanced-fertilizer-25kg", "bio-root-growth-promoter-500ml"],
  },
  {
    id: "prod-crop-001",
    title: "Broad Spectrum Fungicide 500g",
    slug: "broad-spectrum-fungicide-500g",
    sku: "SAG-FUNG-500",
    barcode: "8964001000041",
    brand: "CropShield",
    category: "Fungicides",
    subcategory: "Disease Control",
    price: 3900,
    salePrice: 3590,
    wholesalePrice: 3300,
    dealerPrice: 3150,
    farmerPrice: 3450,
    rating: 4.6,
    reviews: 68,
    stock: 21,
    badge: "Low Stock",
    images: [
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "Protective and curative disease control for vegetables, orchards, and field crops.",
    description:
      "A professional fungicide for responsible disease control programs with clear handling and dosage guidance.",
    specifications: {
      Pack: "500g",
      Form: "Wettable powder",
      Mode: "Protective and curative",
      PHI: "Follow label",
      "Crop Stage": "As advised",
    },
    usage:
      "Apply at first disease symptoms or as part of a preventive schedule.",
    dosage: "Consult label and agronomist for crop-specific dose.",
    benefits: [
      "Broad disease spectrum",
      "Supports leaf health",
      "Useful in preventive programs",
      "Clear safety labeling",
    ],
    safetyInstructions: [
      "Read label before use",
      "Use protective gear",
      "Do not contaminate water channels",
    ],
    downloads: [
      { label: "Safety label", href: "/downloads/fungicide-safety.pdf" },
    ],
    variants: [{ name: "Pack Size", values: ["250g", "500g", "1kg"] }],
    related: ["battery-sprayer-pro-16l", "zinc-boron-micronutrient-1l"],
  },
  {
    id: "prod-equip-001",
    title: "Battery Sprayer Pro 16L",
    slug: "battery-sprayer-pro-16l",
    sku: "SAG-SPRAYER-16L",
    barcode: "8964001000058",
    brand: "FieldPro",
    category: "Sprayers",
    subcategory: "Battery Sprayers",
    price: 14500,
    salePrice: 13200,
    wholesalePrice: 12300,
    dealerPrice: 11850,
    farmerPrice: 12800,
    rating: 4.9,
    reviews: 306,
    stock: 57,
    badge: "Top Rated",
    images: [
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "Comfortable 16L battery sprayer with consistent pressure and field-ready accessories.",
    description:
      "A durable sprayer for crop protection, foliar nutrition, and garden use with ergonomic straps and serviceable parts.",
    specifications: {
      Capacity: "16L",
      Battery: "12V rechargeable",
      Nozzles: "Multiple included",
      Use: "Field and garden",
      Warranty: "Service support ready",
    },
    usage:
      "Charge fully before first use, clean tank after each spray, and store dry.",
    dosage: "Use product-specific water volume and nozzle settings.",
    benefits: [
      "Consistent pressure",
      "Comfortable shoulder support",
      "Multiple nozzles",
      "Easy maintenance",
    ],
    safetyInstructions: [
      "Do not store chemicals in tank",
      "Keep battery dry",
      "Clean nozzles after use",
    ],
    downloads: [
      { label: "User manual", href: "/downloads/sprayer-manual.pdf" },
    ],
    variants: [{ name: "Capacity", values: ["12L", "16L", "20L"] }],
    related: ["broad-spectrum-fungicide-500g", "weed-control-herbicide-1l"],
  },
  {
    id: "prod-herb-001",
    title: "Weed Control Herbicide 1L",
    slug: "weed-control-herbicide-1l",
    sku: "SAG-HERB-1L",
    barcode: "8964001000065",
    brand: "CropShield",
    category: "Herbicides",
    subcategory: "Post Emergence",
    price: 2850,
    salePrice: 2620,
    wholesalePrice: 2400,
    dealerPrice: 2260,
    farmerPrice: 2520,
    rating: 4.5,
    reviews: 74,
    stock: 69,
    badge: "Recommended",
    images: [
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "Post-emergence weed control with practical handling instructions and crop fit guidance.",
    description:
      "A field-grade herbicide for targeted weed control programs where proper timing and responsible application are essential.",
    specifications: {
      Pack: "1L",
      Form: "Liquid",
      Use: "Post emergence",
      Crops: "Crop dependent",
      Storage: "Locked chemical cabinet",
    },
    usage:
      "Apply only on labeled crops and timings. Avoid drift to sensitive crops.",
    dosage: "Use only according to label and agronomist advice.",
    benefits: [
      "Effective weed suppression",
      "Supports crop competition",
      "Convenient 1L pack",
      "Clear application timing",
    ],
    safetyInstructions: [
      "Do not spray in windy conditions",
      "Wear protective clothing",
      "Keep away from food and feed",
    ],
    downloads: [
      { label: "Label guide", href: "/downloads/herbicide-guide.pdf" },
    ],
    variants: [{ name: "Pack Size", values: ["500ml", "1L", "5L"] }],
    related: ["battery-sprayer-pro-16l", "broad-spectrum-fungicide-500g"],
  },
  {
    id: "prod-org-001",
    title: "Organic Compost Booster 20kg",
    slug: "organic-compost-booster-20kg",
    sku: "SAG-ORG-COMP-20",
    barcode: "8964001000072",
    brand: "BioRoot",
    category: "Organic Products",
    subcategory: "Soil Health",
    price: 4200,
    salePrice: 3890,
    wholesalePrice: 3600,
    dealerPrice: 3400,
    farmerPrice: 3720,
    rating: 4.8,
    reviews: 126,
    stock: 104,
    badge: "Organic",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "Organic matter support for soil structure, microbial activity, and steady crop growth.",
    description:
      "A compost booster suitable for growers aiming to improve soil health and reduce dependency on harsh input plans.",
    specifications: {
      Pack: "20kg",
      Form: "Granular compost blend",
      Use: "Soil amendment",
      Organic: "Yes",
      Crops: "Vegetables, orchards, nursery",
    },
    usage:
      "Broadcast and incorporate into soil before sowing or apply around plant root zones.",
    dosage: "1 to 4 bags per acre depending on soil condition.",
    benefits: [
      "Improves soil texture",
      "Supports microbial activity",
      "Useful for gardens and farms",
      "Residue-conscious nutrition",
    ],
    safetyInstructions: [
      "Store away from moisture",
      "Use gloves when handling",
      "Wash hands after application",
    ],
    downloads: [
      { label: "Organic use guide", href: "/downloads/organic-guide.pdf" },
    ],
    variants: [{ name: "Pack Size", values: ["10kg", "20kg", "40kg"] }],
    related: ["bio-root-growth-promoter-500ml", "npk-balanced-fertilizer-25kg"],
  },
  {
    id: "prod-grow-001",
    title: "Bio Root Growth Promoter 500ml",
    slug: "bio-root-growth-promoter-500ml",
    sku: "SAG-GROW-ROOT-500",
    barcode: "8964001000089",
    brand: "BioRoot",
    category: "Growth Promoters",
    subcategory: "Root Boosters",
    price: 1850,
    salePrice: 1690,
    wholesalePrice: 1510,
    dealerPrice: 1450,
    farmerPrice: 1600,
    rating: 4.7,
    reviews: 88,
    stock: 118,
    badge: "New",
    images: [
      "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1200&q=85",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortDescription:
      "Root support formula for transplant recovery, seedling strength, and early growth.",
    description:
      "A growth promoter developed for nursery plants, vegetables, and field crops where early root activity matters.",
    specifications: {
      Pack: "500ml",
      Form: "Liquid",
      Use: "Root development",
      Application: "Drench or fertigation",
      "Crop Stage": "Early growth",
    },
    usage:
      "Apply after transplanting or during early vegetative stage with clean water.",
    dosage: "100ml to 250ml per acre depending on crop and method.",
    benefits: [
      "Supports root mass",
      "Improves transplant recovery",
      "Encourages early vigor",
      "Useful in nurseries",
    ],
    safetyInstructions: [
      "Avoid direct eye contact",
      "Keep bottle capped",
      "Store away from direct sun",
    ],
    downloads: [
      { label: "Application guide", href: "/downloads/root-promoter.pdf" },
    ],
    variants: [{ name: "Pack Size", values: ["250ml", "500ml", "1L"] }],
    related: ["zinc-boron-micronutrient-1l", "organic-compost-booster-20kg"],
  },
];

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

export const blogPosts: BlogPost[] = [
  {
    title: "How to prepare maize fields before sowing",
    slug: "prepare-maize-fields-before-sowing",
    excerpt:
      "A practical checklist for seedbed preparation, seed rate, irrigation timing, and early nutrition.",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80",
    category: "Seeds",
    readTime: "6 min",
    date: "2026-06-12",
  },
  {
    title: "Micronutrient deficiency signs farmers should not ignore",
    slug: "micronutrient-deficiency-signs",
    excerpt:
      "Recognize zinc, boron, and iron deficiency symptoms before yield potential is compromised.",
    image:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=80",
    category: "Crop Nutrition",
    readTime: "5 min",
    date: "2026-06-08",
  },
  {
    title: "Safe spraying habits for pesticide and foliar applications",
    slug: "safe-spraying-habits",
    excerpt:
      "Protect operators, crops, and nearby fields with better nozzle, timing, and PPE decisions.",
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000&q=80",
    category: "Crop Protection",
    readTime: "7 min",
    date: "2026-05-30",
  },
];

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
