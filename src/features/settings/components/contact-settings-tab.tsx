"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import locationData from "@/constants/myanmar-region-division-township.json";
import type { SettingsFormApi } from "@/features/settings/components/settings-tab-types";
import { useTranslations } from "next-intl";

type ContactSettingsTabProps = {
  form: SettingsFormApi;
};

export function ContactSettingsTab({ form }: ContactSettingsTabProps) {
  const ts = useTranslations("Settings");
  const phones = form.watch("contactPhones") ?? [];
  const selectedRegion = form.watch("region") ?? "";
  const selectedDivision = form.watch("division") ?? "";
  const selectedTownship = form.watch("township") ?? "";

  const divisions =
    locationData.find((item) => item.region === selectedRegion)?.divisions ??
    [];
  const townships =
    divisions.find((item) => item.division === selectedDivision)?.townships ??
    [];

  function addPhone() {
    form.setValue("contactPhones", [...phones, ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function removePhone(index: number) {
    form.setValue(
      "contactPhones",
      phones.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function updatePhone(index: number, value: string) {
    const next = [...phones];
    next[index] = value;
    form.setValue("contactPhones", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="flex flex-col gap-6 border rounded-xl p-6 bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactEmail">{ts("contact_email")}</Label>
          <Input
            id="contactEmail"
            type="email"
            {...form.register("contactEmail")}
          />
          {form.formState.errors.contactEmail && (
            <p className="text-sm text-destructive">
              {form.formState.errors.contactEmail.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>{ts("contact_phones")}</Label>
          {phones.map((phone, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={phone}
                onChange={(event) => updatePhone(index, event.target.value)}
                placeholder={ts("phone_placeholder")}
              />
              {phones.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePhone(index)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={18} />
                </Button>
              )}
            </div>
          ))}
          {form.formState.errors.contactPhones && (
            <p className="text-sm text-destructive">
              {form.formState.errors.contactPhones.message ??
                form.formState.errors.contactPhones.root?.message}
            </p>
          )}
          {phones.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addPhone}
            >
              <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
              {ts("add_phone")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="region">{ts("region")}</Label>
          <Select
            value={selectedRegion || undefined}
            onValueChange={(value) => {
              form.setValue("region", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              form.setValue("division", "", {
                shouldDirty: true,
                shouldValidate: true,
              });
              form.setValue("township", "", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger id="region" className="w-full">
              <SelectValue placeholder={ts("region")} />
            </SelectTrigger>
            <SelectContent>
              {locationData.map((item) => (
                <SelectItem key={item.region} value={item.region}>
                  {item.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.region && (
            <p className="text-sm text-destructive">
              {form.formState.errors.region.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="division">{ts("division")}</Label>
          <Select
            value={selectedDivision || undefined}
            disabled={!selectedRegion}
            onValueChange={(value) => {
              form.setValue("division", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              form.setValue("township", "", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger id="division" className="w-full">
              <SelectValue placeholder={ts("division")} />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((item) => (
                <SelectItem key={item.division} value={item.division}>
                  {item.division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.division && (
            <p className="text-sm text-destructive">
              {form.formState.errors.division.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="township">{ts("township")}</Label>
          <Select
            value={
              (townships.includes(selectedTownship) && selectedTownship) ||
              undefined
            }
            disabled={!selectedDivision}
            onValueChange={(value) =>
              form.setValue("township", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="township" className="w-full">
              <SelectValue placeholder={ts("township")} />
            </SelectTrigger>
            <SelectContent>
              {townships.map((township) => (
                <SelectItem key={township} value={township}>
                  {township}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.township && (
            <p className="text-sm text-destructive">
              {form.formState.errors.township.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="address">{ts("address")}</Label>
          <Input id="address" {...form.register("address")} />
          {form.formState.errors.address && (
            <p className="text-sm text-destructive">
              {form.formState.errors.address.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
