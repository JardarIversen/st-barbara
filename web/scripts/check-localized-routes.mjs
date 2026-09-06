import assert from "node:assert/strict";
const paths = [
  "",
  "/om",
  "/kontakt",
  "/katekese",
  "/donasjoner",
  "/innlegg",
  "/kunngjoringer",
  "/messetider",
  "/messetider/mass-schedule-kongsberg-sunday-nb-1100-2026-09-06",
  "/innlegg/brev-til-de-troende-i-og-rundt-rjukan",
];
for (const locale of ["nb", "en"]) {
  for (const path of paths) {
    const url = "http://127.0.0.1:3000/" + locale + path;
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    const html = await response.text();
    assert.ok(
      html.includes('lang="' + locale + '"'),
      url + " has the correct document language",
    );
    assert.ok(
      html.includes(
        'rel="canonical" href="https://kongsberg.katolsk.no/' +
          locale +
          path +
          '"',
      ),
      url + " has its own canonical URL",
    );
    assert.ok(
      !html.includes("Fair times"),
      url + " does not have ambiguous church terminology",
    );
    console.log(response.status, locale + path);
  }
}
const redirect = await fetch("http://127.0.0.1:3000/om?test=1", {
  redirect: "manual",
});
assert.equal(redirect.status, 307);
assert.match(redirect.headers.get("location"), /\/nb\/om\?test=1$/);
console.log("Legacy route redirect preserves query: OK");
