import assert from "node:assert/strict";
const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:3000";
// Sample a currently published article instead of a slug that can be retired.
const archive = await fetch(new URL("/nb/innlegg", baseUrl));
assert.equal(archive.status, 200);
const articlePath = (await archive.text()).match(
  /href="\/nb(\/innlegg\/[^"?#]+)"/,
)?.[1];
assert.ok(articlePath, "The article archive supplies a detail page to verify");
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
  articlePath,
];
for (const locale of ["nb", "en", "pl"]) {
  const sourceLocale = locale === "nb" ? "nb" : "en";
  for (const path of paths) {
    const url = new URL("/" + locale + path, baseUrl).href;
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    const html = await response.text();
    assert.ok(
      html.includes('<html lang="' + sourceLocale + '"'),
      url + " has the correct document language",
    );
    assert.ok(
      html.includes(
        'rel="canonical" href="https://kongsberg.katolsk.no/' +
          sourceLocale +
          path +
          '"',
      ),
      url + " has the correct editorial canonical URL",
    );
    assert.ok(
      !html.includes("Fair times"),
      url + " does not have ambiguous church terminology",
    );
    console.log(response.status, locale + path);
  }
}
const redirect = await fetch(new URL("/om?test=1", baseUrl), {
  redirect: "manual",
});
assert.equal(redirect.status, 307);
assert.match(redirect.headers.get("location"), /\/nb\/om\?test=1$/);
console.log("Legacy route redirect preserves query: OK");

for (const [path, cookie, expected] of [
  ["/", "site_language=pl", "/pl"],
  ["/", "site_language=en", "/en"],
  ["/", "site_language=invalid", "/nb"],
  ["/", "googtrans=/en/pl", "/nb"],
  ["/om?test=1", "site_language=pl", "/pl/om?test=1"],
  ["/en/om?translate=pl&test=1", "site_language=es", "/pl/om?test=1"],
  ["/en?translate=zh-Hans", "", "/zh-CN"],
  ["/no/om", "", "/nb/om"],
]) {
  const response = await fetch(new URL(path, baseUrl), {
    headers: { cookie },
    redirect: "manual",
  });
  assert.equal(response.status, 307, path);
  assert.equal(
    new URL(response.headers.get("location"), baseUrl).href,
    new URL(expected, baseUrl).href,
  );
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.match(response.headers.get("vary"), /Cookie/i);
}
console.log(
  "Saved preferences, old translation links and private redirects: OK",
);

for (const language of ["nb", "en", "pl", "ar", "zh-CN"]) {
  const automatic = !["nb", "en"].includes(language);
  const response = await fetch(new URL(`/${language}/om`, baseUrl), {
    redirect: "manual",
    headers: {
      cookie: "site_language=es; googtrans=/en/es",
      "x-site-locale": "nb",
      "x-site-language": "es",
      "x-site-path": "/fake",
    },
  });
  assert.equal(response.status, 200, language);
  assert.equal(
    response.headers.get("set-cookie"),
    null,
    "Direct visits do not change the saved preference",
  );
  const html = await response.text();
  assert.ok(
    html.includes(`href="/${language}/messetider"`),
    `${language} navigation retains its URL language`,
  );
  assert.ok(
    html.includes(
      `href="https://kongsberg.katolsk.no/${automatic ? "en" : language}/om"`,
    ),
  );
  assert.ok(html.includes('hrefLang="nb"') || html.includes('hreflang="nb"'));
  assert.ok(html.includes('hrefLang="en"') || html.includes('hreflang="en"'));
  assert.ok(!/href[Ll]ang="(?:pl|ar|zh-CN)"/.test(html));
  if (automatic) {
    assert.equal(response.headers.get("x-robots-tag"), "noindex, follow");
    assert.ok(html.includes('name="robots" content="noindex, follow"'));
    assert.ok(html.includes("Loading automatic translation from English…"));
    assert.ok(
      html.includes('<html lang="en"'),
      "Source document stays English until translated",
    );
  } else {
    assert.equal(response.headers.get("x-robots-tag"), null);
    assert.ok(!html.includes('name="robots" content="noindex, follow"'));
    assert.ok(!html.includes('role="status"'));
  }
}
console.log(
  "Explicit URLs, translated navigation, source language and indexing: OK",
);

const catechesis = await fetch(
  new URL("/pl/innlegg/pamelding-til-katekese-2026-2027", baseUrl),
  {
    redirect: "manual",
  },
);
assert.equal(catechesis.status, 308);
assert.equal(
  new URL(catechesis.headers.get("location"), baseUrl).pathname,
  "/pl/katekese",
);
console.log(
  "Article information-page redirect retains the selected language: OK",
);
