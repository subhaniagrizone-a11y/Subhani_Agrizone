"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Command, Search, Sparkles, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
  type: "product" | "category" | "brand";
}

interface SearchGroup {
  title: string;
  results: SearchResult[];
}

export function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchGroup[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 1) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(query)}`,
          );
          const data = await response.json();
          setResults(data);
          setSelectedIndex(-1);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const allResults = results.flatMap((group) => group.results);

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allResults.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && allResults[selectedIndex]) {
            const result = allResults[selectedIndex];
            window.location.href = `/products/${result.slug}`;
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, selectedIndex, results]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(query)}`;
    }
  };

  const allResults = results.flatMap((group) => group.results);

  return (
    <div ref={searchRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search seeds, fertilizers, equipment... (try 'maize' or 'npk')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-10 py-2.5 rounded-lg border-2 border-border/50 transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.trim().length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border border-border/50 bg-background shadow-xl backdrop-blur-sm overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((group, groupIndex) => (
                  <div key={group.title}>
                    <div className="px-4 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.title}
                    </div>
                    {group.results.map((result, resultIndex) => {
                      const globalIndex =
                        results
                          .slice(0, groupIndex)
                          .reduce((sum, g) => sum + g.results.length, 0) +
                        resultIndex;
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <Link
                          key={result.id}
                          href={`/products/${result.slug}`}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer",
                            isSelected
                              ? "bg-green-50 dark:bg-green-950/20"
                              : "hover:bg-muted/50",
                          )}
                        >
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            <img
                              src={result.image}
                              alt={result.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {result.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.category}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                              PKR {result.price.toLocaleString()}
                            </p>
                            {result.badge && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                {result.badge}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                {allResults.length > 0 && (
                  <div className="border-t border-border/50 p-3 bg-muted/20">
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4" />
                      View all {allResults.length} results
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Search className="h-4 w-4" />
                  <span>No results found</span>
                </div>
                <p className="text-xs">
                  Try different keywords or browse categories
                </p>
              </div>
            )}

            {/* Keyboard Hint */}
            <div className="border-t border-border/50 px-4 py-2 bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                <Command className="h-3 w-3 inline mr-1" />
                Navigation
              </span>
              <span>
                <kbd className="rounded px-1.5 py-0.5 bg-muted text-xs font-semibold">
                  Esc
                </kbd>
                to close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
