import assert from "node:assert/strict";
import test from "node:test";
import { parishShareImage, shareMetadata } from "../src/lib/share.ts";

const image = { assetRef: "image-a53d25a5d216dc687dfb96b8b07079dbe5701f1e-1304x1200-jpg", alt: "Familien i St. Barbara kirke" };

test("a page with a main image shares that image, cropped to the link preview size", () => {
  const { openGraph, twitter } = shareMetadata("nb", { title: "Dåpsglede i St. Barbara", image });
  const [shared] = openGraph.images;
  assert.match(shared.url, /^https:\/\/cdn\.sanity\.io\/images\/2jd536j2\/production\/a53d25a5.*w=1200&h=630&fit=crop/);
  assert.deepEqual([shared.width, shared.height, shared.alt], [1200, 630, "Familien i St. Barbara kirke"]);
  assert.equal(openGraph.title, "Dåpsglede i St. Barbara");
  assert.deepEqual(twitter.images, [shared.url]);
});

test("a page's own image does not drop the language the layout sets", () => {
  assert.equal(shareMetadata("nb", { image }).openGraph.locale, "nb_NO");
  assert.equal(shareMetadata("en", { image }).openGraph.locale, "en_GB");
});

test("a page without a main image shares the parish image and leaves the title to the layout", () => {
  const { openGraph, twitter } = shareMetadata("nb");
  assert.deepEqual(openGraph.images, [parishShareImage]);
  assert.equal("title" in openGraph, false);
  assert.deepEqual(twitter.images, ["/parish-share.png"]);
});
