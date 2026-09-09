# Engelske messelesninger — vurdering 6. september 2026

Ingen lesningsleverandør er koblet til ennå. Søndagsbladet er fortsatt autoritet. Norsk tekst bevares og maskinoversettes ikke.

## Universalis: aktuell kandidat for innbygging

Universalis dokumenterer en gratis JSONP-innbygging for **i dag eller neste søndag**. Den kan vise lesningene inne i vår egen utforming, med kildekreditering og synlig copyright. Dette er en støttet innbygging, ikke tillatelse til å skrape nettsiden eller lagre et eget permanent tekstarkiv i Sanity. Den dokumenterte løsningen er heller ikke en vilkårlig dato-API for hele vår kalender.

Kilder: [innbygging for nettsider](https://universalis.com/n-web.htm), [JSONP](https://universalis.com/n-jsonp.htm), [tekniske krav](https://universalis.com/n-jsonp-technical.htm).

## USCCB: offisiell RSS

Den amerikanske bispekonferansen tilbyr daglige engelske lesninger via RSS. Deres vilkår tillater visning via RSS på en fritt tilgjengelig nettside. Det er ikke en generell lisens til å republisere eller arkivere alle bibeltekstene. Amerikansk liturgisk kalender kan avvike fra den norske.

Den oppgitte feeden er `https://www.usccb.org/bible/readings/rss/index.cfm`. Direkte serverhenting møtte bot-beskyttelse under testen; faktisk innhold og tidshorisont er derfor ikke verifisert. Det taler mot å love en driftssikker serverintegrasjon før en egen teknisk test.

Kilde: [USCCBs RSS og bruksvilkår](https://www.usccb.org/subscribe/rss).

## Anbefalt neste avgrensning

1. Bekreft med menighetens liturgisk ansvarlige hvilken engelsk leksjonaroversettelse menigheten bruker. En vanlig bibel-API er ikke nok til å fastslå den liturgiske teksten, responsene eller valg av utdrag.
2. Prøv Universalis for dagens/neste søndags lesninger dersom oversettelsen passer. Sammenlign bibelhenvisningene med søndagsbladet; dato alene er ikke nok. Norge står ikke som egen kalender i den publiserte [kalenderlisten](https://universalis.com/n-link.htm).
3. Bruk en kontrollert ekstern lenke som reserve ved manglende samsvar, gammel dato eller leverandørfeil. Ikke vis dagens tekst på en gammel messe.
4. Før eventuell lagring i Sanity: avklar gjenbruksrettigheter og utvid datamodellen til å skille norsk kilde fra engelsk lesning, oversettelsesutgave, henvisninger, kilde-URL og kontrollstatus. Ingen kobling til andre messer skal antas.

Universalis tillater uttrykkelig [lenking](https://universalis.com/n-link.htm). Dette er enkleste første nivå dersom fulltekstinnbygging ikke dekker behovet.
