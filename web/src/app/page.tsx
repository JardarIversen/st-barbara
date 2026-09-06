import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBoard from "@/components/announcement-board";
import ArticleCard from "@/components/article-card";
import TimelineList from "@/components/timeline-list";
import {
  addDays,
  buildCalendarItems,
  formatArticleDate,
  formatCalendarDate,
  formatCalendarTime,
  placeFilterKey,
  todayInOslo,
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
  { title: "Dåp", text: "Ta kontakt med menigheten for å avtale dåp av barn eller voksne." },
  { title: "Første kommunion", text: "Barna forberedes gjennom katekesen og mottar kommunionen om våren." },
  { title: "Konfirmasjon", text: "Ungdom følger konfirmantundervisningen over to år før fermingen." },
  { title: "Ekteskap", text: "Par som ønsker å gifte seg i kirken, avtaler tid for samtale med presten i god tid." },
];

export default async function Home() {
  await connection();
  const today = todayInOslo();
  const endDate = addDays(today, 28);
  const [calendarData, announcements, articles, bulletins, places] = await Promise.all([
    getCalendarData(today, endDate),
    getActiveAnnouncements(new Date().toISOString()),
    getLatestArticles(),
    getLatestBulletins(),
    getParishPlaces(),
  ]);
  const calendarItems = buildCalendarItems(calendarData, today, endDate).slice(0, 14);
  const nextKongsbergMass = calendarItems.find(
    (item) =>
      item.kind === "mass" &&
      item.status !== "cancelled" &&
      item.places.some((place) => placeFilterKey(place) === "kongsberg"),
  );
  const mainPlace = places.find((place) => placeFilterKey(place) === "kongsberg");
  const address = mainPlace
    ? [mainPlace.streetAddress, [mainPlace.postalCode, mainPlace.locality].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ")
    : "Kongsberg";

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-12">
          <div>
            <h1 className="font-display text-5xl font-medium leading-[1.05] text-ink lg:text-6xl">Den katolske kirke i&nbsp;Kongsberg</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone">
              St. Barbara menighet feirer messe i Kongsberg, Notodden, Rjukan og Mo. Velkommen til messe, katekese og fellesskap.
            </p>
            <div className="mt-7">
              <Link href="/messetider" className="rounded-sm bg-burgundy px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-burgundy-deep">Se messetider</Link>
            </div>
            {nextKongsbergMass && (
              <p className="mt-9 border-t border-line pt-5 text-sm text-stone">
                <span className="font-medium text-ink">Neste messe i Kongsberg: {formatCalendarDate(nextKongsbergMass.startsAt)} kl. {formatCalendarTime(nextKongsbergMass.startsAt)}</span>
                <span className="block">{nextKongsbergMass.place?.name}, {address}</span>
              </p>
            )}
          </div>
          <figure className="relative mx-auto w-full max-w-xs lg:max-w-sm">
            <div className="overflow-hidden rounded-t-full border border-line bg-cream p-2.5 pb-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full">
                <Image src="/images/kirken-eksterior.jpg" alt="St. Barbara kirke i Kongsberg" fill priority sizes="(min-width: 1024px) 400px, 80vw" className="object-cover object-[35%_center]" />
              </div>
            </div>
            <figcaption className="mt-3 text-center text-xs tracking-wide text-stone">St. Barbara kirke, Rogstadbakken</figcaption>
          </figure>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">Fra i dag</p>
              <h2 className="mt-2 font-display text-4xl font-medium text-ink">Messer og hendelser</h2>
              <p className="mt-3 max-w-xl text-stone">Den oppdaterte planen for alle fire steder, med endringer fra søndagsbladet.</p>
            </div>
            <Link href="/messetider" className="mb-1 text-sm font-medium text-burgundy underline-offset-4 hover:underline">Åpne hele kalenderen</Link>
          </div>
          <div className="relative isolate mt-6 max-h-[29rem] overflow-hidden md:max-h-[24rem]">
            <TimelineList items={calendarItems} compact />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-linear-to-b from-paper to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-linear-to-t from-paper via-paper/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center">
              <Link href="/messetider" className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-burgundy shadow-sm transition hover:border-gold">Se mer</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-cream/55">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 font-display text-4xl font-medium text-ink">Kunngjøringer</h2>
            <AnnouncementBoard items={rankAnnouncements(announcements)} limit={4} />
            <Link href="/kunngjoringer" className="mt-6 inline-block rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-burgundy shadow-sm transition hover:border-gold">Se mer</Link>
          </div>
          <div>
            <div className="flex items-end justify-between gap-5">
              <h2 className="font-display text-4xl font-medium text-ink">Innlegg</h2>
              <Link href="/innlegg" className="text-sm font-medium text-burgundy underline-offset-4 hover:underline">Alle innlegg</Link>
            </div>
            <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2">
              {articles.map((article) => <ArticleCard key={article._id} article={article} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <Image src="/images/vigsling-rokelse.jpg" alt="" fill sizes="100vw" className="object-cover object-[center_32%]" />
        <div className="absolute inset-0 bg-night/60" />
        <div className="relative mx-auto max-w-3xl px-5 py-32 text-center sm:py-40">
          <p aria-hidden className="text-gold-light">✠</p>
          <blockquote className="mt-5 font-display text-3xl font-medium italic leading-snug text-paper sm:text-4xl">«Det finnes ikke frykt i kjærligheten. Den fullkomne kjærlighet driver frykten ut.»</blockquote>
          <p className="mt-5 text-xs uppercase tracking-[0.25em] text-paper/60">1. Johannes 4,18</p>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-4xl font-medium text-ink">Livets gang</h2>
              <p className="mt-4 leading-relaxed text-stone">Kirken følger mennesket gjennom livet, fra dåpen til den siste velsignelsen. Ta kontakt med p. Trym for en samtale – om dåp, vielse, sykebesøk eller gravferd.</p>
              <p className="mt-6"><Link href="/kontakt" className="text-sm font-medium text-burgundy underline-offset-4 hover:underline">Kontakt menigheten</Link></p>
            </div>
            <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {SACRAMENTS.map((sacrament) => (
                <div key={sacrament.title} className="border-t border-line pt-4">
                  <dt className="font-display text-xl font-semibold text-ink">{sacrament.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-stone">{sacrament.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-medium text-ink">Søndagsblad</h2>
            <p className="mt-3 max-w-md text-stone">Originalkilden med messetider, kunngjøringer og lesninger.</p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {bulletins.map((bulletin) => (
                <li key={bulletin._id}>
                  <a href={bulletin.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 py-4 text-sm">
                    <span className="font-medium text-ink transition-colors hover:text-burgundy">Søndagsblad · {formatArticleDate(`${bulletin.issueDate}T12:00:00Z`)}</span>
                    <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-stone">PDF</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-4xl font-medium text-ink">Besøk oss</h2>
            <dl className="mt-7 space-y-5 text-sm">
              <div>
                <dt className="font-medium text-ink">{mainPlace?.name ?? "St. Barbara kirke"}</dt>
                <dd className="mt-1 text-stone">
                  {address}
                  {mainPlace?.mapUrl && <> · <a href={mainPlace.mapUrl} target="_blank" rel="noopener noreferrer" className="text-burgundy underline-offset-2 hover:underline">Vis kart</a></>}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">P. Trym Hellevig, sogneadministrator</dt>
                <dd className="mt-1 text-stone">
                  <a href={`tel:+47${contact.phone.replace(/\s/g, "")}`} className="hover:text-burgundy">{contact.phone}</a>{" · "}
                  <a href={`mailto:${contact.email}`} className="hover:text-burgundy">{contact.email}</a>
                </dd>
              </div>
            </dl>
            <Link href="/kontakt" className="mt-8 inline-block rounded-sm bg-burgundy px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-burgundy-deep">Kontakt menigheten</Link>
          </div>
        </div>
      </section>
    </>
  );
}
