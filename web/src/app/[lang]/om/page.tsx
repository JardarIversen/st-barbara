import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import {
  municipalities,
  parishCouncil,
  phoneHref,
  phoneLabel,
  priests,
} from "@/lib/parish";
import PlaceText from "@/components/place-text";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Om menigheten"),
    description: t(
      "St. Barbara menighet ble opprettet i 2021 og dekker Kongsberg, Numedal og Øst-Telemark. Les om historien, kirken og prestene våre.",
    ),
  };
}

export default async function OmPage() {
  const { t } = await getTranslations();
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="font-display text-5xl font-medium leading-tight text-foreground">
              {" "}
              {t("Om menigheten")}{" "}
            </h1>
            <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                {" "}
                <PlaceText>
                  {t(
                    "St. Barbara menighet er Den katolske kirkes menighet for Kongsberg, Numedal og Øst-Telemark. Vi feirer messe i Kongsberg, Notodden, Rjukan og Mo, og samler katolikker fra mange land og språk i ett fellesskap.",
                  )}
                </PlaceText>{" "}
              </p>
              <p>
                {t("Menigheten dekker")}{" "}
                <PlaceText>{t(municipalities)}</PlaceText>.
              </p>
              <p>
                {" "}
                {t(
                  "Menigheten ble opprettet i 2021 og er en av de yngste i Oslo katolske bispedømme. Kirken vår i Rogstadbakken ble vigslet til den hellige Barbara i 2023. Barbara er skytshelgen for bergverksfolk, og festdagen hennes feires 4. desember.",
                )}{" "}
              </p>
            </div>
          </div>
          <figure className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
              <Image
                src="/images/prest-morgen.jpg"
                alt={t("På vei til St. Barbara kirke en tidlig morgen")}
                fill
                sizes="(min-width: 1024px) 400px, 85vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {" "}
              {t("På vei til kirken")}{" "}
            </figcaption>
          </figure>
        </div>
      </div>

      {/* History, told with the pictures from the consecration */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-foreground">
            {t("Historien")}
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground/85">
            {t(
              "Kirkebygget i Rogstadbakken ble reist i 1887, en hvit trekirke med spir og rosevindu. St. Barbara menighet ble opprettet 15. august 2021 som egen menighet i Oslo katolske bispedømme. Den 23. september 2023 vigslet biskopen kirken og alteret til den hellige Barbara, med relikvier i alteret og full kirke.",
            )}
          </p>
          <div className="mt-8 grid items-start gap-5 sm:grid-cols-[1.15fr_1fr]">
            <div className="space-y-5">
              <figure>
                <Image
                  src="/images/kirkevigsel-alter.webp"
                  alt={t("Biskopen salver alteret under kirkevigselen")}
                  width={2200}
                  height={1467}
                  sizes="(min-width: 640px) 65vw, 100vw"
                  className="h-auto w-full rounded-sm"
                />
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {t("Vigslingen av alteret")}
                </figcaption>
              </figure>
              <figure>
                <Image
                  src="/images/kirkevigsel-menighet-rett.webp"
                  alt={t("Menigheten samlet i kirken under vigslingsmessen")}
                  width={2180}
                  height={1440}
                  sizes="(min-width: 640px) 65vw, 100vw"
                  className="h-auto w-full rounded-sm"
                />
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {t("En fullsatt kirke, 23. september 2023")}
                </figcaption>
              </figure>
            </div>
            <figure className="mx-auto w-full max-w-sm sm:max-w-none">
              <Image
                src="/images/kirkevigsel-salving-rettet.webp"
                alt={t("Salving av alteret med krisma")}
                width={1467}
                height={2200}
                sizes="(min-width: 640px) 35vw, 90vw"
                className="h-auto w-full rounded-sm"
              />
              <figcaption className="mt-2 text-xs text-muted-foreground">
                {t("Alteret salves med krisma")}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Priests */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-foreground">
            {t("Våre prester")}
          </h2>
          <ul className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {priests.map((p) => (
              <li key={p.name} className="flex items-start gap-4">
                {/* Small on purpose: the portraits are passport-sized and do not bear enlarging. */}
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={p.image}
                    alt={`${t("Portrett av")} ${p.name}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-semibold leading-snug text-foreground">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(p.role)}
                  </p>
                  <a
                    href={phoneHref(p.phone)}
                    className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {phoneLabel(p.phone)}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Parish council */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-foreground">
            {t("Menighetsrådet")}
          </h2>
          <dl className="mt-8 max-w-xl divide-y divide-border border-y border-border">
            {parishCouncil.map((member) => (
              <div
                key={member.role}
                className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
              >
                <dt className="text-sm text-muted-foreground sm:pt-1">
                  {t(member.role)}
                </dt>
                <dd className="font-display text-xl text-foreground">
                  {member.names.map((name) => (
                    <span key={name} className="block">
                      {name}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
