import { brands } from "@/lib/data";

export function BrandStrip() {
  return (
    <section className="border-y border-border bg-background py-10">
      <div className="container space-y-6">
        <p className="text-center text-sm font-semibold text-muted-foreground">
          Trusted brands and supply partners
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {brands.map((brand) => (
            <div
              key={brand.slug}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-emerald-700 to-lime-500 text-sm font-bold text-white">
                {brand.logo}
              </span>
              <div>
                <p className="font-semibold">{brand.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {brand.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
