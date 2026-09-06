import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const sourceDir = fileURLToPath(new URL("../src/", import.meta.url));
const readSource = (file) => readFileSync(path.join(sourceDir, file), "utf8");

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(location)
      : /\.(css|tsx)$/.test(entry.name)
        ? [location]
        : [];
  });
}

test("one parish palette supplies semantic component tokens", () => {
  const css = readSource("app/globals.css");
  assert.match(css, /--radius:\s*0\.25rem;/);
  assert.match(css, /--radius-sm:\s*var\(--radius\);/);
  for (const [token, base] of Object.entries({
    popover: "background",
    card: "background",
    input: "border",
    ring: "primary",
    "primary-foreground": "background",
  })) {
    assert.match(css, new RegExp(`--${token}:\\s*var\\(--${base}\\);`));
    assert.match(css, new RegExp(`--color-${token}:\\s*var\\(--${token}\\);`));
  }
  assert.equal((css.match(/:root\s*\{/g) ?? []).length, 1);
});

test("pages and primitives cannot drift back to the legacy parallel palette", () => {
  const legacyColor =
    /(?:bg|text|border|ring|outline|divide|decoration|fill|stroke|from|via|to)-(?:burgundy(?:-deep)?|gold(?:-light)?|paper|cream|ink|stone|line|night)(?=[\s/"'`:])/;
  for (const file of sourceFiles(sourceDir)) {
    assert.doesNotMatch(readFileSync(file, "utf8"), legacyColor, file);
  }
});

test("UI primitives use semantic colors and token-based corners", () => {
  for (const file of sourceFiles(path.join(sourceDir, "components/ui"))) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /rounded(?:-[trbl]{1,2})?-\[/, file);
    assert.doesNotMatch(
      source,
      /(?:bg|text|border|ring)-(?:\[#|(?:slate|gray|zinc|neutral|stone)-\d|black|white)/,
      file,
    );
    assert.doesNotMatch(source, /rounded-[\w-]+!/, file);
  }
});

test("buttons, fields and composite fields share sizing and focus primitives", () => {
  const button = readSource("components/ui/button.tsx");
  assert.match(button, /focus-ring.*rounded-sm/);
  for (const size of ["control-xs", "control-sm", "control", "control-lg"]) {
    assert.ok(button.includes(`h-${size}`));
    assert.ok(readSource("app/globals.css").includes(`--spacing-${size}:`));
  }
  for (const field of ["input", "textarea"]) {
    assert.match(readSource(`components/ui/${field}.tsx`), /controlStyles/);
  }
  const group = readSource("components/ui/input-group.tsx");
  assert.match(group, /focus-within-ring.*h-control.*rounded-sm/);
  assert.match(
    group,
    /<Button\s+type=\{type\}\s+size=\{size\}\s+variant=\{variant\}/,
  );
  assert.doesNotMatch(group, /inputGroupButtonVariants/);
});

test("month navigation uses the shared Select primitive, not a native select", () => {
  const calendar = readSource("components/calendar-explorer.tsx");
  assert.doesNotMatch(calendar, /<select\b|<option\b/);
  assert.match(calendar, /<Select\s/);
  assert.match(calendar, /items=\{monthOptions\}/);
  assert.match(calendar, /<SelectGroup>/);
  assert.match(calendar, /onValueChange=/);
  // Page scrolling must remain available while a month choice closes.
  assert.match(calendar, /modal=\{false\}/);
  const select = readSource("components/ui/select.tsx");
  assert.match(select, /buttonVariants\(\{ variant: "outline", size \}\)/);
  assert.match(select, /rounded-sm border border-border bg-popover/);
  assert.match(select, /shadow-popover/);
  assert.doesNotMatch(
    select,
    /dark:|rounded-lg|ring-3|size-4 text-muted-foreground/,
  );
});
