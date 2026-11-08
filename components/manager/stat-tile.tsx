import { Card } from "@/components/ui/card";
import { monoLabelClass } from "@/lib/utils";
import type { IconComponent } from "@/types/icons";

export function StatTile({
  label,
  icon: Icon,
  value,
  detail,
}: {
  label: string;
  icon: IconComponent;
  value: string;
  detail: string;
}) {
  return (
    <Card className="gap-2 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className={monoLabelClass}>{label}</p>
        <Icon aria-hidden className="size-4 shrink-0 text-faint" />
      </div>
      <p className="font-heading text-[2rem] leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </Card>
  );
}
