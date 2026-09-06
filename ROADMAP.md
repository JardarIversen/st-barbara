# Veikart – St. Barbara menighet nettside

Status: forhåndsvisning klar til å vises p. Trym. Dette dokumentet er
huskelisten for alt som er bevisst utsatt.

## 1. Innhold (høyest prioritet)

- [ ] **«Ny her?»-side** – den viktigste manglende siden. For folk som
      nettopp har flyttet til området: hva man kan forvente i messen, at alle
      er velkomne, hvordan bli katolikk (voksenopplæring/SycamOre), og at man
      ikke trenger å «kunne» noe for å komme. Lenkes fra forsiden.
- [ ] **Gravferd og sykebesøk** – ett avsnitt hver under Livets gang eller
      egen side. Folk søker etter dette i tunge stunder; det skal være lett å
      finne og varmt formulert.
- [ ] **Skriftemålstider verifiseres med p. Trym** – nå står det «før
      messene, bare å møte opp». Bekreft at det gjelder alle messesteder.
- [ ] **Messetidene verifiseres med p. Trym** – gamle nettsiden var
      selvmotsigende (forsiden sa polsk messe søndag kl. 13, stedssiden sa
      lørdag kl. 18). Vi har brukt stedssidene som kilde.
- [ ] **Bedre fotografier** (Jardar tar dette). Prioritert ønskeliste:
      1. Kirkerommet mot alteret i dagslys, bredt utsnitt, uten folk –
         blir ny hovedside-hero.
      2. Lyset selv: rosevinduet innenfra, sol gjennom vinduene, levende lys.
      3. Vertikaler: spiret mot himmelen, dørene nedenfra.
      Gyllen time, uten blits. Tre–fire gode bilder er nok.

## 2. Funksjonalitet

- [ ] **Eget påmeldingsskjema for katekese** – i dag lenkes det til
      Microsoft Forms via gamle nettsiden. Alternativ: enkel server action
      som sender e-post til kongsberg@katolsk.no.
- [ ] **Søndagsblad-rutine** – ukens PDF lastes i dag fra gamle nettsiden.
      Løsning: Cloudflare R2 (10 GB gratis, ingen egress-kostnad) + en enkel
      opplastingsrutine, eller PDF-en legges i repoet ukentlig via Claude
      Code.
- [ ] **Galleri-side** – vigslingsbildene + fremtidige begivenheter.
- [ ] **404-side** med lenker videre.
- [ ] **OG-bilde** (deling på sosiale medier) – kirkebildet med navnetrekk.

## 3. Migrering

- [ ] **Hele arkivet (169 innlegg)** migreres skriptet via WordPress REST
      API-et på kongsberg.katolsk.no (åpent, testet). Innlegg er vanlig HTML
      og konverterer rent. Elementor-sidene (ca. 15) migreres ikke – de er
      redesignet for hånd.
- [ ] **Mediebiblioteket** (1 777 filer, anslagsvis 1–4 GB) → Cloudflare R2.
      Bilde-URL-er i migrerte innlegg skrives om.
- [ ] **Redirect-kart** gamle → nye URL-er (slugs kan bevares, så dette er
      mønsterbasert). Gjelder bare hvis domenet beholdes.

## 4. Lansering

- [ ] **Avklaring med p. Trym / menighetsrådet** – før alt annet.
- [ ] **DNS hos OKB** – kongsberg.katolsk.no eies av Oslo katolske
      bispedømme (OKB Hostmaster, support@katolsk.no, 23 21 95 00). Be om
      CNAME til ny hosting. Forespørselen bør gå via p. Trym som offisiell
      menighetshenvendelse.
- [ ] **Deploy** – Vercel (gratisnivå holder lenge for en menighetsside).
- [ ] **Universell utforming** – tilgjengelighetsgjennomgang (kontrast,
      tastaturnavigasjon, skjermleser). Lovpålagt for offentlig rettede
      nettsider.
- [ ] **Personvernerklæring** – kort side; nettsiden er cookiefri (Google
      Translate setter cookie først ved aktivt språkvalg).
- [ ] **GDPR-opprydding i gamle WordPress** – GiveWP og Ninja Forms kan ha
      lagret giverdata/skjemainnsendinger. Eksporter/slett før nedleggelse.

## 5. Eierskap og drift

- [ ] **GitHub-organisasjon for menigheten** – koden skal eies av
      menigheten, ikke en privat konto. Vercel-team likeså.
- [ ] **Den polske frivillige** får en rolle i ny løsning – f.eks.
      gjennomlesing av polske maskinoversettelser eller egne polske sider.
- [ ] **Kort driftshåndbok** – hvordan legge inn innlegg, endre messetider,
      laste opp søndagsblad. (README.md dekker det grunnleggende.)
