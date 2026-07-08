import type { Metadata } from "next";
import { FileJson, Globe2, Save, SearchCheck, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogPosts, categories, products } from "@/lib/data";

export const metadata: Metadata = {
  title: "SEO Panel"
};

const schemaItems = [
  "Organization schema",
  "Product schema",
  "FAQ schema",
  "Blog schema",
  "Breadcrumb schema",
  "Open Graph",
  "Twitter Cards",
  "Canonical URLs",
  "Sitemap",
  "Robots"
];

export default function AdminSeoPage() {
  return (
    <>
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">SEO</p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Search optimization panel
            </h1>
          </div>
          <Button variant="luxury">
            <Save className="h-4 w-4" />
            Save SEO
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <form className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-normal">Page metadata</h2>
            <SearchCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Page
              <select className="h-11 rounded-md border border-input bg-background px-3 text-sm">
                <option>Homepage</option>
                {categories.map((category) => (
                  <option key={category.slug}>Category - {category.name}</option>
                ))}
                {products.map((product) => (
                  <option key={product.slug}>Product - {product.title}</option>
                ))}
                {blogPosts.map((post) => (
                  <option key={post.slug}>Blog - {post.title}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Meta title
              <Input placeholder="Premium Agriculture Ecommerce" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Meta description
              <textarea
                rows={4}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Search description"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Canonical URL
              <Input placeholder="https://example.com/page" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Open Graph image
              <Input placeholder="https://..." />
            </label>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-normal">Schema coverage</h2>
              <FileJson className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-5 grid gap-2">
              {schemaItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm font-semibold"
                >
                  {item}
                  <Badge>Ready</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <Globe2 className="h-5 w-5 text-primary" />
              <p className="mt-4 text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Indexable route coverage</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <Share2 className="h-5 w-5 text-primary" />
              <p className="mt-4 text-2xl font-bold">All pages</p>
              <p className="text-sm text-muted-foreground">Social preview fields</p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
