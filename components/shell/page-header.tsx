import { cn, monoLabelClass } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-7">
      <p className={cn("mb-2", monoLabelClass)}>
        {eyebrow}
      </p>
      <h1 className="font-heading text-[2.4rem] leading-[1.05] font-normal tracking-tight text-foreground md:text-[2.75rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
