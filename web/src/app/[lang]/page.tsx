import { getTranslations } from "@/i18n/server";
import { connection } from "next/server";
import Image from "next/image";
import Link from "@/i18n/link";
import { buttonVariants } from "@/components/ui/button";
import AnnouncementBoard from "@/components/announcement-board";
import ArticleCard from "@/components/article-card";
import AgendaList from "@/components/agenda-list";
import PlaceText from "@/components/place-text";
import {
  addDays,
  buildCalendarItems,
  formatArticleDate,
  formatCalendarDate,
  formatCalendarTime,
  placeFilterKey,
  todayInOslo,
  toCalendarListItems,
} from "@/lib/calendar";
import { contact } from "@/lib/parish";
import { rankAnnouncements } from "@/lib/announcements";
import {
  getActiveAnnouncements,
  getCalendarData,
  getLatestArticles,
  getLatestBulletins,
  getParishPlaces,
} from "@/sanity/data";

const SACRAMENTS = [
  {
    title: "Dåp",
    text: "Ta kontakt med menigheten for å avtale dåp av barn eller voksne.",
  },
  {
    title: "Første kommunion",
    text: "Barna forberedes gjennom katekesen og mottar kommunionen om våren.",
  },
  {
    title: "Konfirmasjon",
    text: "Ungdom følger konfirmantundervisningen over to år før fermingen.",
  },
  {
    title: "Ekteskap",
    text: "Par som ønsker å gifte seg i kirken, avtaler tid for samtale med presten i god tid.",
  },
];

export default async function Home() {
  const { locale, t } = await getTranslations();
  await connection();
  const now = new Date();
  const today = todayInOslo(now);
  const endDate = addDays(today, 28);
  const [calendarData, announcements, articles, bulletins, places] =
    await Promise.all([
      getCalendarData(today, endDate),
      getActiveAnnouncements(new Date().toISOString()),
      getLatestArticles(),
      getLatestBulletins(),
      getParishPlaces(),
    ]);
  const allItems = buildCalendarItems(calendarData, today, endDate);
  const lastPreviewDate = allItems[5]?.dateKey;
  const calendarItems = toCalendarListItems(
    allItems.filter(
      (item) => !lastPreviewDate || item.dateKey <= lastPreviewDate,
    ),
  );
  const nextKongsbergMass = allItems.find(
    (item) =>
      item.eventType === "mass" &&
      item.status === "scheduled" &&
      new Date(item.startsAt) >= now &&
      item.regionKeys.includes("kongsberg"),
  );
  const mainPlace = places.find(
    (place) => placeFilterKey(place) === "kongsberg",
  );
  const address = mainPlace
    ? [
        mainPlace.streetAddress,
        [mainPlace.postalCode, mainPlace.locality].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(", ")
    : "Kongsberg";
  const nextMassAddress = [
    nextKongsbergMass?.place?.streetAddress,
    nextKongsbergMass?.place?.locality,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-12">
          <div>
            <h1 className="font-display text-5xl font-medium leading-[1.05] text-foreground lg:text-6xl">
              {t("Den katolske kirke i Kongsberg")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {" "}
              <PlaceText>
                {t(
                  "St. Barbara menighet feirer messe i Kongsberg, Notodden, Rjukan og Mo. Velkommen til messe, katekese og fellesskap.",
                )}
              </PlaceText>{" "}
            </p>
            <div className="mt-7">
              <Link
                href="/messetider"
                className={buttonVariants({ size: "lg" })}
              >
                {t("Se messetider")}
              </Link>
            </div>
            {nextKongsbergMass && (
              <p className="mt-9 border-t border-border pt-5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {t("Neste messe i Kongsberg:")}{" "}
                  {formatCalendarDate(
                    nextKongsbergMass.startsAt,
                    false,
                    locale,
                  )}{" "}
                  {t("kl.")}{" "}
                  {formatCalendarTime(nextKongsbergMass.startsAt, locale)}
                </span>
                {nextKongsbergMass.place && (
                  <span translate="no" className="notranslate block">
                    {nextKongsbergMass.place.name}
                    {nextMassAddress && `, ${nextMassAddress}`}
                  </span>
                )}
              </p>
            )}
          </div>
          <figure className="relative mx-auto w-full max-w-[15rem] sm:max-w-xs lg:max-w-sm">
            <div className="overflow-hidden rounded-t-full border border-border bg-muted p-2.5 pb-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full">
                <Image
                  src="/images/kirken-eksterior.jpg"
                  alt={t("St. Barbara kirke i Kongsberg")}
                  fill
                  priority
                  sizes="(min-width: 1024px) 400px, 80vw"
                  className="object-cover object-[35%_center]"
                />
              </div>
            </div>
            <figcaption className="mt-3 text-center text-xs tracking-wide text-muted-foreground">
              {t("St. Barbara kirke, Rogstadbakken")}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:gap-14 lg:py-14">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {t("De neste dagene")}
          </p>
          <h2 className="font-display text-4xl font-medium text-foreground">
            {t("Messer og arrangementer")}
          </h2>
          <div className="mt-7">
            <AgendaList items={calendarItems} today={today} from={today} />
          </div>
          {!calendarItems.length && (
            <p className="py-8 text-muted-foreground">
              {t("Nye messetider kommer snart.")}
            </p>
          )}
          <Link
            href="/messetider"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "mt-6",
            })}
          >
            {t("Se hele oversikten")} <span aria-hidden>→</span>
          </Link>
        </div>
        <aside className="border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {t("Fra menigheten")}
          </p>
          <h2 className="mb-7 font-display text-4xl font-medium text-foreground">
            {t("Kunngjøringer")}
          </h2>
          <AnnouncementBoard
            items={rankAnnouncements(announcements)}
            limit={4}
            layout="list"
          />
          <Link
            href="/kunngjoringer"
            className="mt-6 inline-flex items-center gap-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("Se mer")} <span aria-hidden>→</span>
          </Link>
        </aside>
      </section>

      <section className="border-t border-border bg-muted/45">
        <div className="mx-auto max-w-6xl px-5 py-10 lg:py-12">
          <div className="flex items-end justify-between gap-5">
            <h2 className="font-display text-4xl font-medium text-foreground">
              {t("Innlegg")}
            </h2>
            <Link
              href="/innlegg"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("Alle innlegg →")}
            </Link>
          </div>
          <div className="mt-7 grid items-start gap-x-10 gap-y-7 md:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-primary-hover">
        <div className="mx-auto max-w-4xl px-6 py-12 text-center sm:py-14">
          <blockquote className="font-display text-3xl font-medium italic leading-snug text-background sm:text-4xl">
            {t(
              "«Det finnes ikke frykt i kjærligheten. Den fullkomne kjærlighet driver frykten ut.»",
            )}
          </blockquote>
          <p className="mt-5 text-[0.65rem] uppercase tracking-[0.22em] text-brand-soft">
            {t("1. Johannes 4,18")}
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-4xl font-medium text-foreground">
                {t("Livets gang")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t(
                  "Kirken følger mennesket gjennom livet, fra dåpen til den siste velsignelsen. Ta kontakt med p. Trym for en samtale – om dåp, vielse, sykebesøk eller gravferd.",
                )}
              </p>
              <p className="mt-6">
                <Link
                  href="/kontakt"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("Kontakt menigheten")}
                </Link>
              </p>
            </div>
            <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {SACRAMENTS.map((sacrament) => (
                <div
                  key={t(sacrament.title)}
                  className="border-t border-border pt-4"
                >
                  <dt className="font-display text-xl font-semibold text-foreground">
                    {t(sacrament.title)}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(sacrament.text)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-muted">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-medium text-foreground">
              {t("Søndagsblad")}
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              {t("Ukens messer, lesninger og nytt fra menigheten.")}
            </p>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {bulletins.map((bulletin) => (
                <li key={bulletin._id}>
                  <a
                    href={bulletin.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 py-4 text-sm"
                  >
                    <span className="font-medium text-foreground transition-colors hover:text-primary">
                      {t("Søndagsblad ·")}{" "}
                      {formatArticleDate(
                        `${bulletin.issueDate}T12:00:00Z`,
                        locale,
                      )}
                    </span>
                    <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      PDF
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-4xl font-medium text-foreground">
              {t("Besøk oss")}
            </h2>
            <dl className="mt-7 space-y-5 text-sm">
              <div>
                <dt className="font-medium text-foreground">
                  {mainPlace?.name ?? "St. Barbara kirke"}
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  <span translate="no" className="notranslate">
                    {address}
                  </span>
                  {mainPlace?.mapUrl && (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={mainPlace.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {t("Vis kart")}
                      </a>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t("P. Trym Hellevig, sogneadministrator")}
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  <a
                    href={`tel:+47${contact.phone.replace(/\s/g, "")}`}
                    className="hover:text-primary"
                  >
                    {contact.phone}
                  </a>
                  {" · "}
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-primary"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </dl>
            <Link
              href="/kontakt"
              className={buttonVariants({ size: "lg", className: "mt-8" })}
            >
              {t("Kontakt menigheten")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
