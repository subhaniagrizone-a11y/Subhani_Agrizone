import Image from "next/image";
import { AlertTriangle, Leaf, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHomepageManagedContent } from "@/lib/homepage-sections";

const diseaseLibrary = [
  {
    id: "wheat-rust",
    crop: "Wheat",
    disease: "Yellow Rust",
    symptoms: "Patton par peeli dhariyan aur jaldi sukhna.",
    action: "Early stage me fungicide spray aur resistant variety use karein.",
    image:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "rice-blast",
    crop: "Rice",
    disease: "Rice Blast",
    symptoms: "Leaf par diamond shape daag aur neck rot signs.",
    action:
      "Field ventilation improve karein aur recommended blast fungicide apply karein.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "tomato-blight",
    crop: "Tomato",
    disease: "Early Blight",
    symptoms: "Neeche wali leaves par concentric brown spots.",
    action:
      "Affected leaves remove karein aur preventive spray schedule follow karein.",
    image:
      "https://images.unsplash.com/photo-1592921870789-04563d55041c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cotton-leaf-curl",
    crop: "Cotton",
    disease: "Leaf Curl Virus",
    symptoms: "Patte murhna, growth stunt hona, fruiting me kami.",
    action: "Whitefly control karein aur infected plants isolate karein.",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
  },
];

export async function CropDiseaseSection() {
  const managed = await getHomepageManagedContent();
  const items = managed.diseases.length ? managed.diseases : diseaseLibrary;

  return (
    <section className="section-padding bg-gradient-to-br from-lime-50/70 via-background to-emerald-50/80 dark:from-slate-950 dark:via-background dark:to-slate-900">
      <div className="container space-y-8">
        <div className="max-w-3xl">
          <p className="eyebrow">Crop care assistant</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
            Common crop diseases with visual guidance
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            Disease symptoms ko image ke sath jaldi identify karein aur
            immediate first-action lein. Accurate diagnosis ke liye support
            chatbot ya agronomist se confirm karein.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-border/70 bg-card/90 shadow-sm"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={item.image}
                  alt={`${item.crop} ${item.disease}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {item.crop}
                  </span>
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="mt-1">{item.disease}</CardTitle>
                <CardDescription>{item.symptoms}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{item.action}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Support bot se treatment plan verify karein.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
