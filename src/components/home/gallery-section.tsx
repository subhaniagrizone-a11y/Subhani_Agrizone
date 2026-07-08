import Image from "next/image";
import { getHomepageManagedContent } from "@/lib/homepage-sections";

const galleryItems = [
  {
    id: "field-1",
    title: "Healthy crop field",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "field-2",
    title: "Farmer support visit",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "field-3",
    title: "Harvest quality check",
    image:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "field-4",
    title: "Crop care training",
    image:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
  },
];

export async function GallerySection() {
  const managed = await getHomepageManagedContent();
  const items = managed.gallery.length ? managed.gallery : galleryItems;

  return (
    <section className="section-padding bg-background">
      <div className="container">
        <div className="mb-6">
          <p className="eyebrow">Gallery</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Field results and customer moments
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <p className="p-3 text-sm font-semibold">{item.title}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
