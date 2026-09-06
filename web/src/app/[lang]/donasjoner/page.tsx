import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import { contact } from "@/lib/parish";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Donasjoner"),
    description: t(
      "Støtt St. Barbara menighet med Vipps, bankoverføring eller fast givertjeneste.",
    ),
  };
}

export default async function DonasjonerPage() {
  const { t } = await getTranslations();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
      <h1 className="font-display text-5xl font-medium leading-tight text-foreground">
        {" "}
        {t("Donasjoner")}{" "}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {" "}
        {t(
          "Gaver og bidrag til menigheten mottas med takknemlighet. Alt går til driften av kirken og menighetens arbeid.",
        )}{" "}
      </p>

      <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border lg:grid-cols-3">
        <div className="bg-background p-9">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Vipps
          </h2>
          <p className="mt-6 font-display text-6xl font-medium text-primary">
            {contact.vipps}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {" "}
            {t(
              "Søk opp «St. Barbara menighet» eller bruk nummeret direkte. Gaver over 500 kr i året gir rett til skattefradrag – husk å registrere fødselsnummer i Vipps.",
            )}{" "}
          </p>
        </div>

        <div className="bg-background p-9">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {" "}
            {t("Bankoverføring")}{" "}
          </h2>
          <p className="mt-6 font-display text-3xl font-medium tracking-wide text-primary">
            {contact.konto}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {" "}
            {t(
              "Merk gjerne overføringen med hva gaven gjelder – for eksempel «kirkens drift» eller «Caritas».",
            )}{" "}
          </p>
        </div>

        <div className="bg-background p-9">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {" "}
            {t("Fast givertjeneste")}{" "}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {" "}
            {t(
              "Et fast månedlig beløp gir menigheten forutsigbarhet. Opprett AvtaleGiro i nettbanken din til kontoen over, eller via",
            )}{" "}
            <a
              href="https://www.avtalegiro.no"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              avtalegiro.no
            </a>
            .
          </p>
        </div>
      </div>

      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {" "}
        {t(
          "Du kan selvsagt også gi i kollekten under messen. Spørsmål om gaver og skattefradrag? Ta kontakt på",
        )}{" "}
        <a
          href={`mailto:${contact.email}`}
          className="text-primary underline-offset-2 hover:underline"
        >
          {contact.email}
        </a>
        .
      </p>
    </div>
  );
}
