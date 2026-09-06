import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/i18n/link";
import { contact, priests } from "@/lib/parish";
import { getParishPlaces } from "@/sanity/data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Kontakt"),
    description: t(
      "Kontakt St. Barbara menighet – telefon, e-post, prester og veien til kirken.",
    ),
  };
}

export default async function KontaktPage() {
  const { t } = await getTranslations();
  const places = await getParishPlaces();
  const [parishPriest, ...otherPriests] = priests;
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:py-14">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        {t("Vi hører gjerne fra deg")}
      </p>
      <h1 className="font-display text-5xl font-medium leading-tight text-foreground">
        {t("Kontakt menigheten")}
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
        {t(
          "Gjelder det dåp, vielse, sjelesorg eller noe annet – ta kontakt, så finner vi tid til en samtale.",
        )}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <section className="rounded-sm border border-border bg-muted/65 p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border">
              <Image
                src={parishPriest.image}
                alt={parishPriest.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                {parishPriest.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(parishPriest.role)}
              </p>
            </div>
          </div>
          <div className="mt-7 space-y-4 border-t border-border pt-6">
            <a
              href={`tel:+47${contact.phone.replace(/\s/g, "")}`}
              className="block w-fit text-2xl font-medium tabular-nums text-primary underline-offset-4 hover:underline"
            >
              {contact.phone}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="block w-fit break-all text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              {contact.email}
            </a>
          </div>
        </section>
        <section>
          <h2 className="font-display text-3xl font-medium text-foreground">
            {t("Sjelesorg på ditt språk")}
          </h2>
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {otherPriests.map((priest) => (
              <li key={priest.name} className="flex items-start gap-4 py-5">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border">
                  <Image
                    src={priest.image}
                    alt={priest.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{priest.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(priest.role)}
                  </p>
                  <a
                    href={`tel:+47${priest.phone.replace(/\s/g, "")}`}
                    className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {priest.phone}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-14 border-t border-border pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-3xl font-medium text-foreground">
            {t("Her finner du oss")}
          </h2>
          <Link
            href="/messetider"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("Se messetider →")}
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {places.map((place) => (
            <div key={place._id} className="border-t border-border pt-4">
              <h3 className="font-display text-xl font-semibold text-foreground">
                {place.name}
              </h3>
              <p
                translate="no"
                className="notranslate mt-2 text-sm leading-relaxed text-muted-foreground"
              >
                {[
                  place.streetAddress,
                  [place.postalCode, place.locality].filter(Boolean).join(" "),
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {place.mapUrl && (
                <a
                  href={place.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("Vis kart ↗")}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
