import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PortableContent from "@/components/portable-content";
import SourceBulletins from "@/components/source-bulletins";
import {
  EVENT_TYPE_LABELS,
  LANGUAGE_LABELS,
  buildCalendarItems,
  calendarItemFromEvent,
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
  return buildCalendarItems(data, date, date).find((item) => item.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = await resolveItem((await params).slug);
  if (!item) return {};
  return { title: item.title, description: item.summary ?? `${formatCalendarDate(item.startsAt, true)} kl. ${formatCalendarTime(item.startsAt)}` };
}

export default async function CalendarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = await resolveItem((await params).slug);
  if (!item) notFound();

  const massText = item.kind === "mass" && item.occurrenceDate && item.scheduleKey
    ? await getMassText(item.occurrenceDate, item.scheduleKey)
    : null;
  const announcements = await getAnnouncementsByBulletins(item.sourceBulletins.map((bulletin) => bulletin._id));
  const cancelled = item.status === "cancelled";
  const expectsMassText =
    item.kind === "mass" &&
    item.scheduleKey === "mass-schedule:kongsberg:sunday:nb:1100" &&
    !cancelled;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
      <Link href="/messetider" className="text-sm font-medium text-burgundy underline-offset-2 hover:underline">← Kalenderen</Link>
      <p className="mt-8 text-xs font-medium uppercase tracking-[0.22em] text-burgundy">{EVENT_TYPE_LABELS[item.eventType]}</p>
      <h1 className={`mt-3 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl ${cancelled ? "line-through opacity-70" : ""}`}>{item.title}</h1>
      {cancelled && <p className="mt-4 inline-block rounded-sm bg-burgundy px-3 py-1.5 text-sm font-semibold text-paper">Avlyst</p>}
      {item.summary && <p className="mt-5 text-lg leading-relaxed text-stone">{item.summary}</p>}

      <dl className="mt-9 grid gap-5 rounded-sm border border-line bg-cream p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-stone">Tid</dt>
          <dd className={`mt-1 font-display text-xl font-semibold text-ink ${cancelled ? "line-through" : ""}`}>
            {formatCalendarDate(item.startsAt, true)} kl. {formatCalendarTime(item.startsAt)}
            {item.endsAt && `–${formatCalendarTime(item.endsAt)}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-stone">Sted</dt>
          <dd className="mt-1 text-sm text-ink">
            {item.places.length ? item.places.map((place) => (
              <span key={place._id} className="block">
                {place.name}
                {place.streetAddress && <span className="block text-stone">{place.streetAddress}{place.locality ? `, ${place.postalCode ?? ""} ${place.locality}` : ""}</span>}
                {place.mapUrl && <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="text-burgundy underline-offset-2 hover:underline">Vis kart</a>}
              </span>
            )) : "Sted kommer"}
          </dd>
        </div>
        {item.language && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-stone">Språk</dt>
            <dd className="mt-1 text-sm text-ink">{LANGUAGE_LABELS[item.language]}</dd>
          </div>
        )}
        {item.registrationDeadline && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-stone">Påmeldingsfrist</dt>
            <dd className="mt-1 text-sm text-ink">{formatCalendarDate(item.registrationDeadline, true)}</dd>
          </div>
        )}
      </dl>

      {item.publicNote && <p className="mt-7 border-l-2 border-burgundy pl-5 leading-relaxed text-ink">{item.publicNote}</p>}
      {(item.body?.length || item.details?.length) ? (
        <div className="mt-10"><PortableContent value={item.body ?? item.details} /></div>
      ) : null}

      {item.relatedEventSlug && (
        <p className="mt-8"><Link href={`/messetider/${item.relatedEventSlug}`} className="text-sm font-medium text-burgundy underline-offset-2 hover:underline">Se den tilknyttede hendelsen</Link></p>
      )}

      {item.links?.length ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {item.links.map((link) => <a key={link._key} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-burgundy px-5 py-2.5 text-sm font-medium text-paper hover:bg-burgundy-deep">{link.label}</a>)}
        </div>
      ) : null}

      {massText && (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-3xl font-semibold text-ink">{massText.title}</h2>
          <div className="mt-6"><PortableContent value={massText.body} /></div>
        </section>
      )}

      {expectsMassText && !massText && (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-3xl font-semibold text-ink">Lesninger</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            Lesningene legges til når søndagsbladet for denne messen er tilgjengelig.
          </p>
        </section>
      )}

      {announcements.length ? (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-3xl font-semibold text-ink">Kunngjøringer i søndagsbladet</h2>
          <div className="mt-6 space-y-8">
            {announcements.map((announcement) => (
              <div key={announcement._id}>
                <h3 className="font-display text-xl font-semibold text-ink">{announcement.title}</h3>
                <div className="mt-3"><PortableContent value={announcement.body} /></div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <SourceBulletins bulletins={item.sourceBulletins} />
    </article>
  );
}
