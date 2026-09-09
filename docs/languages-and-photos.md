# Norsk/engelsk og vigselsbilder

## Nettstedet

- `/nb/…` er norsk original, `/en/…` er kontrollert engelsk. Adresser uten språk videresendes til norsk. Sidestier og hendelses-ID-er er felles.
- Språkvelgeren beholder sidesti, søkeparametere og anker. Norsk og engelsk bruker aldri Google Translate. Andre språk åpner engelsk først, og viser et varsel om automatisk oversettelse. Hvis Google ikke laster, beholdes engelsk med en feilmelding.
- `web/src/i18n/en.json` inneholder den redigerte engelske UI-teksten. Nye tekstnøkler kontrolleres av testene.
- Alle redaksjonelle innholdsoversettelser hentes fra `translations` på originaldokumentet i Sanity, med `sanity-plugin-internationalized-array`. Ingen dobbeltførte hendelser, datoer eller referanser. UI-ordboken i koden er bare for sidens faste tekster.
- Nye og endrede tekster vedlikeholdes via `translations.en` i ukesmanifestet. `sourceHashes` genereres automatisk: foreldet engelsk vises ikke etter endring av originalen. Be agenten oppdatere oversettelsen ved endret norsk tekst; denne kontrollmetadataen skal ikke håndredigeres.
- Manglende oversettelse vises og merkes som norsk original med `lang="nb"` og `translate="no"`, ikke som en blandet engelsk/automatisk tekst. «Holy Mass» brukes når messe står alene på engelsk, for å unngå at Google tolker «Mass» som fysisk masse.
- Datoer, klokkeslett, ID-er, status, messespråk, adresser og lenkeadresser deles, ikke oversettes. Norsk søndagsblad og liturgiske lesninger beholder originalspråket. Oversatte brev merkes som oversettelser med lenke til originalen.

Eksempel (på en ellers komplett manifestoppføring):

```json
{
  "translations": {
    "en": {
      "title": "Family Mass in Kongsberg",
      "summary": "Coffee in the parish hall after Mass.",
      "body": ["Everyone is welcome to join us after Mass."]
    }
  }
}
```

Kun tekstfelt tillates; importen avviser f.eks. `translations.en.startsAt`.
Norsk tekst som oppdateres uten ny engelsk tekst, skal ikke beholde en foreldet Sanity-oversettelse.

## Språksøk og Google Translate

- shadcn/ui (Base UI, Nova) `Popover` + `Command` brukes til søkbar språkvelger. Tastaturnavigasjon, Escape og valg med Enter støttes. Norsk/engelsk står først, deretter 28 utvalgte språk med Google Translate fra engelsk.
- Velgeren har nøyaktig 30 språk, alle med SVG-flagg fra `country-flag-icons`. Utvalget er en redaksjonell startliste for menigheten, ikke en statistisk rangering. Polsk, vietnamesisk, filippinsk, tamilsk og andre sentrale katolske språkgrupper prioriteres, med [innvandrersjelesorgen i OKB](https://www.katolsk.no/organisasjon/okb/innvandrersjelesorgen) som bakgrunn. Språknavn er alltid med; flagget er bare en visuell ledetråd, ikke en påstand om brukerens nasjonalitet.
- Søk matcher språkets eget navn, norsk navn, engelsk navn og kode. Koder som `zh-TW` og `mni-Mtei` bevares ved navigasjon. Menyen selv skal ikke maskinoversettes.
- Hele leverandørkatalogen er beholdt som vedlikeholdsgrunnlag i `web/src/i18n/google-languages.json`, men bare utvalget i `web/src/i18n/languages.ts` vises og godtas i URL-er/informasjonskapsler. Oppdatering med `node scripts/update-translation-languages.mjs` utvider derfor ikke menyen. Flaggkoblingene ligger i `web/src/i18n/language-flags.ts`. Katalogkilden er Googles offentlige [Website Translator-liste](https://translate.google.com/translate_a/l?client=te&alpha=true&hl=en), ikke en stabilitetsgarantert API-kontrakt. Vanlige besøk gjør ikke dette kallet.
- Ingen betalt AI- eller oversettelses-API er koblet til. Agenten skriver engelsk én gang ved import; Google oversetter øvrige språk i nettleseren. Den automatiske oversettelsen er merket og kan feile eller ha språklige feil.
- Liturgiske originaltekster beskyttes fortsatt mot maskinoversettelse. Se `reading-sources.md` før eventuell integrasjon av engelske lesninger.

## Bilder og originaler

Kilde: menighetens mediebibliotek, lastet opp 25. september 2023. Ingen antagelse om hvem fotografen er basert på opplasterkontoen.

| Bildefil | Original |
| --- | --- |
| `kirkevigsel-alter.webp` | https://kongsberg.katolsk.no/wp-content/uploads/2023/09/IMG_9158.jpg |
| `kirkevigsel-menighet.webp` | https://kongsberg.katolsk.no/wp-content/uploads/2023/09/IMG_9125.jpg |
| `kirkevigsel-salving-rettet.webp` | https://kongsberg.katolsk.no/wp-content/uploads/2023/09/IMG_9160.jpg |

Originalene er bevart lokalt i `.local/image-originals/` (ikke i git). Webfilene ligger i `web/public/images/`.

`web/scripts/prepare-consecration-photos.py` normaliserer EXIF-rotasjon, beskjærer forsiktig og lager WebP-filer med maks 2200 piksler på lengste side. IMG_9160 har EXIF-orientering 8; i tillegg til stående orientering er kameraets skjevhet rettet med 3,2 grader med klokken. Beskjæringen fjerner tomme kanter etter rettingen. Ingen personer eller dokumentariske detaljer er lagt til eller fjernet med generativ KI.

## Kontroll

- Test også produksjonsmodus (`npm run build`, deretter `npm run start -- --port 3001`). Sett `SITE_URL=http://localhost:3001` og kjør `node scripts/check-localized-routes.mjs`. Samme kontroll kan kjøres mot produksjonsdomenet. Utviklingsmodus alene oppdager ikke alle renderfeil.
- Innleggssidene bruker request-basert språk og metadata. Statisk generering må støtte samme språk- og metadataflyt.

- `cd web; npm run test`: kirkelig terminologi, ordbokdekning, dataintegritet på tvers av språk, Oslo-tid, kalenderfiltre og import-idempotens.
- `npm run lint` og `npm run build` i web, `npm run build` i Studio.
- `node scripts/audit-translations.mjs` i web kontrollerer manglende og foreldede publiserte Sanity-oversettelser.
- Visuell kontroll på desktop og 390 px mobil: språkvelger, kalender, filter, detaljside og vigselsbilder.
- Publisering av Studio/kode gjøres først etter godkjenning. Ukentlig PDF-import følger fortsatt den særskilt autoriserte arbeidsflyten i AGENTS.md.


Lokalt må nettadressen være tillatt som Sanity Live-origin for at automatisk oppdatering skal fungere. Kontroller tillatte domener og live-oppdatering ved endringer i hostingoppsettet.
