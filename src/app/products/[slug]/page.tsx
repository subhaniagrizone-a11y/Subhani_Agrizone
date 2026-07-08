import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import { ProductDetail } from "@/components/product/product-detail";
import { getLiveProductBySlug, getLiveProducts } from "@/lib/products-server";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 120;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: {
      canonical: absoluteUrl(`/products/${product.slug}`),
    },
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: product.images.map((url) => ({ url, alt: product.title })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getLiveProductBySlug(slug);

  if (!product) notFound();

  const liveProducts = await getLiveProducts();
  const relatedProducts = liveProducts
    .filter(
      (item) => product.related.includes(item.slug) && item.id !== product.id,
    )
    .slice(0, 4);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: product.title, href: `/products/${product.slug}` },
  ]);

  return (
    <>
      <ProductDetail product={product} relatedProducts={relatedProducts} />
      <Script
        id={`product-jsonld-${product.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />
      <Script
        id={`breadcrumb-jsonld-${product.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}
