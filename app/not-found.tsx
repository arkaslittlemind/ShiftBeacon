import Link from "next/link";
import { MapIcon } from "@/components/icons";
import { StatePanel } from "@/components/shared/state-panel";
import { Button } from "@/components/ui/button";
import { touchTargetClass } from "@/lib/utils";

export default function NotFound() {
  return (
    <StatePanel
      icon={MapIcon}
      title="Page not found"
      description="The page you're looking for doesn't exist or may have moved."
    >
      <Button asChild className={touchTargetClass}>
        <Link href="/">Back to home</Link>
      </Button>
    </StatePanel>
  );
}
