import { createHash } from "node:crypto";

// Ignore storage-only keys, retaining the wording, order and link destinations.
function semanticValue(value) {
  if (Array.isArray(value)) return value.map(semanticValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !["_key", "_type"].includes(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, semanticValue(item)]),
  );
}

export function sourceFingerprint(value) {
  return createHash("sha256")
    .update(JSON.stringify(semanticValue(value ?? null)))
    .digest("hex");
}
