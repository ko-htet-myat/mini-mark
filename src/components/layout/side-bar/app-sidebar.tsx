"use client";

import * as React from "react";

import { NavMain } from "@/components/layout/side-bar/nav-main";
import { NavUser } from "@/components/layout/side-bar/nav-user";
import { TeamSwitcher } from "@/components/layout/side-bar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Settings01Icon,
  ColorsIcon,
  BorderFullIcon,
  PackageIcon,
  Invoice01Icon,
  ShoppingBag01Icon,
  CheckmarkSquare02Icon,
  Activity01Icon,
  Calculator01Icon,
  GoldIngotsIcon,
  SaleTag02Icon,
  Store,
} from "@hugeicons/core-free-icons";
import { SystemNav } from "./system-nav";
import { useShop } from "@/context/shop-context";
import { useTranslations } from "next-intl";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { slug } = useShop();
  const t = useTranslations("sidebar");
  const base = `/${slug}/dashboard`;

  const navMain = [
    {
      title: t("dashboard"),
      url: base,
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      title: t("orders"),
      url: `${base}/orders`,
      icon: <HugeiconsIcon icon={BorderFullIcon} strokeWidth={2} />,
    },
    {
      title: t("products"),
      url: `${base}/products`,
      icon: <HugeiconsIcon icon={ShoppingBag01Icon} strokeWidth={2} />,
      items: [
        {
          title: t("all_products"),
          url: `${base}/products`,
        },
        {
          title: t("create_product"),
          url: `${base}/products/create`,
        },
      ],
    },
    {
      title: t("attributes"),
      url: `${base}/attributes`,
      icon: <HugeiconsIcon icon={GoldIngotsIcon} strokeWidth={2} />,
      items: [
        {
          title: t("all_attributes"),
          url: `${base}/attributes`,
        },
        {
          title: t("create_attribute"),
          url: `${base}/attributes/create`,
        },
      ],
    },
    {
      title: t("brands"),
      url: `${base}/brands`,
      icon: <HugeiconsIcon icon={CheckmarkSquare02Icon} strokeWidth={2} />,
      items: [
        {
          title: t("all_brands"),
          url: `${base}/brands`,
        },
        {
          title: t("create_brand"),
          url: `${base}/brands/create`,
        },
      ],
    },
    {
      title: t("categories"),
      url: `${base}/categories`,
      icon: <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />,
      items: [
        {
          title: t("all_categories"),
          url: `${base}/categories`,
        },
        {
          title: t("create_categories"),
          url: `${base}/categories/create`,
        },
      ],
    },
    {
      title: t("promotions"),
      url: `${base}/promotions`,
      icon: <HugeiconsIcon icon={SaleTag02Icon} strokeWidth={2} />,
      items: [
        {
          title: t("all_promotions"),
          url: `${base}/promotions`,
        },
        {
          title: t("create_promotion"),
          url: `${base}/promotions/create`,
        },
      ],
    },
    {
      title: t("invoices"),
      url: `${base}/invoices`,
      icon: <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />,
    },
    {
      title: t("sales"),
      url: `${base}/sales`,
      icon: <HugeiconsIcon icon={Activity01Icon} strokeWidth={2} />,
    },
  ];

  const systemMain = [
    {
      title: t("shopfront"),
      url: `/${slug}`,
      icon: <HugeiconsIcon icon={Store} strokeWidth={2} />,
    },
    {
      title: t("calculator"),
      url: `${base}/calculator`,
      icon: <HugeiconsIcon icon={Calculator01Icon} strokeWidth={2} />,
    },
    {
      title: t("theme"),
      url: `${base}/theme`,
      icon: <HugeiconsIcon icon={ColorsIcon} strokeWidth={2} />,
      items: [
        {
          title: t("shopfront_theme"),
          url: `${base}/theme`,
        },
        {
          title: t("invoice_theme"),
          url: `${base}/theme/invoice`,
        },
      ],
    },
    {
      title: t("setting"),
      url: `${base}/settings`,
      icon: <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />,
    },
  ];

  // Placeholder user — replace with real session data
  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <SystemNav items={systemMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
