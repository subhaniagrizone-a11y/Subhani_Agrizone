import Script from "next/script";

import { CategoryGrid } from "@/components/home/category-grid";
import { ContentSections } from "@/components/home/content-sections";
import { HeroSlider } from "@/components/home/hero-slider";
import { ProductShowcase } from "@/components/home/product-showcase";
import { PremiumHeroSection } from "@/components/home/premium-hero";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FAQSection } from "@/components/home/faq-section";
import { CropDiseaseSection } from "@/components/home/crop-disease-section";
import { GallerySection } from "@/components/home/gallery-section";
import { faqs } from "@/lib/data";
import {
  getHomepageManagedContent,
  getHomepageSectionVisibility,
} from "@/lib/homepage-sections";
import { faqJsonLd } from "@/lib/seo";

export const revalidate = 120;

function SectionIntro({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="border-y border-border bg-muted/35 py-6">
      <div className="container">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-sm font-medium text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const sections = await getHomepageSectionVisibility();
  const managedContent = await getHomepageManagedContent();

  return (
    <>
      <HeroSlider />
      {sections.home_categories ? (
        <>
          <SectionIntro
            title="Categories"
            subtitle="Seed, fertilizer, spray aur equipment collection"
          />
          <CategoryGrid />
        </>
      ) : null}
      <PremiumHeroSection />
      {sections.home_products ? (
        <>
          <SectionIntro
            title="Products"
            subtitle="Featured products with clear pricing and stock"
          />
          <ProductShowcase />
        </>
      ) : null}
      {sections.home_gallery ? <GallerySection /> : null}
      {sections.home_diseases ? <CropDiseaseSection /> : null}
      {sections.home_testimonials ? (
        <TestimonialsSection items={managedContent.testimonials} />
      ) : null}
      {sections.home_blog ? <ContentSections /> : null}
      {sections.home_faq ? <FAQSection /> : null}
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
    </>
  );
}
