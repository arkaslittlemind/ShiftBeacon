import { cn, monoLabelClass } from "@/lib/utils";

/** The Newsreader display size shared by every marketing section heading. */
export const sectionTitleClass =
  "font-heading text-[2.25rem] leading-[1.08] font-normal tracking-tight md:text-[3rem]";

export function SectionHead({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-xl items-start",
        className
      )}
    >
      {eyebrow ? <p className={monoLabelClass}>{eyebrow}</p> : null}
      <h2 className={cn(sectionTitleClass, "text-foreground")}>
        {title}
      </h2>
      {description ? (
        <p className="text-base text-muted-foreground md:text-[1.0625rem]">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
