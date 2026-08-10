type PlaceholderSettingsTabProps = {
  label: string;
};

export function PlaceholderSettingsTab({ label }: PlaceholderSettingsTabProps) {
  return (
    <div className="flex flex-col gap-5 border rounded-xl p-6 bg-card min-h-[300px] items-center justify-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
