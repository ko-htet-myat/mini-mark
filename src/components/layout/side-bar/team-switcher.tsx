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
  const tUi = useTranslations("UI");
  console.log(shop);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-orange-600">
                {shop.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={shop.logoUrl} alt="" />
                ) : (
                  <HugeiconsIcon
                    icon={Shop}
                    strokeWidth={2}
                    className=" text-white"
                  />
                )}
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{shop.name}</span>
                <span className="truncate text-xs opacity-75">
                  {/* {t("mini_mark")} */}
                  {shop.shopCategory
                    ? // @ts-expect-error - Next-Intl strictly types translation keys based on the schema, dynamic keys cannot be statically resolved
                      tUi(`categories.${shop.shopCategory}`)
                    : null}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
