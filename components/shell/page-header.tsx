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
    <div className="mb-6">
      <p className="mb-1.5 font-heading text-xs font-bold tracking-wide text-accent-dark uppercase">
        {eyebrow}
      </p>
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
