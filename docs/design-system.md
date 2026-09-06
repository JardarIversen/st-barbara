# Felles designgrunnlag

Nettsiden og shadcn-komponentene bruker samme tokens i `web/src/app/globals.css`.
Den eksisterende menighetsprofilen er utgangspunktet, ikke shadcns standardtema.

## Tokens

- Farger: `background`/`foreground`, `muted`/`muted-foreground`, `border`, `primary`/`primary-foreground`, `primary-hover`, `brand` og `inverse`/`inverse-foreground`.
- Komponentroller som `popover`, `card`, `input`, `accent` og `ring` peker til denne paletten. Ikke opprett en parallell palett eller bruk rå fargeverdier i komponenter. Flagg beholder sine faktiske flaggfarger.
- `--radius` er 4 px. Kontroller, menyer og dialoger bruker `rounded-sm`; mindre innvendige detaljer bruker `rounded-xs`. Bildebuer, portretter og filterbrikker kan fortsatt ha bevisst rund form.
- Kontrollhøyder: `control-xs` 28 px, `control-sm` 36 px, `control` 40 px, `control-lg` 44 px.
- `focus-ring` og `focus-within-ring` deler fokusfarge, bredde og avstand. Sammensatte felt viser én fokusmarkering rundt hele gruppen.
- `shadow-popover` er felles skygge for flytende paneler. Brødtekst bruker `font-sans`; redaksjonelle overskrifter bruker `font-display`.

## Primitiver

Bruk `Button` for handlinger. Velg `variant` og `size` i stedet for lokale farge-, høyde- eller hjørneklasser. Ikonstørrelsene styres av knappens størrelsesvariant.

Lenker skal fortsatt være lenker: bruk `Link` eller `a` med `buttonVariants(...)`, ikke en knapp med påtvunget lenkeoppførsel. Da får navigasjon og handlinger samme utseende, men riktig tastatur- og skjermleseroppførsel.

`Input` og `Textarea` deler `controlStyles`. Valgmenyer bruker shadcn `Select`, ikke nettleserens rå `select`. `SelectTrigger` og `InputGroupButton` gjenbruker knappens varianter. Menyen deler tokens for bakgrunn, kant, hjørner, skygge og markering med de andre primitive komponentene.

På sidene brukes `className` hovedsakelig til plassering og bredde. Varige utseendeendringer hører hjemme i en primitiv eller et token. Ved installasjon av flere shadcn-komponenter: behold temaet og tilpass komponenten til disse reglene; ikke legg tilbake standardradius eller en ny nøytral palett.

## Kontroll

Kjør `npm test`, `npm run lint` og `npm run build` i `web/`. Testen `design-system.test.mjs` beskytter paletten og de delte kontrollstilene mot lokale overstyringer. Kontroller også språkvelger, kalenderkontroller og meny med tastatur og på smal skjerm.
