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
} from "@hugeicons/core-free-icons";
import { SystemNav } from "./system-nav";
import { useShop } from "@/store/shop-context";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { slug } = useShop();
  const base = `/${slug}/dashboard`;

  const navMain = [
    {
      title: "Dashboard",
      url: base,
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      title: "Orders",
      url: `${base}/orders`,
      icon: <HugeiconsIcon icon={BorderFullIcon} strokeWidth={2} />,
    },
    {
      title: "Products",
      url: `${base}/products`,
      icon: <HugeiconsIcon icon={ShoppingBag01Icon} strokeWidth={2} />,
      items: [
        {
          title: "All Products",
          url: `${base}/products`,
        },
        {
          title: "Create Product",
          url: `${base}/products/create`,
        },
      ],
    },
    {
      title: "Attributes",
      url: `${base}/attributes`,
      icon: <HugeiconsIcon icon={GoldIngotsIcon} strokeWidth={2} />,
    },
    {
      title: "Brands",
      url: `${base}/brands`,
      icon: <HugeiconsIcon icon={CheckmarkSquare02Icon} strokeWidth={2} />,
      items: [
        {
          title: "All Brands",
          url: `${base}/brands`,
        },
        {
          title: "Create Brand",
          url: `${base}/brands/create`,
        },
      ],
    },
    {
      title: "Categories",
      url: `${base}/categories`,
      icon: <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />,
      items: [
        {
          title: "All Categories",
          url: `${base}/categories`,
        },
        {
          title: "Create Categories",
          url: `${base}/categories/create`,
        },
      ],
    },
    {
      title: "Promotions",
      url: `${base}/promotions`,
      icon: <HugeiconsIcon icon={SaleTag02Icon} strokeWidth={2} />,
      items: [
        {
          title: "All Promotions",
          url: `${base}/promotions`,
        },
        {
          title: "Create Promotion",
          url: `${base}/promotions/create`,
        },
      ],
    },
    {
      title: "Invoices",
      url: `${base}/invoices`,
      icon: <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />,
    },
    {
      title: "Sales",
      url: `${base}/sales`,
      icon: <HugeiconsIcon icon={Activity01Icon} strokeWidth={2} />,
    },
  ];

  const systemMain = [
    {
      title: "Calculator",
      url: `${base}/calculator`,
      icon: <HugeiconsIcon icon={Calculator01Icon} strokeWidth={2} />,
    },
    {
      title: "Theme",
      url: `${base}/theme`,
      icon: <HugeiconsIcon icon={ColorsIcon} strokeWidth={2} />,
      items: [
        {
          title: "Shopfront Theme",
          url: `${base}/theme`,
        },
        {
          title: "Invoice Theme",
          url: `${base}/theme/invoice`,
        },
      ],
    },
    {
      title: "Setting",
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
