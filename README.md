# St. Barbara menighet – nettside

Ny nettside for St. Barbara katolske menighet i Kongsberg (erstatter
WordPress-siden på kongsberg.katolsk.no).

## Kjøre lokalt

```bash
cd web
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

Sanity Studio kjøres separat:

```bash
cd studio-st.-barbara-church
npm install
npm run dev
```

## Struktur

- `web/` – Next.js-nettsiden
- `studio-st.-barbara-church/` – standalone Sanity Studio
- `ROADMAP.md` – innhold, migrering og lansering

## Hvor innholdet bor

Sanity Studio er opprettet, men innholdsmodellen er ikke definert ennå. Dagens
innhold redigeres fortsatt i Next.js-koden:

- `web/src/lib/parish.ts` – kontaktinfo, messetider for alle fire steder,
  prester, søndagsblad-lenker
- `web/src/lib/posts.ts` – innlegg/nyheter (legg til et nytt objekt i
  `posts`-arrayet for å publisere)
- `web/public/images/` – bilder (hentet fra menighetens egen mediebank)
- Sidene ligger i `web/src/app/` (messetider, om, katekese, innlegg,
  donasjoner, kontakt)

## Designsystem

- Skrift: Cormorant Garamond (display) + Inter (brødtekst), via `next/font`
- Farger: definert i `web/src/app/globals.css` (`@theme`-blokken) – papir/krem,
  blekksvart, burgunder og gull
- Gjenkjennelig motiv: buede bilderammer (`rounded-t-full`) som ekko av
  kirkens gotiske vinduer

## Språk

Språkvelgeren i toppen bruker Google Translate (cookie-basert, uten
banner). Norsk er kildespråket; EN/PL/ES/VI/UK oversettes maskinelt.

## Status

Dette er en forhåndsvisning («preview for p. Trym»). Alt som er bevisst
utsatt – innhold, migrering, lansering og drift – står prioritert i
[ROADMAP.md](ROADMAP.md).
