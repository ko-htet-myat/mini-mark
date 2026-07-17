"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

/**
 * Maps raw URL path segments to human-readable labels.
 * Add entries here as you add new routes.
 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Settings",
  playground: "Playground",
  models: "Models",
  documentation: "Documentation",
  history: "History",
  starred: "Starred",
  genesis: "Genesis",
  explorer: "Explorer",
  quantum: "Quantum",
  introduction: "Introduction",
  "get-started": "Get Started",
  tutorials: "Tutorials",
  changelog: "Changelog",
  general: "General",
  team: "Team",
  billing: "Billing",
  limits: "Limits",
};

function toLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    // Fallback: capitalise each word and replace hyphens
    segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/**
 * Builds breadcrumb items from the current pathname.
 *
 * URL shape: /{shop}/dashboard/{section?}/{subsection?}
 * The {shop} segment is a tenant slug — we skip it in the breadcrumb display
 * and treat "dashboard" as the root crumb.
 */
function useBreadcrumbs() {
  const pathname = usePathname();

  // e.g. "/my-shop/dashboard/settings/general"
  const segments = pathname.split("/").filter(Boolean);

  // Find "dashboard" as the root anchor; skip everything before it (the shop slug)
  const dashboardIndex = segments.indexOf("dashboard");
  if (dashboardIndex === -1) return [];

  const crumbSegments = segments.slice(dashboardIndex); // ["dashboard", "settings", "general"]

  return crumbSegments.map((segment, i) => {
    const href = "/" + segments.slice(0, dashboardIndex + i + 1).join("/");
    const label = toLabel(segment);
    const isLast = i === crumbSegments.length - 1;
    return { label, href, isLast };
  });
}

export function DynamicBreadcrumb() {
  const crumbs = useBreadcrumbs();

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem
              className={i < crumbs.length - 1 ? "hidden md:block" : undefined}
            >
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
