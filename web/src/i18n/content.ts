import type { Locale } from "./config";
import { sourceFingerprint } from "./translation-source.mjs";

const textFields = new Set([
  "title",
  "titleOverride",
  "summary",
  "notes",
  "publicNote",
  "category",
  "name",
  "alt",
  "label",
  "text",
]);
const copyFields = new Set([...textFields, "body", "details", "links"]);
const originalTrackedFields = new Set([
  "title",
  "titleOverride",
  "summary",
  "notes",
  "publicNote",
  "body",
  "details",
]);
type RecordValue = Record<string, unknown>;

// All editorial translations live beside their source in Sanity, not in code.
// This runs on the server; dates, IDs, references, addresses and URLs stay shared.
export function localizeContent<T>(input: T, locale: Locale): T {
  if (locale === "nb") return input;
  function visit(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => visit(item));
    if (!value || typeof value !== "object") return value;
    const object = value as RecordValue;
    const translations = object.translations as
      Array<{ language: string; value: RecordValue }> | undefined;
    const copy = translations?.find((item) => item.language === locale)?.value;
    const hashes = copy?.sourceHashes as Record<string, string> | undefined;
    const result: RecordValue = {};
    const originalFields: string[] = [];
    for (const [field, original] of Object.entries(object)) {
      if (field === "translations") continue;
      const hasCopy =
        copyFields.has(field) &&
        copy?.[field] !== undefined &&
        copy[field] !== null &&
        copy[field] !== "" &&
        (!hashes?.[field] || hashes[field] === sourceFingerprint(original));
      const needsOriginal =
        !hasCopy &&
        originalTrackedFields.has(field) &&
        !!original &&
        (!Array.isArray(original) || original.length > 0);
      result[field] = hasCopy
        ? copy![field]
        : needsOriginal
          ? original
          : visit(original);
      // Link labels are translated, destinations are always the source's URLs.
      if (field === "links" && hasCopy && Array.isArray(original)) {
        const labels = copy!.links as Array<RecordValue>;
        result.links = original.map((link: RecordValue) => {
          const translated = labels.find((item) => item.url === link.url);
          return { ...link, label: translated?.label ?? link.label };
        });
      }
      if (field === "mainImage" && original && typeof original === "object") {
        const source = original as RecordValue;
        if (
          typeof copy?.mainImageAlt === "string" &&
          (!hashes?.mainImageAlt ||
            hashes.mainImageAlt === sourceFingerprint(source.alt))
        ) {
          result.mainImage = { ...source, alt: copy.mainImageAlt };
        }
      }
      if (needsOriginal) originalFields.push(field);
    }
    if (originalFields.length) result.originalFields = originalFields;
    return result;
  }
  return visit(input) as T;
}
