import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import { municipalities, priests } from "@/lib/parish";
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

const TIMELINE = [
  {
    year: "1887",
    text: "Kirkebygget i Rogstadbakken reises – en hvit trekirke med spir og rosevindu.",
  },
  {
    year: "2021",
    text: "St. Barbara menighet opprettes 15. august som egen menighet i Oslo katolske bispedømme.",
  },
  {
    year: "2023",
    text: "Kirken vigsles til St. Barbara 23. september, med relikvier i alteret og full kirke.",
  },
];

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
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full border border-border">
              <Image
                src="/images/prest-morgen.jpg"
                alt={t("På vei til St. Barbara kirke en tidlig morgen")}
                fill
                sizes="(min-width: 1024px) 400px, 85vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs tracking-wide text-muted-foreground">
              {" "}
              {t("På vei til kirken")}{" "}
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Timeline */}
      <section className="bg-muted">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-foreground">
            {" "}
            {t("Historien")}{" "}
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
            {TIMELINE.map((item) => (
              <div key={item.year} className="bg-background p-8">
                <p className="font-display text-5xl font-medium text-primary">
                  {item.year}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {t(item.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consecration photos */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-foreground">
            {" "}
            {t("Kirkevigselen")}{" "}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {" "}
            {t("23. september 2023 vigslet biskopen kirken og alteret.")}{" "}
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
                  src="/images/kirkevigsel-menighet.webp"
                  alt={t("Menigheten samlet i kirken under vigslingsmessen")}
                  width={2200}
                  height={1467}
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
          <h2 className="text-center font-display text-4xl font-medium text-foreground">
            {" "}
            {t("Våre prester")}{" "}
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-3">
            {priests.map((p) => (
              <div key={p.name} className="text-center">
                <div className="relative mx-auto aspect-[3/4] w-44 overflow-hidden rounded-t-full border border-border sm:w-full">
                  <Image
                    src={p.image}
                    alt={`${t("Portrett av")} ${p.name}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {p.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(p.role)}
                </p>
                <p className="mt-2 text-sm text-primary">{p.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
