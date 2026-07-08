import { CheckCircle2, Clock, GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CmsSection } from "@/types";

export function CmsEditorPanel({ section }: { section: CmsSection }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-1 text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold">{section.title}</h3>
              <Badge
                variant={section.status === "Published" ? "default" : "secondary"}
              >
                {section.status}
              </Badge>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {section.updatedAt}
            </p>
          </div>
        </div>
        <Button variant="outline">Edit</Button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {section.fields.map((field) => (
          <div
            key={field}
            className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {field}
          </div>
        ))}
      </div>
    </div>
  );
}
