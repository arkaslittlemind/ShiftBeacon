export function Testimonial() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="mx-auto max-w-[720px] text-center">
          <blockquote className="mb-5.5 font-heading text-xl leading-[1.4] font-bold md:text-2xl">
            &ldquo;We finally know who&apos;s actually on-site during a shift,
            not just who was scheduled. It&apos;s removed a whole category of
            end-of-month reconciliation.&rdquo;
          </blockquote>
          <p className="text-sm font-semibold text-muted-foreground">
            Operations Lead{" "}
            <span className="font-normal text-faint">
              &middot; Community Care Provider
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
