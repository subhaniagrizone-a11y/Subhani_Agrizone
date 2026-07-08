import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import type { AdminModule } from "@/lib/admin-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminPlaceholderPage({ module }: { module: AdminModule }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">{module.eyebrow}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <module.icon className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">
                {module.label}
              </h1>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {module.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/admin">
                <ArrowRight className="h-4 w-4" />
                Back to overview
              </Link>
            </Button>
            <Button variant="luxury">
              <Sparkles className="h-4 w-4" />
              Launch workflow
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {module.metrics.map((metric) => (
          <Card key={metric.label} className="rounded-2xl border-border/70">
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>Core Capabilities</CardTitle>
            <CardDescription>
              This module is scaffolded for enterprise workflows and can be
              connected directly to Prisma models and APIs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {module.capabilities.map((capability) => (
              <div
                key={capability}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{capability}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>Recommended Build Order</CardTitle>
            <CardDescription>
              Use this production path to harden each module without duplicating
              architecture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl bg-muted/40 p-4">
              <Badge variant="secondary">1</Badge>
              <p className="mt-3 font-semibold text-foreground">
                Schema and validation
              </p>
              <p className="mt-1">
                Define Prisma models, Zod schemas, and typed API contracts.
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <Badge variant="secondary">2</Badge>
              <p className="mt-3 font-semibold text-foreground">
                CRUD workflows
              </p>
              <p className="mt-1">
                Add create, update, bulk actions, empty states, and guardrails.
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <Badge variant="secondary">3</Badge>
              <p className="mt-3 font-semibold text-foreground">
                Analytics and auditability
              </p>
              <p className="mt-1">
                Layer activity logs, KPIs, export support, and operator
                observability.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
