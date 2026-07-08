"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  CircleUserRound,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Phone,
  Search,
  Settings,
  ShoppingBag,
  Sprout,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { AdvancedSearch } from "@/components/site/advanced-search";
import { navigation, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  showAdminPanel: boolean;
  currentUser: {
    name: string;
    email: string;
    image: string;
  } | null;
};

function getInitial(name: string, email: string) {
  const source = name.trim() || email.trim() || "U";
  return source.charAt(0).toUpperCase();
}

function getInitialPalette(seed: string) {
  const palettes = [
    "from-emerald-600 to-lime-500",
    "from-sky-600 to-cyan-500",
    "from-fuchsia-600 to-rose-500",
    "from-amber-600 to-orange-500",
    "from-indigo-600 to-violet-500",
  ];
  const index = seed.charCodeAt(0) % palettes.length;
  return palettes[index];
}

export function SiteHeader({ showAdminPanel, currentUser }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const isLoggedIn = Boolean(currentUser);
  const userInitial = getInitial(
    currentUser?.name ?? "",
    currentUser?.email ?? "",
  );
  const initialPalette = getInitialPalette(userInitial);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!profileMenuRef.current?.contains(target)) {
        setProfileMenuOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [profileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="border-b border-border/60 bg-slate-950 text-white">
        <div className="container flex min-h-9 items-center justify-between gap-3 text-xs">
          <p className="truncate text-white/80">
            Certified agriculture supplies, dealer pricing, and expert support.
          </p>
          <a
            className="hidden items-center gap-2 font-semibold text-white transition hover:text-lime-200 sm:flex"
            href={`tel:${siteConfig.contact.phone}`}
          >
            <Phone className="h-3.5 w-3.5" />
            {siteConfig.contact.phone}
          </a>
        </div>
      </div>

      <div className="container flex h-20 items-center gap-4">
        <Link
          href="/"
          className="flex min-w-fit items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Subhani Agrizone home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-emerald-700 to-lime-500 text-white shadow-glow">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-normal">
              Subhani Agrizone
            </span>
            <span className="block text-xs font-medium text-muted-foreground">
              Premium farm commerce
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative ml-auto hidden w-full max-w-md xl:block">
          <AdvancedSearch />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {showAdminPanel ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin">Admin Panel</Link>
            </Button>
          ) : null}
          <Button asChild size="icon" variant="outline" title="Dashboard">
            <Link href="/dashboard" aria-label="Open dashboard">
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="outline" title="Wishlist">
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="outline" title="Cart">
            <Link href="/cart" aria-label="Shopping cart">
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="outline" title="Customize">
            <Link href="/dashboard#profile" aria-label="Profile settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <ThemeToggle />
          {isLoggedIn ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-2 py-1 pr-2 transition hover:border-primary/40 hover:bg-accent"
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((value) => !value)}
              >
                {currentUser?.image ? (
                  <img
                    src={currentUser.image}
                    alt={currentUser.name || "User profile"}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                      initialPalette,
                    )}
                  >
                    {userInitial}
                  </span>
                )}
                <span className="max-w-[8rem] truncate text-sm font-semibold">
                  {currentUser?.name?.trim() || "My Profile"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition",
                    profileMenuOpen ? "rotate-180" : "",
                  )}
                />
              </button>

              {profileMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-60 rounded-lg border border-border bg-card p-2 shadow-soft">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-accent"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <CircleUserRound className="h-4 w-4" />
                    My profile
                  </Link>
                  <Link
                    href="/dashboard#orders"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-accent"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    My orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-accent"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-accent"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Cart
                  </Link>
                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                    onClick={() =>
                      signOut({
                        redirectTo: "/",
                      })
                    }
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Button asChild variant="dark">
              <Link href="/auth/login">
                <User className="h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>

        <Button
          className="ml-auto md:hidden"
          size="icon"
          variant="outline"
          aria-label="Open menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {menuOpen ? (
        <div className="container pb-4 md:hidden">
          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
            </div>
            <div className="grid gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {showAdminPanel ? (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              ) : null}
              <Link
                href="/wishlist"
                className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                href="/cart"
                className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                Cart
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {isLoggedIn ? (
                <Button asChild variant="outline">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/auth/login">Login</Link>
                </Button>
              )}
              <Button asChild variant="luxury">
                <Link href="/contact">Inquiry</Link>
              </Button>
            </div>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name || "User profile"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                        initialPalette,
                      )}
                    >
                      {userInitial}
                    </span>
                  )}
                  <span className="text-sm font-semibold">
                    {currentUser?.name?.trim() || "My Profile"}
                  </span>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signOut({ redirectTo: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                onClick={() => setMenuOpen(false)}
              >
                <CircleUserRound className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  Login to your account
                </span>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
