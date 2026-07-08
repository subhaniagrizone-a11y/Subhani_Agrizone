import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (!query || query.trim().length === 0) {
    return NextResponse.json([]);
  }

  // Filter products based on query
  const matchedProducts = products.filter((product) => {
    const searchableText = [
      product.title,
      product.category,
      product.subcategory,
      product.brand,
      product.sku,
      product.shortDescription || "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  // Group results by type
  const results: Array<{
    title: string;
    results: Array<{
      id: string;
      title: string;
      slug: string;
      category: string;
      price: number;
      image: string;
      badge?: string;
      type: "product" | "category";
    }>;
  }> = [
    {
      title: "Products",
      results: matchedProducts.slice(0, 8).map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        price: product.salePrice || product.price,
        image: product.images[0],
        badge: product.badge ?? "New",
        type: "product" as const,
      })),
    },
  ];

  // Add category suggestions if query matches
  const categories = [
    "Seeds",
    "Fertilizers",
    "Pesticides",
    "Herbicides",
    "Fungicides",
    "Micronutrients",
    "Growth Promoters",
    "Agriculture Equipment",
    "Sprayers",
    "Garden Products",
    "Organic Products",
    "Animal Feed",
  ];

  const matchedCategories = categories
    .filter((cat) => cat.toLowerCase().includes(query))
    .slice(0, 3);

  if (matchedCategories.length > 0) {
    results.push({
      title: "Categories",
      results: matchedCategories.map((category) => ({
        id: category.toLowerCase().replace(/\s+/g, "-"),
        title: category,
        slug: category.toLowerCase().replace(/\s+/g, "-"),
        category: "Category",
        price: 0,
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80",
        badge: "Category",
        type: "category" as const,
      })),
    });
  }

  return NextResponse.json(results);
}
