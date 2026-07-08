"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHomepageManagedContent } from "@/lib/homepage-sections";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Muhammad Farooq",
    role: "Farmer, Punjab",
    quote:
      "Excellent quality seeds and fast service. The farmer pricing is unbeatable and support team is very responsive.",
    rating: 5,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer1",
  },
  {
    id: "2",
    name: "Ahmad Khan",
    role: "Dealer, Sindh",
    quote:
      "Best agriculture platform I've used. Real-time inventory, dealer pricing, and seamless ordering. Highly recommended!",
    rating: 5,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dealer1",
  },
  {
    id: "3",
    name: "Fatima Bibi",
    role: "Nursery Owner, KPK",
    quote:
      "Great selection of garden products and planting supplies. The website is so easy to navigate.",
    rating: 4.5,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nursery1",
  },
  {
    id: "4",
    name: "Rashid Ahmed",
    role: "Farm Manager, Balochistan",
    quote:
      "Product quality is exceptional. Every product comes with detailed usage and dosage instructions.",
    rating: 5,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager1",
  },
];

export async function TestimonialsSection() {
  const managed = await getHomepageManagedContent();
  const items = managed.testimonials.length
    ? managed.testimonials
    : testimonials;

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent dark:via-emerald-950/10 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <Badge className="inline-block">✨ Success Stories</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">
            Trusted by {items.length}K+ Farmers & Dealers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            See what agriculture professionals are saying about us
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 h-full flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/50 transition">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(testimonial.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400"
                  />
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
