# Liturgihefte – familiemesse

Heftet som deles ut ved familiemessen: A5-hefter, stiftet i ryggen.

- `familiemesse.html` har innholdet, `hefte.css` sideoppsettet og utseendet, og `bilder/` illustrasjonene.
- Heftet ble overført fra Google-dokumentet «Liturgihefte - familiemesse»
  (<https://docs.google.com/document/d/1x8ak9zt2smh548vaPppdurZE7Rlq5lOfTg1ToBPHi-k/edit>). Endringer gjøres nå i HTML-filen.
- `./bygg.sh` lager `pdf/familiemesse-a5.pdf` med WeasyPrint (hentes med `uvx`).
- Et stiftet hefte trenger et sidetall som er delelig med 4, fordi hvert A4-ark brettes til fire A5-sider. `bygg.sh` advarer hvis sidetallet ikke går opp.
- Liturgiske betegnelser følger den gjeldende norske teksten, «Generell orientering om Missale Romanum»
  (<https://katolsk.no/dokumenter/dokumenter-fra-vatikanet/paul6/mr>), ikke Liturgikommisjonens høringsutkast fra 2023
  til ny messebok.
- Eukaristisk bønn II, «Eller» og overskriften til bønn III skal stå på samme oppslag (en venstreside og høyresiden ved
  siden av), så leseren ser alternativet allerede når bønn II begynner. Kontroller dette når sidene flytter seg.
- `kroppsstilling.md` beskriver når menigheten står, sitter og kneler, og hvor ikonene står. Ikonene lages av
  `ikoner/lag-ikoner.py`; endre målene der og kjør skriptet på nytt i stedet for å redigere SVG-filene.
- `forhandsvis.py` viser heftet på <http://127.0.0.1:8765> og ikonene på <http://127.0.0.1:8765/ikoner>, og
  oppdaterer seg når filene lagres.
- `ubrukte-bonner.html` har bønnene som sto i 28-siders-utgaven, men ikke er med i dag. Lim inn herfra ved behov.
- `til-p-trym.md` samler spørsmål og beslutninger p. Trym skal se på.
- Nettsiden viser messens ordning fra heftet på `/messen`, og med dagens lesninger på `/messen/i-dag`, der
  QR-koden (`bilder/qr-nettside.svg`) peker. `til-nettsiden.py` henter teksten ut av `familiemesse.html` til
  `web/src/content/messens-ordning.json` og kopierer ikonene til `web/public/liturgi/`; `bygg.sh` kjører det, og en test
  i `web/tests/order-of-mass.test.mjs` feiler hvis heftet er endret uten at det er gjort. Nettsiden viser bare det som
  gjelder høymesse eller hverdagsmesse, og én eukaristisk bønn om gangen; `til-nettsiden.py` merker hva som er hva.
  Eukaristisk bønn I og IV på norsk står i `nett/eukaristiske-bonner.nb.html` (bare på nettsiden), hentet fra Norsk
  Missale 1982 slik det står i Messeboken 2011. Teksten i bønn II og III er rettet etter samme kilde. Lesningene kommer fra
  søndagsbladet og settes inn der heftet har «Slik lyder Herrens ord», «(omkved)», «Halleluja» og «(...)». Lag
  QR-koden på nytt med
  `uv run --no-project --with segno==1.6.6 python -c "import segno; segno.make('https://kongsberg.katolsk.no/messen/i-dag', error='q').save('bilder/qr-nettside.svg', kind='svg', scale=1, border=0, omitsize=True, xmldecl=False)"`.
