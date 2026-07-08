import { z } from "zod";

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const phoneLoginSchema = z.object({
  phone: z.string().min(8).max(20),
  otp: z.string().min(4).max(8),
});

export const inquirySchema = z.object({
  type: z
    .enum([
      "CONTACT",
      "DEALER_REGISTRATION",
      "FARMER_REGISTRATION",
      "BULK_INQUIRY",
      "QUOTATION_REQUEST",
      "NEWSLETTER",
      "SUPPORT_TICKET",
      "PRODUCT_INQUIRY",
    ])
    .default("CONTACT"),
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).max(20).optional().or(z.literal("")),
  company: z.string().max(160).optional().or(z.literal("")),
  subject: z.string().max(180).optional().or(z.literal("")),
  message: z.string().min(5).max(3000),
  productId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const productWriteSchema = z.object({
  title: z.string().max(180).optional(),
  slug: z.string().max(220).optional(),
  sku: z.string().max(80).optional(),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  salePrice: z.coerce.number().min(0).optional(),
  wholesalePrice: z.coerce.number().min(0).optional(),
  dealerPrice: z.coerce.number().min(0).optional(),
  farmerPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  shortDescription: z.string().max(400).optional(),
  description: z.string().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  activeIngredients: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        percentage: z.string().min(1).max(40),
      }),
    )
    .optional(),
  imageUrls: z.array(z.string().url()).max(12).optional(),
  usage: z.string().optional(),
  dosage: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  safetyInstructions: z.array(z.string()).optional(),
});

export const homepageSectionSchema = z.object({
  key: z.string().min(2),
  title: z.string().min(2),
  content: z.record(z.string(), z.unknown()),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const siteSettingsSchema = z.object({
  companyName: z.string().min(2).max(160),
  supportEmail: z.string().email(),
  supportPhone: z.string().min(7).max(30),
  supportPhone2: z.string().min(7).max(30),
  whatsapp: z.string().min(7).max(30),
  whatsapp2: z.string().min(7).max(30),
  address: z.string().min(3).max(300),
  mapsUrl: z.string().url(),
  workingHours: z.string().min(3).max(120),
  socials: z.object({
    facebook: z.string().url().or(z.literal("")),
    instagram: z.string().url().or(z.literal("")),
    youtube: z.string().url().or(z.literal("")),
    linkedin: z.string().url().or(z.literal("")),
    tiktok: z.string().url().or(z.literal("")),
    x: z.string().url().or(z.literal("")),
    threads: z.string().url().or(z.literal("")),
    telegram: z.string().url().or(z.literal("")),
    pinterest: z.string().url().or(z.literal("")),
    googleBusiness: z.string().url().or(z.literal("")),
  }),
  features: z.object({
    weatherEnabled: z.boolean(),
    chatbotEnabled: z.boolean(),
    floatingWhatsapp: z.boolean(),
    floatingCall: z.boolean(),
    floatingEmail: z.boolean(),
    floatingBackToTop: z.boolean(),
  }),
});

export const checkoutOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(100),
      }),
    )
    .min(1),
  paymentMethod: z.enum([
    "BANK_TRANSFER",
    "COD",
    "JAZZCASH",
    "EASYPAISA",
    "DEBIT_CARD",
    "CREDIT_CARD",
    "VISA",
    "MASTERCARD",
  ]),
  paymentProvider: z
    .enum(["offline", "jazzcash", "easypaisa", "card", "bank-transfer"])
    .optional(),
  checkoutKey: z.string().min(8).max(120).optional().or(z.literal("")),
  transactionReference: z.string().max(120).optional().or(z.literal("")),
  couponCode: z.string().max(40).optional().or(z.literal("")),
  deliveryMethod: z
    .enum(["STANDARD", "EXPRESS", "PRIORITY"])
    .default("STANDARD"),
  sameAsShipping: z.boolean().default(true),
  notes: z.string().max(500).optional().or(z.literal("")),
  shippingAddressId: z.string().optional().or(z.literal("")),
  billingAddressId: z.string().optional().or(z.literal("")),
  shippingAddress: z
    .object({
      label: z.string().min(2).max(80).default("Home"),
      fullName: z.string().min(2).max(120),
      phone: z.string().min(7).max(30),
      line1: z.string().min(3).max(160),
      line2: z.string().max(160).optional().or(z.literal("")),
      city: z.string().min(2).max(80),
      province: z.string().min(2).max(80),
      postalCode: z.string().max(30).optional().or(z.literal("")),
      country: z.string().min(2).max(80).default("Pakistan"),
      saveAsDefault: z.boolean().default(true),
    })
    .optional(),
  billingAddress: z
    .object({
      label: z.string().min(2).max(80).default("Home"),
      fullName: z.string().min(2).max(120),
      phone: z.string().min(7).max(30),
      line1: z.string().min(3).max(160),
      line2: z.string().max(160).optional().or(z.literal("")),
      city: z.string().min(2).max(80),
      province: z.string().min(2).max(80),
      postalCode: z.string().max(30).optional().or(z.literal("")),
      country: z.string().min(2).max(80).default("Pakistan"),
      saveAsDefault: z.boolean().default(true),
    })
    .optional(),
  customer: z
    .object({
      name: z.string().min(2).max(120),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().min(7).max(30).optional().or(z.literal("")),
      createAccount: z.boolean().default(false),
      password: z.string().min(8).max(128).optional().or(z.literal("")),
    })
    .optional(),
  shippingInstructions: z.string().max(500).optional().or(z.literal("")),
  billingSameAsShipping: z.boolean().default(true),
  guestCheckout: z.boolean().default(true),
});

export const checkoutAddressSchema = z.object({
  label: z.string().min(2).max(80).default("Home"),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  line1: z.string().min(3).max(160),
  line2: z.string().max(160).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  province: z.string().min(2).max(80),
  postalCode: z.string().max(30).optional().or(z.literal("")),
  country: z.string().min(2).max(80).default("Pakistan"),
  saveAsDefault: z.boolean().default(true),
});

export const checkoutCustomerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).max(30).optional().or(z.literal("")),
  createAccount: z.boolean().default(false),
  password: z.string().min(8).max(128).optional().or(z.literal("")),
});
