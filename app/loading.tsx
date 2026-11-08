import { Spinner } from "@/components/ui/spinner";
import { monoLabelClass } from "@/lib/utils";

export default function Loading() {
  return (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner className="size-7 text-ocean" />
      <p className={monoLabelClass}>Loading</p>
    </div>
  );
}
