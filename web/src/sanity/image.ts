import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageValue } from "./types";
import { sanityDataset, sanityProjectId } from "./env";

const builder = createImageUrlBuilder({
  projectId: sanityProjectId,
  dataset: sanityDataset,
});

export function urlForImage(image: SanityImageValue) {
  return builder.image({
    asset: { _ref: image.assetRef },
    crop: image.crop,
    hotspot: image.hotspot,
  });
}
