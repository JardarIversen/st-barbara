import { getTranslations } from "@/i18n/server";
import { connection } from "next/server";
import Image from "next/image";
import Link from "@/i18n/link";
import { buttonVariants } from "@/components/ui/button";
import AnnouncementBoard from "@/components/announcement-board";
import ArticleCard from "@/components/article-card";
import AgendaList, { LanguageBadge } from "@/components/agenda-list";
import { CalendarChanges } from "@/components/mass-times";
import PlaceText from "@/components/place-text";
import JsonLd from "@/components/json-ld";
import {
  addDays,
  comingSunday,
  buildCalendarItems,
  formatArticleDate,
  isCalendarChange,
  formatCalendarDate,
  formatCalendarTime,
  placeFilterKey,
  todayInOslo,
  toCalendarListItems,
} from "@/lib/calendar";
import { contact, notoddenContact, phoneHref, phoneLabel } from "@/lib/parish";
import { rankAnnouncements } from "@/lib/announcements";
import { READINGS_SCHEDULE_KEY, acclamationVerse } from "@/lib/order-of-mass";
import { localizedPath } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";
import { parishStructuredData } from "@/lib/structured-data";
import {
  getActiveAnnouncements,
  getCalendarData,
  getLatestArticles,
  getLatestBulletins,
  getMassText,
  getParishPlaces,
} from "@/sanity/data";

/** The picture across the top of the front page. Swap the file here when a better one is taken. */
const HERO = {
  src: "/images/kirkevigsel-menighet-rett.webp",
  alt: "Menigheten samlet i kirken under vigslingsmessen",
  // Which part of the picture stays in view when the frame is wider or narrower than the photo.
  position: "center 42%",
};

const SACRAMENTS = [
  {
    title: "Dåp",
    text: "Ta kontakt med menigheten for å avtale dåp av barn eller voksne.",
    href: "/sakramenter/dap",
  },
  {
    title: "Første kommunion",
    text: "Barna forberedes gjennom katekesen og mottar kommunionen om våren.",
    href: "/katekese",
  },
  {
    title: "Konfirmasjon",
    text: "Ungdom følger konfirmantundervisningen over to år før fermingen.",
    href: "/sakramenter/konfirmasjon",
  },
  {
    title: "Ekteskap",
    text: "Par som ønsker å gifte seg i kirken, avtaler tid for samtale med presten i god tid.",
    href: "/sakramenter/ektevielse",
  },
];

/** Changes this close get a box of their own; later ones wait in «Senere». */
const URGENT_CHANGE_DAYS = 14;

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
  // This week runs to the coming Sunday, so the week's main Mass is always on the page.
  const sunday = comingSunday(today);
  const upcoming = allItems.filter(
    (item) => new Date(item.endsAt ?? item.startsAt) >= now,
  );
  const calendarItems = toCalendarListItems(
    upcoming.filter((item) => item.dateKey <= sunday),
  );
  // After that, only what the regular schedule does not already say: feasts, events, changes.
  const laterItems = toCalendarListItems(
    upcoming
      .filter((item) => item.dateKey > sunday && !item.routine)
      .slice(0, 5),
  );
  // Only urgent changes get the box; later ones are listed under «Senere».
  const changes = toCalendarListItems(
    upcoming.filter(
      (item) =>
        isCalendarChange(item) &&
        item.dateKey <= addDays(today, URGENT_CHANGE_DAYS),
    ),
  );
  const nextKongsbergMass = allItems.find(
    (item) =>
      item.eventType === "mass" &&
      item.status === "scheduled" &&
      new Date(item.startsAt) >= now &&
      item.regionKeys.includes("kongsberg"),
  );
  // The Sunday Mass is the one thing on the page that is set large.
  const sundayMass = allItems.find(
    (item) =>
      item.scheduleKey === READINGS_SCHEDULE_KEY && item.dateKey === sunday,
  );
  const sundayAhead =
    sundayMass?.status === "scheduled" && new Date(sundayMass.startsAt) >= now
      ? sundayMass
      : undefined;
  const mainMass = sundayAhead ?? nextKongsbergMass;
  const soonerMass =
    nextKongsbergMass && nextKongsbergMass !== mainMass
      ? nextKongsbergMass
      : undefined;
  // The Gospel verse comes from the newsletter: this Sunday's when it has arrived, otherwise
  // last Sunday's, shown under its own date.
  const verse = await (async () => {
    if (!sundayMass?.occurrenceDate || !sundayMass.scheduleId) return null;
    for (const date of [
      sundayMass.occurrenceDate,
      addDays(sundayMass.occurrenceDate, -7),
    ]) {
      const text = await getMassText(date, sundayMass.scheduleId);
      const found = acclamationVerse(text?.body);
      if (found) return { ...found, date };
    }
    return null;
  })();
  // An event that is already in the list beside it is not repeated as a notice.
  const listedEvents = new Set(
    upcoming
      .filter(
        (item) =>
          item.dateKey <= sunday ||
          laterItems.some((later) => later.id === item.id),
      )
      .map((item) => item.slug),
  );
  const notices = rankAnnouncements(announcements).filter(
    (item) => !item.eventSlug || !listedEvents.has(item.eventSlug),
  );
  const massAddress = (mass: typeof mainMass) =>
    [mass?.place?.name, mass?.place?.streetAddress, mass?.place?.locality]
      .filter(Boolean)
      .join(", ");
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

  return (
    <>
      <JsonLd
        data={parishStructuredData(places, {
          url: absoluteUrl(localizedPath("/", locale)),
          description: t(
            "St. Barbara katolske menighet i Kongsberg. Messetider for Kongsberg, Notodden, Rjukan og Mo, katekese, sakramenter og menighetsliv.",
          ),
        })}
      />
      <section>
        <div className="relative h-[44vh] max-h-[40rem] min-h-[16rem] overflow-hidden bg-inverse lg:h-[58vh]">
          <Image
            src={HERO.src}
            alt={t(HERO.alt)}
            fill
            preload
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: HERO.position }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-inverse/90 via-inverse/30 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-6xl px-5 pb-6 lg:pb-9">
              <h1 className="font-display text-4xl font-medium leading-[1.05] text-background sm:text-5xl lg:text-6xl">
                {t("Den katolske kirke i Kongsberg")}
              </h1>
              <p className="mt-3 hidden max-w-xl text-lg leading-relaxed text-background/85 sm:block">
                <PlaceText>
                  {t(
                    "St. Barbara menighet feirer messe i Kongsberg, Notodden, Rjukan og Mo. Velkommen til messe, katekese og fellesskap.",
                  )}
                </PlaceText>
              </p>
            </div>
          </div>
        </div>
        {mainMass && (
          <div className="border-b border-border">
            <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-6 px-5 py-7 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:py-9">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {sundayAhead ? t("Søndagens messe") : t("Neste messe")}
                </p>
                <p className="mt-1 font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
                  <Link
                    href={mainMass.href}
                    className="focus-ring rounded-sm underline-offset-[6px] hover:underline"
                  >
                    {formatCalendarDate(mainMass.startsAt, false, locale)}{" "}
                    <span className="whitespace-nowrap">
                      {t("kl.")} {formatCalendarTime(mainMass.startsAt, locale)}
                    </span>
                  </Link>
                </p>
                <p
                  translate="no"
                  className="notranslate mt-2 text-muted-foreground"
                >
                  {massAddress(mainMass)}
                </p>
              </div>
              <div className="lg:border-l lg:border-border lg:pl-12">
                {soonerMass && (
                  <>
                    <p className="text-sm font-semibold text-primary">
                      {t("Neste messe")}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-2xl font-medium text-foreground">
                      <Link
                        href={soonerMass.href}
                        className="focus-ring rounded-sm underline-offset-4 hover:underline"
                      >
                        {formatCalendarDate(soonerMass.startsAt, false, locale)}{" "}
                        {t("kl.")}{" "}
                        {formatCalendarTime(soonerMass.startsAt, locale)}
                      </Link>
                      {soonerMass.language &&
                        (soonerMass.language !== "nb" || locale === "en") && (
                          <LanguageBadge language={soonerMass.language} />
                        )}
                    </p>
                  </>
                )}
                <Link
                  href="/messetider"
                  className={buttonVariants({
                    className: soonerMass ? "mt-5" : "lg:mt-6",
                  })}
                >
                  {t("Alle messetider og steder")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:gap-14 lg:py-14">
        <div>
          <h2 className="font-display text-4xl font-medium text-foreground">
            {t("Denne uken")}
          </h2>
          <CalendarChanges
            items={changes}
            today={today}
            hideWhenEmpty
            className="mt-7"
          />
          <div className="mt-7">
            <AgendaList
              items={calendarItems}
              today={today}
              from={today}
              place="Kongsberg"
              compact
            />
          </div>
          {!calendarItems.length && (
            <p className="py-8 text-muted-foreground">
              {t("Nye messetider kommer snart.")}
            </p>
          )}
          {laterItems.length > 0 && (
            <>
              <div className="mt-10 mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-display text-2xl font-medium text-foreground">
                  {t("Senere")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("Et utvalg av arrangementer, høytider og endringer")}
                </p>
              </div>
              <AgendaList
                items={laterItems}
                today={today}
                place="Kongsberg"
                compact
              />
            </>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {t(
              "Messene er i St. Barbara kirke i Kongsberg når ikke annet står.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/messetider#faste-messetider"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("Faste messetider")}
            </Link>
            <Link
              href="/messetider/kalender"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("Hele kalenderen")}
            </Link>
          </div>
        </div>
        <aside className="border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <h2 className="mb-7 font-display text-4xl font-medium text-foreground">
            {t("Kunngjøringer")}
          </h2>
          <AnnouncementBoard
            items={notices}
            limit={4}
            layout="list"
          />
          <Link
            href="/kunngjoringer"
            className="mt-6 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("Alle kunngjøringer")} <span aria-hidden>→</span>
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
          <div className="mt-7 grid items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {articles[0] && <ArticleCard article={articles[0]} lead />}
            <div className="space-y-6">
              {articles.slice(1).map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {verse && (
        <section className="border-t border-border" lang="nb">
          <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:py-16">
            <p className="text-sm font-semibold text-primary">
              {t("Evangelievers")} ·{" "}
              {formatCalendarDate(`${verse.date}T12:00:00Z`, false, locale)}
            </p>
            <blockquote
              translate="no"
              className="notranslate mt-4 font-display text-3xl italic leading-snug text-foreground sm:text-4xl"
            >
              <span aria-hidden className="mr-2 not-italic text-primary">
                ℣
              </span>
              {verse.lines.join(" ")}
            </blockquote>
            {sundayMass && verse.date === sundayMass.occurrenceDate && (
              <p className="mt-6">
                <Link
                  href={sundayMass.href}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
{t("Søndagens lesninger →")}
                </Link>
              </p>
            )}
          </div>
        </section>
      )}

      <section className="border-y border-border">
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
              <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href="/sakramenter"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("Om sakramentene")}
                </Link>
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
                    {sacrament.href ? (
                      <Link
                        href={sacrament.href}
                        className="focus-ring rounded-sm text-primary underline underline-offset-4 hover:text-primary-hover"
                      >
                        {t(sacrament.title)} <span aria-hidden>→</span>
                      </Link>
                    ) : (
                      t(sacrament.title)
                    )}
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
                    <span className="shrink-0 text-xs text-muted-foreground">
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
                    href={phoneHref(contact.phone)}
                    className="hover:text-primary"
                  >
                    {phoneLabel(contact.phone)}
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
              <div>
                <dt className="font-medium text-foreground">
                  <span translate="no" className="notranslate">
                    {notoddenContact.name}
                  </span>
                  , {t("kontaktperson for Notodden")}
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  <a
                    href={phoneHref(notoddenContact.phone)}
                    className="hover:text-primary"
                  >
                    {phoneLabel(notoddenContact.phone)}
                  </a>
                  {" · "}
                  <a
                    href={`mailto:${notoddenContact.email}`}
                    className="hover:text-primary"
                  >
                    {notoddenContact.email}
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
