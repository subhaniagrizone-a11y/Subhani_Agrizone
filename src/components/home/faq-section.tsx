"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: "1",
    category: "Shipping",
    question: "What's the delivery time?",
    answer:
      "We offer free shipping on orders above PKR 5000. Delivery typically takes 3-5 business days depending on your location. Express delivery is available for selected areas.",
  },
  {
    id: "2",
    category: "Products",
    question: "Are all products certified?",
    answer:
      "Yes, all our agricultural products are certified from official authorities. Each product comes with a certification document and complete traceability.",
  },
  {
    id: "3",
    category: "Returns",
    question: "What's your return policy?",
    answer:
      "We offer 30-day money-back guarantee on unopened products. If you're not satisfied, contact our support team for a hassle-free refund or replacement.",
  },
  {
    id: "4",
    category: "Pricing",
    question: "Do you offer bulk/wholesale discounts?",
    answer:
      "Absolutely! We have special pricing for dealers and bulk orders. Visit the product page and select your role (Farmer/Dealer) to see applicable rates.",
  },
  {
    id: "5",
    category: "Products",
    question: "How do I know which product suits my crop?",
    answer:
      "Each product includes detailed usage instructions, dosage recommendations, and benefits. Our expert support team is also available via WhatsApp, Phone, or Chat.",
  },
  {
    id: "6",
    category: "Account",
    question: "Can I change my pricing tier later?",
    answer:
      "Yes! You can update your role and pricing tier anytime from your dashboard. The new rates will apply to future orders.",
  },
];

const categories = ["All", ...new Set(faqs.map((faq) => faq.category))];

export function FAQSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <Badge className="inline-block">❓ Common Questions</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Find answers to common questions about our products, pricing, and
            services
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {filteredFAQs.map((faq, idx) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden border-border/50 hover:border-emerald-500/50 transition">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === faq.id ? null : faq.id)
                    }
                    className="w-full px-6 py-5 flex items-start justify-between gap-4 hover:bg-muted/30 transition text-left"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <HelpCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <h3 className="font-semibold leading-tight">
                        {faq.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{
                        rotate: expandedId === faq.id ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-4 bg-muted/20 border-t border-border/30">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Didn't find what you're looking for?
          </p>
          <Button className="gap-2">Contact Our Support Team</Button>
        </motion.div>
      </div>
    </section>
  );
}
