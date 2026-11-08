import Image from "next/image";
import dashboardBanner from "@/public/images/app/dashboard-banner.jpg";
import { SparkleAi01Icon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { monoLabelClass } from "@/lib/utils";

export function WelcomeBanner({
  eyebrow,
  firstName,
  statusLine,
  onShift,
}: {
  eyebrow: string;
  firstName: string;
  statusLine: string;
  onShift: number;
}) {
  return (
    <Card className="mb-6 grid gap-0 py-0 md:min-h-52 md:grid-cols-[minmax(0,1fr)_44%]">
      <div className="flex flex-col justify-center gap-2 p-6 md:p-8">
        <p className={monoLabelClass}>{eyebrow}</p>
        <h1 className="font-heading text-[2.4rem] leading-[1.05] font-normal tracking-tight text-foreground md:text-[2.75rem]">
          {firstName ? `Hello, ${firstName}` : "Hello"}
        </h1>
        <p className="text-base text-muted-foreground">{statusLine}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild className="min-h-11 md:min-h-9">
            <a href="#staff">
              <UserIcon data-icon="inline-start" aria-hidden />
              View staff
            </a>
          </Button>
          <Button asChild variant="outline" className="min-h-11 md:min-h-9">
            <a href="#handover">
              <SparkleAi01Icon data-icon="inline-start" aria-hidden />
              Read handover
            </a>
          </Button>
        </div>
      </div>
      {/* Faded in from the text side: from the top on phones, where the
          painting is a strip under the copy, and from the left beside it. */}
      <div className="relative h-36 overflow-hidden mask-[linear-gradient(180deg,transparent_0%,#000_22%)] md:h-auto md:mask-[linear-gradient(90deg,transparent_0%,#000_24%)]">
        <Image
          src={dashboardBanner}
          alt=""
          placeholder="blur"
          fill
          sizes="(min-width: 768px) 44vw, 100vw"
          className="object-cover object-[45%_50%]"
        />
        <p
          aria-hidden
          className="absolute top-4 right-4 rounded-lg border border-card/95 bg-card/82 px-3.5 py-2.5 shadow-md backdrop-blur-[6px] md:top-5 md:right-5"
        >
          <span className="block text-xl leading-tight font-semibold tracking-tight text-foreground">
            {onShift}
          </span>
          <span className="block text-xs text-muted-foreground">on shift now</span>
        </p>
      </div>
    </Card>
  );
}
