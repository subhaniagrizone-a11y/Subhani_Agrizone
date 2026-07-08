"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BellRing,
  ChevronRight,
  Home,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { adminNavigationGroups, adminOverviewLinks } from "@/lib/admin-config";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
  userName?: string | null;
  role?: string | null;
};

export function AdminShell({ children, userName, role }: AdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const breadcrumb = useMemo(() => {
    if (pathname === "/admin") {
      return ["Admin", "Overview"];
    }

    const allItems = [
      ...adminOverviewLinks,
      ...adminNavigationGroups.flatMap((group) => group.items),
    ];
    const match = allItems.find((item) => item.href === pathname);

    return ["Admin", match?.label ?? pathname.split("/").at(-1) ?? "Panel"];
  }, [pathname]);

  const sidebar = (
    <>
      <div className="rounded-3xl border border-white/10 bg-slate-950 px-4 py-5 text-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
              Subhani Agrizone
            </p>
            <p className="mt-2 text-lg font-bold">Admin Command</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p className="font-semibold text-white">
            {userName ?? "Authorized user"}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-200/70">
            {role ?? "ADMIN"}
          </p>
        </div>
      </div>

      <nav className="mt-4 space-y-5">
        <div className="rounded-3xl border border-border/70 bg-card p-3 shadow-sm">
          {adminOverviewLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <div>
                  <p>{item.label}</p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isActive
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {adminNavigationGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-3xl border border-border/70 bg-card p-3 shadow-sm"
          >
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Link
        href="/"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Back to storefront
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_22%)]">
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <div className="text-right">
            <p className="text-sm font-semibold">Admin Command</p>
            <p className="text-xs text-muted-foreground">
              {role ?? "Admin access"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className={cn("lg:block", menuOpen ? "block" : "hidden")}>
            {sidebar}
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumb.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-center gap-2"
                      >
                        {index > 0 ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : null}
                        <span
                          className={
                            index === breadcrumb.length - 1
                              ? "font-semibold text-foreground"
                              : ""
                          }
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                  <h1 className="mt-3 text-2xl font-bold tracking-normal sm:text-3xl">
                    {breadcrumb[breadcrumb.length - 1]}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Enterprise controls for catalog, content, customer growth,
                    and operational governance.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-background px-3 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Search modules, products, logs...
                  </div>
                  <div className="flex h-11 items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    System healthy
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
                    <BellRing className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </section>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
