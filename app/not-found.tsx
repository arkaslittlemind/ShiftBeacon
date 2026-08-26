import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center border-2 border-border bg-secondary text-muted-foreground">
        <Compass className="size-6" />
      </div>
      <div>
        <h1 className="mb-1.5 text-xl font-bold">Page not found</h1>
        <p className="max-w-[46ch] text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
