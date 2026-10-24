import type { Metadata } from "next";
import type { SanityImageValue } from "@/sanity/types";
import { urlForImage } from "../sanity/image.ts";

// Facebook and X show link previews at 1.91:1.
const width = 1200;
const height = 630;

export const parishShareImage = {
  url: "/parish-share.png",
  width,
  height,
  alt: "St. Barbara menighet, Kongsberg",
};

// A page that sets openGraph replaces all of the layout's openGraph, so every page builds the
// whole object here. Pages with a main image share that image rather than the parish default.
export function shareMetadata(
  locale: string,
  { title, image }: { title?: string; image?: SanityImageValue } = {},
): Pick<Metadata, "openGraph" | "twitter"> {
  const shared = image?.assetRef
    ? {
        url: urlForImage(image)
          .width(width)
          .height(height)
          .fit("crop")
          .auto("format")
          .url(),
        width,
        height,
        alt: image.alt,
      }
    : parishShareImage;
  return {
    openGraph: {
      locale: locale === "en" ? "en_GB" : "nb_NO",
      ...(title && { title }),
      images: [shared],
    },
    twitter: { card: "summary_large_image", images: [shared.url] },
  };
}
