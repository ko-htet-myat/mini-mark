import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shop } from "@hugeicons/core-free-icons";
import { useShop } from "@/context/shop-context";
import { useTranslations } from "next-intl";

export function TeamSwitcher() {
  const shop = useShop();
  const t = useTranslations("Shop");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <HugeiconsIcon icon={Shop} strokeWidth={2} />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{shop.name}</span>
                <span className="truncate text-xs">{t("mini_mark")}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
