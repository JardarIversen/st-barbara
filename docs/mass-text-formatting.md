# Formatering av messetekster

Den ukentlige agenten registrerer struktur fra PDF-en i `massTexts[].body`.
Importeren lager Portable Text som kan redigeres i Sanity. Ingen ny messetekst
eller oversettelse opprettes for formatering; behold eksisterende `sourceKey`,
dato, messe og PDF-kilde når bare oppsettet rettes.

## Responsoriesalme

```json
[
  {"style": "h2", "text": "Responsoriesalme"},
  {"type": "refrain", "text": "Herren er nær den som roper, som ærlig kaller på ham"},
  {"type": "verse", "lines": [
    "Fra dag til dag vil jeg love deg,",
    "evig og alltid prise ditt navn.",
    "Herren er stor og høylovet,",
    "hans storhet kan ingen lodde."
  ]}
]
```

Bruk ett `verse`-objekt per strofe. Omkvedet får automatisk ℟ foran seg,
og hele omkvedet blir fet kursiv. Hver strofe får linjeskift som angitt og
en fet ℟ på egen linje etter siste verslinje. Agenten skal ikke legge inn tegnet.

## Evangelievers

```json
{
  "type": "acclamation",
  "response": "Allelúia.",
  "lines": ["Herre, gjør våre hjerter åpne", "for din Sønns ord."]
}
```

Dette gir «℟ Allelúia. ℣ Herre, gjør våre hjerter åpne», linjeskift,
og «for din Sønns ord. ℟ Allelúia.» Hele avsnittet er sentrert i kursiv;
bare tegnene ℟ og ℣ er fete, ikke ordene i omkvedet eller verset.
Nettsiden kan bryte lange linjer videre på smale skjermer.

`response` kopieres fra kilden, ikke fra en antagelse om kirkeårstiden.
Utelat feltet hvis kilden bare har verset; da genereres bare ℣ og verslinjene.
Bruk vanlig Portable Text ved andre liturgiske strukturer.

## Kontroll og vedlikehold

- `lines` er en ikke-tom liste med én ikke-tom streng per verslinje. Ikke legg
  linjeskift, ℟ eller ℣ inn i strengene; bruk flere listeelementer for flere linjer.
- Vanlige lesninger bruker avsnitt, ikke én linje per PDF-linje.
- Tørrtesten avviser ukjente typer, ukjente felt, tomme linjer og manuelle responstegn.
  Sammenflatet tekst med ℟ gir en advarsel som må vurderes mot PDF-en.
- Verifikasjon sammenligner messetekstens lagrede tekst og formatering med manifestet.
- Kontroller nettsiden mot PDF-en på både bred og smal skjerm. Tester kan kontrollere
  tegn, linjeskift og tekstutheving, men kan ikke fastslå riktig avskrift av PDF-en.
- Gjentatt import genererer samme blokknøkler og oppretter ingen ny revisjon når
  innholdet er uendret. Eldre strenger og Portable Text-blokker støttes fortsatt.

Et komplett manifesteksempel med lesninger finnes i
[`bulletin-manifest.example.json`](../studio-st.-barbara-church/scripts/bulletin-manifest.example.json).
Bytt ut eksemplets innhold, datoer, referanser og PDF-sti ved en ny import.

Evangelievers lagres med blokkstilen `acclamation`, som er registrert i Studio
og rendres av nettsidens `PortableContent`. Publiser nettstedets og Studios
kodeoppdateringer før det nye formatet tas i bruk i produksjon.
