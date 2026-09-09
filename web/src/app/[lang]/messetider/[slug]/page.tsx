import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "@/i18n/link";
import { buttonVariants } from "@/components/ui/button";
import ContentLanguage from "@/components/content-language";
import { notFound } from "next/navigation";
import PortableContent from "@/components/portable-content";
import SourceBulletins from "@/components/source-bulletins";
import {
  EVENT_TYPE_LABELS,
  LANGUAGE_LABELS,
  resolveScheduledMass,
  calendarItemFromEvent,
  calendarDateRange,
  isDateOnlyRange,
  formatCalendarDate,
  formatCalendarTime,
  type CalendarItem,
} from "@/lib/calendar";
import {
  getAnnouncementsByBulletins,
  getCalendarData,
  getEvent,
  getMassText,
} from "@/sanity/data";

async function resolveItem(slug: string): Promise<CalendarItem | null> {
  const event = await getEvent(slug);
  if (event) return calendarItemFromEvent(event);
  const match = slug.match(/(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const date = match[1];
  const data = await getCalendarData(date, date);
  return resolveScheduledMass(data, slug, date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { locale } = await getTranslations();
  const item = await resolveItem((await params).slug);
  if (!item) return {};
  return {
    title: item.title,
    description:
      item.summary ??
      `${calendarDateRange(item, locale)}${isDateOnlyRange(item) ? "" : ` kl. ${formatCalendarTime(item.startsAt, locale)}`}`,
  };
}

export default async function CalendarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { locale, t } = await getTranslations();
  const item = await resolveItem((await params).slug);
  if (!item) notFound();

  const massText =
    item.kind === "mass" && item.occurrenceDate && item.scheduleKey
      ? await getMassText(item.occurrenceDate, item.scheduleKey)
      : null;
  const announcements = await getAnnouncementsByBulletins(
    item.sourceBulletins.map((bulletin) => bulletin._id),
  );
  const cancelled = item.status === "cancelled";
  const multipleDays = Boolean(
    item.endsAt &&
    formatCalendarDate(item.startsAt, false, locale) !==
      formatCalendarDate(item.endsAt, false, locale),
  );
  const expectsMassText =
    item.kind === "mass" &&
    item.scheduleKey === "mass-schedule:kongsberg:sunday:nb:1100" &&
    !cancelled;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
      <Link
        href="/messetider"
        className="text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        {t("← Messetider og arrangementer")}
      </Link>
      <p className="mt-8 text-xs font-medium uppercase tracking-[0.22em] text-primary">
        {t(EVENT_TYPE_LABELS[item.eventType])}
      </p>
      <h1
        className={`mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl ${cancelled ? "line-through opacity-70" : ""}`}
      >
        <ContentLanguage original={item.titleOriginal}>
          {item.title}
        </ContentLanguage>
      </h1>
      {cancelled && (
        <p className="mt-4 inline-block rounded-sm bg-primary px-3 py-1.5 text-sm font-semibold text-background">
          {t("Avlyst")}
        </p>
      )}
      {item.summary && (
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          <ContentLanguage original={item.noteOriginal}>
            {item.summary}
          </ContentLanguage>
        </p>
      )}

      <dl className="mt-9 grid gap-5 rounded-sm border border-border bg-muted p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("Tid")}
          </dt>
          <dd
            className={`mt-1 font-display text-xl font-semibold text-foreground ${cancelled ? "line-through" : ""}`}
          >
            {calendarDateRange(item, locale)}
            {!isDateOnlyRange(item) && (
              <span className="block font-sans text-base font-medium">
                {multipleDays ? t("Start kl. ") : t("Kl. ")}
                {formatCalendarTime(item.startsAt, locale)}
                {item.endsAt &&
                  !multipleDays &&
                  `–${formatCalendarTime(item.endsAt, locale)}`}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("Sted")}
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {item.places.length
              ? item.places.map((place) => (
                  <span
                    key={place._id}
                    className="mb-3 flex flex-col gap-1 last:mb-0"
                  >
                    <span translate="no" className="notranslate font-display text-xl font-semibold leading-snug">{place.name}</span>
                    {place.streetAddress && (
                      <span translate="no" className="notranslate block text-muted-foreground">
                        {place.streetAddress}
                        {place.locality
                          ? `, ${place.postalCode ?? ""} ${place.locality}`
                          : ""}
                      </span>
                    )}
                    {place.mapUrl && (
                      <a
                        href={place.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring mt-1 w-fit rounded-sm font-sans text-sm text-primary underline-offset-2 hover:underline"
                      >
                        {t("Vis kart")}
                      </a>
                    )}
                  </span>
                ))
              : t("Sted kommer")}
          </dd>
        </div>
        {item.language && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("Språk")}
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {t(LANGUAGE_LABELS[item.language])}
            </dd>
          </div>
        )}
        {item.registrationDeadline && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("Påmeldingsfrist")}
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatCalendarDate(item.registrationDeadline, true, locale)}
            </dd>
          </div>
        )}
      </dl>

      {item.publicNote && (
        <p className="mt-7 border-l-2 border-primary pl-5 leading-relaxed text-foreground">
          <ContentLanguage original={item.noteOriginal}>
            {item.publicNote}
          </ContentLanguage>
        </p>
      )}
      {item.body?.length || item.details?.length ? (
        <div className="mt-10">
          <PortableContent
            value={item.body ?? item.details}
            original={item.body ? item.bodyOriginal : item.detailsOriginal}
          />
        </div>
      ) : null}

      {item.relatedEventSlug && (
        <p className="mt-8">
          <Link
            href={`/messetider/${item.relatedEventSlug}`}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("Se den tilknyttede hendelsen")}
          </Link>
        </p>
      )}

      {item.links?.length ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {item.links.map((link) => (
            <a
              key={link._key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants()}
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}

      {massText && (
        <section className="mt-12 border-t border-border pt-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {t("Dagens lesninger")}
          </p>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            <span translate="no" lang="nb" className="notranslate">
              {massText.title}
            </span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {locale === "en"
              ? "Original Norwegian readings for this Mass."
              : "Originaltekst fra søndagsbladet."}
          </p>
          <div className="notranslate mt-6" translate="no" lang="nb">
            <PortableContent value={massText.body} />
          </div>
        </section>
      )}

      {expectsMassText && !massText && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            {t("Lesninger")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {" "}
            {t(
              "Lesningene legges til når søndagsbladet for denne messen er tilgjengelig.",
            )}{" "}
          </p>
        </section>
      )}

      {announcements.length ? (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            {t("Kunngjøringer i søndagsbladet")}
          </h2>
          <div className="mt-6 space-y-8">
            {announcements.map((announcement) => (
              <div key={announcement._id}>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  <ContentLanguage
                    original={announcement.originalFields?.includes("title")}
                  >
                    {announcement.title}
                  </ContentLanguage>
                </h3>
                <div className="mt-3">
                  <PortableContent
                    value={announcement.body}
                    original={announcement.originalFields?.includes("body")}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <SourceBulletins bulletins={item.sourceBulletins} />
    </article>
  );
}
