import type { Metadata } from "next";
import { contact } from "@/lib/parish";

export const metadata: Metadata = {
  title: "Donasjoner",
  description:
    "Støtt St. Barbara menighet med Vipps, bankoverføring eller fast givertjeneste.",
};

export default function DonasjonerPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
      <h1 className="font-display text-5xl font-medium leading-tight text-ink">
        Donasjoner
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone">
        Gaver og bidrag til menigheten mottas med takknemlighet. Alt går til
        driften av kirken og menighetens arbeid.
      </p>

      <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-line bg-line lg:grid-cols-3">
        <div className="bg-paper p-9">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Vipps
          </h2>
          <p className="mt-6 font-display text-6xl font-medium text-burgundy">
            {contact.vipps}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-stone">
            Søk opp «St. Barbara menighet» eller bruk nummeret direkte. Gaver
            over 500 kr i året gir rett til skattefradrag – husk å registrere
            fødselsnummer i Vipps.
          </p>
        </div>

        <div className="bg-paper p-9">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Bankoverføring
          </h2>
          <p className="mt-6 font-display text-3xl font-medium tracking-wide text-burgundy">
            {contact.konto}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-stone">
            Merk gjerne overføringen med hva gaven gjelder – for eksempel
            «kirkens drift» eller «Caritas».
          </p>
        </div>

        <div className="bg-paper p-9">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Fast givertjeneste
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-stone">
            Et fast månedlig beløp gir menigheten forutsigbarhet. Opprett
            AvtaleGiro i nettbanken din til kontoen over, eller via{" "}
            <a
              href="https://www.avtalegiro.no"
              target="_blank"
              rel="noopener noreferrer"
              className="text-burgundy underline-offset-2 hover:underline"
            >
              avtalegiro.no
            </a>
            .
          </p>
        </div>
      </div>

      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-stone">
        Du kan selvsagt også gi i kollekten under messen. Spørsmål om gaver og
        skattefradrag? Ta kontakt på{" "}
        <a
          href={`mailto:${contact.email}`}
          className="text-burgundy underline-offset-2 hover:underline"
        >
          {contact.email}
        </a>
        .
      </p>
    </div>
  );
}
