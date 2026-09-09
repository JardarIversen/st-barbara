# St. Barbara menighet

Nettside for St. Barbara katolske menighet i Kongsberg, Notodden, Rjukan og Mo.

## Kjøre lokalt

Kjør `npm install` og `npm run dev` i `web/`. Åpne http://localhost:3000.
Sanity Studio kjøres separat med de samme kommandoene i `studio-st.-barbara-church/`.

## Innhold og struktur

- `web/`: Next.js-nettsiden med norske og engelske sider.
- `studio-st.-barbara-church/`: Sanity Studio, skjemaer og importverktøy.
- Sanity-prosjekt `2jd536j2`, datasett `production`: steder, messeplaner, avvik, hendelser, kunngjøringer, innlegg, messetekster og søndagsblader.
- `web/public/images/`: bilder til sidene.
- `AGENTS.md`: arbeidsflyt for ukentlig PDF-import, kildekontroll og oversettelser.

Kalenderen beregner messer fra faste planer. Søndagsbladet er autoriteten for datoene det dekker; avvik lagres separat. Hendelser med påmeldingsfrist vises også under Kunngjøringer frem til fristen. En valgfri fremhevingsperiode på hendelsen overstyrer denne automatikken. Begge visningene bruker samme dokument.

## Språk og design

Norsk (`/nb`) og kontrollert engelsk (`/en`) deler Sanity-dokumenter. Redaksjonelle oversettelser ligger i Sanity; faste grensesnitttekster ligger i `web/src/i18n/en.json`. Språkvelgeren har 30 språk med flagg og søk. Øvrige språk oversettes fra engelsk med Google Translate.

Felles designtokens ligger i `web/src/app/globals.css`. Se [designsystemet](docs/design-system.md), [språk og bilder](docs/languages-and-photos.md) og [lesningskilder](docs/reading-sources.md).

## Kontroll og publisering

Kjør `npm run test`, `npm run lint` og `npm run build` i `web/`. Studio har `npm run lint`, `npm run typecheck` og `npm run build`.

GitHub-grenen `main` publiseres automatisk til Vercel. Studio publiseres separat med `npm run deploy`. Sanity-innhold publiseres direkte; ved forsinket visning kontrolleres nettsidens hurtigbuffer.

Se [veikartet](ROADMAP.md) for videre arbeid.
