import Image from "next/image";
import type { SanityImageValue } from "@/sanity/types";
import { urlForImage } from "@/sanity/image";

type SanityImageProps = {
  image: SanityImageValue;
  className?: string;
  priority?: boolean;
  sizes: string;
};

export default function SanityImage({
  image,
  className,
  priority,
  sizes,
}: SanityImageProps) {
  const src = urlForImage(image).width(1440).fit("max").auto("format").url();

  return (
    <Image
      src={src}
      // A picture without a description in Sanity sits beside its own title; empty alt keeps
      // screen readers from announcing a nameless image.
      alt={image.alt ?? ""}
      fill
      preload={priority}
      sizes={sizes}
      placeholder={image.lqip ? "blur" : "empty"}
      blurDataURL={image.lqip}
      className={className}
    />
  );
}
