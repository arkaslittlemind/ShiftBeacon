import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

/**
 * A painting that fills its parent, which sets the size and `relative`. Pass
 * the crop as an `object-[x%_y%]` class: Tailwind only sees class names that
 * appear whole in source, so the position cannot be a runtime value.
 */
export function Painting({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: StaticImageData;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      fill
      priority={priority}
      placeholder="blur"
      className={cn("object-cover", className)}
    />
  );
}
