"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { SettingsFormApi } from "@/features/settings/components/settings-tab-types";
import { DayOfWeek } from "@/generated/prisma/enums";
import { useTranslations } from "next-intl";

const DAYS = Object.values(DayOfWeek);

type AdvancedSettingsTabProps = {
  form: SettingsFormApi;
};

export function AdvancedSettingsTab({ form }: AdvancedSettingsTabProps) {
  const ts = useTranslations("Settings");
  const operatingHours = form.watch("operatingHours") ?? [];

  function updateDay(
    index: number,
    value: Partial<(typeof operatingHours)[number]>,
  ) {
    const next = [...operatingHours];
    next[index] = { ...next[index], ...value };
    form.setValue("operatingHours", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="flex flex-col gap-6 border rounded-xl p-6 bg-card">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{ts("operating_hours")}</h2>
        <p className="text-sm text-muted-foreground">
          {ts("operating_hours_description")}
        </p>
      </div>

      <div className="flex flex-col divide-y rounded-lg border">
        {DAYS.map((day, index) => {
          const current = operatingHours[index] ?? {
            dayOfWeek: day,
            isClosed: false,
            openTime: "09:00",
            closeTime: "18:00",
          };

          return (
            <div
              key={day}
              className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(8rem,1fr)_auto_minmax(15rem,1.5fr)] md:items-center"
            >
              <div className="font-medium">{ts(`days.${day}`)}</div>

              <div className="flex items-center gap-2">
                <Switch
                  id={`operatingHours.${index}.isClosed`}
                  checked={!current.isClosed}
                  onCheckedChange={(checked) =>
                    updateDay(index, {
                      dayOfWeek: day,
                      isClosed: !checked,
                      openTime: checked ? current.openTime || "09:00" : "",
                      closeTime: checked ? current.closeTime || "18:00" : "",
                    })
                  }
                />
                <Label htmlFor={`operatingHours.${index}.isClosed`}>
                  {current.isClosed ? ts("closed") : ts("open")}
                </Label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`operatingHours.${index}.openTime`}>
                    {ts("open_time")}
                  </Label>
                  <Input
                    id={`operatingHours.${index}.openTime`}
                    type="time"
                    value={current.openTime}
                    disabled={current.isClosed}
                    onChange={(event) =>
                      updateDay(index, {
                        dayOfWeek: day,
                        openTime: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`operatingHours.${index}.closeTime`}>
                    {ts("close_time")}
                  </Label>
                  <Input
                    id={`operatingHours.${index}.closeTime`}
                    type="time"
                    value={current.closeTime}
                    disabled={current.isClosed}
                    onChange={(event) =>
                      updateDay(index, {
                        dayOfWeek: day,
                        closeTime: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {form.formState.errors.operatingHours && (
        <p className="text-sm text-destructive">
          {form.formState.errors.operatingHours.message}
        </p>
      )}
    </div>
  );
}
