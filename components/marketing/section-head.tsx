export function SectionHead({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-[620px] text-center">
      <h2 className="mb-3.5 text-2xl font-bold md:text-3xl">{title}</h2>
      <p className="text-[15.5px] text-muted-foreground">{description}</p>
    </div>
  );
}
