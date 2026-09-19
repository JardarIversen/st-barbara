# Søndagsblad 20. september 2026

Importert 19. september 2026 fra p. Tryms e-post «Søndagsark», mottatt 18. september kl. 13.44 norsk tid. Siste publiserte blad før importen var 13. september; ingen utgave eller messetekst for 20. september fantes fra før.

## Kildekontroll

- Alle fire PDF-sider er lest og visuelt kontrollert.
- [Original PDF i Sanity](https://cdn.sanity.io/files/2jd536j2/production/aa57af3b4329f211ba9f3394e95bcbb61d0876d4.pdf).
- SHA-256: `af9c21bc055a62ed5bc50c03cf15a3a390d110d000e427d886d785ec7e39e9d0`. Den nedlastede publiserte filen er byteidentisk med e-postvedlegget.
- [Den katolske kirkes liturgiske kalender](https://www.katolsk.no/tro/tema/liturgi/2026) bekrefter 25. søndag i det alminnelige kirkeår den 20. september og lesningene Jes 55,6–9; Fil 1,20c–24.27a; Matt 20,1–16a.
- `massDate` er 20. september; bladets messetabell dekker frem til 27. september. Teksten er beholdt på norsk og bare koblet til norsk søndagsmesse kl. 11 i Kongsberg.

## Endringer

11 dokumenter opprettet og 7 eksisterende dokumenter oppdatert: ett søndagsblad, fem hendelser, fire kunngjøringer, sju messeavvik og én messetekst. Faste messeplaner, steder, artikler og nettstedskode er uendret.

- Tusenfryd, bispevisitas, konfirmanthelg, lederrekruttering og 60+-gruppe gjenbruker eksisterende nøkler og tidligere kilder. Godkjent påmeldingslenke og utfyllende turprogram er beholdt.
- Kirkevigselsfesten er en sosial hendelse som begynner med messen. Messeoppføringen viser kirkekaffen og lenker til feiringen. Søndagens videre feiring står ved messen 27. september; eget klokkeslett for matservering er ikke oppfunnet.
- Konfirmantkatekese 25. september kl. 17 er en egen hendelse.
- Lørdagsmessen 26. september beholder det eksisterende avviket til kl. 09. Den faste kl. 12-planen er uendret. Det tidligere eksplisitte sluttidspunktet kl. 10 er fjernet, siden kilden ikke angir messevarighet og det godkjente turprogrammet har bussavreise kl. 09.30.
- Bispevisitasens nye detaljer er lagt på eksisterende hendelse og de berørte messene. Tidene følger de eksisterende messeplanene. Messespråk er beholdt der bladet ikke oppgir et annet språk.
- Norsk og kontrollert engelsk tekst bruker samme dokumenter. Liturgiske tekster er ikke oversatt.

## Relevansvurdering av kunngjøringer

- Varslet om den innførte fredagsordningen for skriftemål er satt til `resolved`; selve ordningen er ikke erklært avsluttet. Ukens beskjed om skriftemål før messene er tatt med i messemerknadene.
- Lederrekrutteringen beholder sluttdato ved konfirmanthelgens start. Tusenfryd beholder påmeldingsfristen 20. september. Fremheving av kirkevigselsfest og bispevisitas avsluttes ved henholdsvis feiringens start og pontifikalmessens start.
- 60+-gruppen og byggeprosjektet er åpne saker uten oppgitt frist eller forsvarlig sluttdato. Interessen skal meldes til p. Trym; byggeprosjektet avventer mer informasjon om innsamlingen.
- Innspill til menighetssalen, festkomité og rekruttering av kateketer er gjennomgått. Kilden bekrefter ikke at behovene er dekket eller sakene avsluttet. De beholdes åpne uten oppdiktet frist og må vurderes igjen ved neste import.

## Gjennomføring og kontroll

Brukeren godkjente uttrykkelig Sanity MCP som alternativ til lokal nøkkel. Repoets ordinære tørrtest ble kjørt. Det uendrede importskriptet ble deretter kjørt mot en lokal innholdsmodell for å generere nøyaktige felt, referanser, Portable Text og oversettelseshash. Disse endringene ble opprettet/patchet og publisert gjennom Sanity MCP. Sanity genererte ID-ene for nye dokumenter; eksisterende oppføringer ble oppdatert med revisjonskontroll.

Repoets inspeksjon og verifikasjon ble kjørt med en midlertidig lokal klient mot et komplett innholdssnapshot, uten å endre repoets skript. Etter publisering ble de 18 berørte dokumentene lest tilbake gjennom MCP. Alle 170 dokument-ID-er og revisjoner ble kontrollert mot publisert Sanity-innhold.

- Verifikasjon: 170 dokumenter, 0 feil, 0 advarsler.
- Gjentatt import mot det publiserte innholdet: alle oppføringer `Oppdatert`, 0 nye dokumenter og 0 endringer å sende. Ingen ekstra publisering var nødvendig; dokumentantall og revisjoner er uendret.
- Alle åtte messetidene 23.–27. september, katekesen og norske/engelske redaksjonelle tekster er kontrollert gjennom nettstedets egne kalender- og oversettelsesfunksjoner.
- Bare norsk kl. 11-messe 20. september får de nye lesningene. 13. september beholder sin egen tekst; 27. september og engelske messer arver ikke teksten. Ingen dupliserte dato/messe-kombinasjoner.
- Nettleserkontroll av [norsk](https://st-barbara.vercel.app/nb) og [engelsk](https://st-barbara.vercel.app/en) forside og messesiden 20. september bekrefter publisert PDF, oppdatert innhold og riktige lesninger.
- `web`: 37 tester bestått; lint og produksjonsbygg bestått.

`kongsberg.katolsk.no` kunne ikke DNS-oppløses fra denne maskinen. Den offentlige adressen som repoet oppgir, `st-barbara.vercel.app`, fungerer og er kontrollert. Ingen domene- eller tilgangsinnstillinger er endret.

Ved ny lokal import lastes PDF-en fra Sanity-lenken over til manifestets `pdfPath`; kontroller SHA-256 før import.
