"use client";

import { useState } from "react";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateShopAction } from "@/features/shop/actions/edit";
import { updateShopSchema } from "@/features/shop/validations/edit";
import { Shop } from "@/generated/prisma/client";
import type { ShopOperatingHours } from "@/generated/prisma/client";
import { DayOfWeek } from "@/generated/prisma/enums";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { GeneralSettingsTab } from "@/features/settings/components/general-settings-tab";
import { ContactSettingsTab } from "@/features/settings/components/contact-settings-tab";
import { SecuritySettingsTab } from "@/features/settings/components/security-settings-tab";
import { AdvancedSettingsTab } from "@/features/settings/components/advanced-settings-tab";

const DAYS = Object.values(DayOfWeek);

type SettingsShop = Shop & {
  operatingHours: ShopOperatingHours[];
};

function getOperatingHoursDefaults(shop: SettingsShop) {
  return DAYS.map((day) => {
    const existing = shop.operatingHours.find((item) => item.dayOfWeek === day);

    return {
      dayOfWeek: day,
      isClosed: existing?.isClosed ?? false,
      openTime: existing?.openTime ?? "09:00",
      closeTime: existing?.closeTime ?? "18:00",
    };
  });
}

export function SettingsForm({ shop }: { shop: SettingsShop }) {
  const isMobile = useIsMobile();
  const ts = useTranslations("Settings");
  const tc = useTranslations("Common");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateShopAction,
    zodResolver(updateShopSchema),
    {
      formProps: {
        defaultValues: {
          name: shop.name,
          currency: shop.currency,
          shopCategory: shop.shopCategory,
          description: shop.description ?? "",
          contactEmail: shop.contactEmail ?? "",
          contactPhones:
            shop.contactPhones.length > 0 ? shop.contactPhones : [""],
          region: shop.region ?? "",
          division: shop.division ?? "",
          township: shop.township ?? "",
          address: shop.address ?? "",
          logoUrl: shop.logoUrl ?? "",
          bannerUrl: shop.bannerUrl ?? "",
          isShowInPublic: shop.isShowInPublic,
          operatingHours: getOperatingHoursDefaults(shop),
        },
      },
      actionProps: {
        onSuccess: () => toast.success(ts("shop_updated")),
      },
    },
  );

  const [activeTab, setActiveTab] = useState("general");

  return (
    <form onSubmit={handleSubmitWithAction} className="flex flex-col">
      <Tabs
        defaultValue="general"
        orientation={isMobile ? "horizontal" : "vertical"}
        className="flex flex-col md:flex-row gap-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="flex md:flex-col h-auto justify-start bg-transparent p-0 gap-3 md:gap-2 md:w-48 md:overflow-visible flex-nowrap border-border md:border-none rounded-none md:rounded-lg md:mb-0">
          <TabsTrigger value="general">{ts("tab_general")}</TabsTrigger>
          <TabsTrigger value="contact">{ts("tab_contact")}</TabsTrigger>
          <TabsTrigger value="security">{ts("tab_security")}</TabsTrigger>
          <TabsTrigger value="advanced">{ts("tab_advanced")}</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent value="general" className="mt-0 outline-none">
            <GeneralSettingsTab form={form} shopSlug={shop.slug} />
          </TabsContent>

          <TabsContent value="contact" className="mt-0 outline-none">
            <ContactSettingsTab form={form} />
          </TabsContent>

          <TabsContent value="security" className="mt-0 outline-none">
            <SecuritySettingsTab />
          </TabsContent>

          <TabsContent value="advanced" className="mt-0 outline-none">
            <AdvancedSettingsTab form={form} />
          </TabsContent>

          {action.result.serverError && (
            <p className="text-sm text-destructive mt-4">
              {action.result.serverError}
            </p>
          )}

          {activeTab !== "security" && (
            <div className="flex justify-end gap-4 mt-6 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={action.isPending}>
                {action.isPending ? tc("saving") : ts("save_changes")}
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </form>
  );
}
