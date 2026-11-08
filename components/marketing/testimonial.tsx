import { Avatar } from "@/components/shared/avatar";

// Illustrative, like the trusted-by names: role only, no invented person.
export function Testimonial() {
  return (
    <section className="px-5 py-20 md:px-10 md:py-28">
      <figure className="mx-auto max-w-3xl text-center">
        <blockquote className="font-heading text-[1.75rem] leading-[1.3] font-light tracking-tight text-foreground md:text-[2.25rem]">
          &ldquo;Night shift used to end with a clipboard and a guess. Now I open one screen and I
          know exactly who&apos;s here.&rdquo;
        </blockquote>
        <figcaption className="mt-8 inline-flex items-center gap-3 text-left text-sm">
          <Avatar initials="NM" className="size-10 text-sm" />
          <span className="text-muted-foreground">
            <b className="block font-semibold text-foreground">Nurse Manager</b>
            Harborview Care
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
