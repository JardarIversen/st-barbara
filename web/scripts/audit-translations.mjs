import {
  CONTENT_TYPES,
  COPY_FIELDS,
} from "../../studio-st.-barbara-church/scripts/lib/migrate-translations.mjs";
import { sourceFingerprint } from "../src/i18n/translation-source.mjs";

const query = `*[_type in ${JSON.stringify(CONTENT_TYPES)} && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]`;
const response = await fetch(
  "https://2jd536j2.api.sanity.io/v2026-08-01/data/query/production?query=" +
    encodeURIComponent(query),
);
if (!response.ok)
  throw new Error("Unable to read published content: " + response.status);
const { result } = await response.json();
const missing = [];
const stale = [];
for (const document of result) {
  const english = document.translations?.find(
    (row) => row.language === "en",
  )?.value;
  for (const field of COPY_FIELDS) {
    const source =
      field === "mainImageAlt" ? document.mainImage?.alt : document[field];
    if (
      source === undefined ||
      source === null ||
      source === "" ||
      (Array.isArray(source) && !source.length)
    )
      continue;
    if (
      english?.[field] === undefined ||
      english[field] === null ||
      english[field] === ""
    )
      missing.push({ id: document._id, field });
    else if (
      english.sourceHashes?.[field] &&
      english.sourceHashes[field] !== sourceFingerprint(source)
    )
      stale.push({ id: document._id, field });
  }
}
console.log(
  JSON.stringify({ documents: result.length, missing, stale }, null, 2),
);
if (missing.length || stale.length) process.exitCode = 1;
