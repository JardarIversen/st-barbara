import { getTranslations } from "@/i18n/server";
import { intlLocale } from "@/i18n/config";
import {
  catechesisDates,
  type CatechesisContact,
  type CatechesisProgram as Program,
} from "@/lib/catechesis";
import { todayInOslo } from "@/lib/calendar";
import ContentLanguage from "./content-language";
import PortableContent from "./portable-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { cn } from "@/lib/utils";

function Contact({ contact }: { contact?: CatechesisContact }) {
  if (!contact) return null;
  return (
    <address className="mt-5 flex flex-col gap-1 text-sm not-italic">
      <span className="notranslate font-medium text-foreground" translate="no">
        {contact.name}
      </span>
      <a
        href={`mailto:${contact.email}`}
        translate="no"
        className="notranslate focus-ring rounded-sm text-primary underline underline-offset-4 [overflow-wrap:anywhere]"
      >
        {contact.email}
      </a>
    </address>
  );
}

export default async function CatechesisProgram({
  program,
}: {
  program: Program;
}) {
  const { locale, t } = await getTranslations();
  const today = todayInOslo(new Date());
  const dateLabel = (date: string) =>
    new Intl.DateTimeFormat(intlLocale(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Oslo",
    }).format(new Date(`${date}T12:00:00Z`));
  const time = (value: string) =>
    locale === "nb" ? value.replace(":", ".") : value;

  return (
    <>
      {program.summary && (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          <ContentLanguage
            original={program.originalFields?.includes("summary")}
          >
            {program.summary}
          </ContentLanguage>
        </p>
      )}
      <div className="mt-10 flex flex-col gap-10">
        {program.groups.map((group) => {
          const { next, months } = catechesisDates(group.sessionDates, today);
          return (
            <section
              key={group._key}
              aria-labelledby={`group-${group._key}`}
              className="grid gap-5 border-t border-border pt-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-10"
            >
              <div className="min-w-0">
                <h2
                  id={`group-${group._key}`}
                  className="font-display text-3xl font-semibold leading-tight text-foreground"
                >
                  <ContentLanguage
                    original={group.originalFields?.includes("title")}
                  >
                    {group.title}
                  </ContentLanguage>
                </h2>
                {group.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    <ContentLanguage
                      original={group.originalFields?.includes("summary")}
                    >
                      {group.summary}
                    </ContentLanguage>
                  </p>
                )}
              </div>
              <div className="min-w-0">
                <div className="grid gap-5 min-[360px]:grid-cols-2">
                  {group.sessions.map((session) => (
                    <div
                      key={session._key}
                      className="min-w-0 border-l-2 border-brand pl-4"
                    >
                      <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                        <ContentLanguage
                          original={session.originalFields?.includes("title")}
                        >
                          {session.title}
                        </ContentLanguage>
                      </h3>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
                        <time dateTime={session.startTime}>
                          {time(session.startTime)}
                        </time>
                        –
                        <time dateTime={session.endTime}>
                          {time(session.endTime)}
                        </time>
                      </p>
                      {session.massTime && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t(
                            session.massTime === session.startTime
                              ? "Starter med messe kl."
                              : "Messe kl.",
                          )}{" "}
                          {time(session.massTime)}
                        </p>
                      )}
                      {(session.communionDate || session.communionYear) && (
                        <p className="mt-2 text-sm text-foreground">
                          {t("Planlagt første kommunion:")}{" "}
                          {session.communionDate
                            ? dateLabel(session.communionDate)
                            : session.communionYear}
                        </p>
                      )}
                      {session.summary && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          <ContentLanguage
                            original={session.originalFields?.includes(
                              "summary",
                            )}
                          >
                            {session.summary}
                          </ContentLanguage>
                        </p>
                      )}
                      {session.body?.length ? (
                        <div className="mt-3 text-sm">
                          <PortableContent
                            value={session.body}
                            original={session.originalFields?.includes("body")}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                {months.length > 0 && (
                  <div className="mt-6 rounded-sm bg-muted px-5 py-4">
                    {next ? (
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {t(
                            next === today ? "Samling i dag" : "Neste samling",
                          )}
                        </h3>
                        <p className="font-display text-2xl font-semibold text-foreground">
                          <time dateTime={next}>{dateLabel(next)}</time>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("Alle oppsatte samlinger er gjennomført.")}
                      </p>
                    )}
                    <Accordion className="mt-2">
                      <AccordionItem value="dates">
                        <AccordionTrigger>
                          {t("Alle samlingsdatoer")}
                        </AccordionTrigger>
                        <AccordionContent>
                          <dl className="grid gap-x-7 gap-y-3 sm:grid-cols-2">
                            {months.map(([month, dates]) => (
                              <div
                                key={month}
                                className="flex items-baseline justify-between gap-3 border-t border-border pt-2"
                              >
                                <dt className="text-muted-foreground">
                                  {new Intl.DateTimeFormat(intlLocale(locale), {
                                    month: "long",
                                    year: "numeric",
                                    timeZone: "Europe/Oslo",
                                  }).format(new Date(`${month}-01T12:00:00Z`))}
                                </dt>
                                <dd className="flex flex-wrap justify-end gap-2 font-medium tabular-nums">
                                  {dates.map((date) => (
                                    <time
                                      key={date}
                                      dateTime={date}
                                      aria-label={dateLabel(date)}
                                      className={cn(
                                        date < today
                                          ? "text-muted-foreground"
                                          : "text-foreground",
                                        date === next &&
                                          "text-primary underline underline-offset-4",
                                      )}
                                    >
                                      {Number(date.slice(-2))}
                                      {locale === "nb" ? "." : ""}
                                    </time>
                                  ))}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
                {group.body?.length ? (
                  <div className="mt-5 text-sm">
                    <PortableContent
                      value={group.body}
                      original={group.originalFields?.includes("body")}
                    />
                  </div>
                ) : null}
                <Contact contact={group.contact} />
              </div>
            </section>
          );
        })}
      </div>
      {program.otherOfferings?.length ? (
        <div className="mt-10 grid gap-7 border-t border-border pt-7 sm:grid-cols-2">
          {program.otherOfferings.map((offering) => (
            <section key={offering._key} className="min-w-0">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                <ContentLanguage
                  original={offering.originalFields?.includes("title")}
                >
                  {offering.title}
                </ContentLanguage>
              </h2>
              {offering.summary && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  <ContentLanguage
                    original={offering.originalFields?.includes("summary")}
                  >
                    {offering.summary}
                  </ContentLanguage>
                </p>
              )}
              <div className="mt-3 text-sm">
                <PortableContent
                  value={offering.body}
                  original={offering.originalFields?.includes("body")}
                />
              </div>
              <Contact contact={offering.contact} />
            </section>
          ))}
        </div>
      ) : null}
    </>
  );
}
