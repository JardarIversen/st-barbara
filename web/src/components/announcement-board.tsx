"use client";

import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/link";

import ContentLanguage from "./content-language";
import type { Announcement } from "@/sanity/types";

function announcementText(item: Announcement) {
  const body = item.body
    .flatMap((block) =>
      "children" in block
        ? (block.children as Array<{ text?: string }>).map(
            (child) => child.text ?? "",
          )
        : [],
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return body || item.summary || "";
}

export default function AnnouncementBoard({
  items,
  limit,
  layout = "grid",
}: {
  items: Announcement[];
  limit?: number;
  layout?: "grid" | "list";
}) {
  const { t, locale } = useTranslations();
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "long", timeZone: "Europe/Oslo",
  }).format(new Date(value));
  if (!items.length) {
    return (
      <p className="border-t border-border py-5 text-sm text-muted-foreground">
        {t("Ingen aktive oppslag nå.")}
      </p>
    );
  }

  const visibleItems = limit === undefined ? items : items.slice(0, limit);

  return (
    <div
      className={
        layout === "list"
          ? "divide-y divide-border border-t border-border"
          : "grid gap-x-10 gap-y-6 sm:grid-cols-2"
      }
    >
      {visibleItems.map((item) => {
        const text = announcementText(item);

        return (
          <article
            key={item._id}
            className={
              layout === "list"
                ? "py-4 first:pt-3"
                : "border-t border-border py-5"
            }
          >
            <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
              <ContentLanguage
                original={item.originalFields?.includes("title")}
              >
                {item.eventSlug ? (
                  <Link href={`/messetider/${item.eventSlug}`} className="underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                ) : item.title}
              </ContentLanguage>
            </h3>
            {item.eventStartsAt && (
              <p className="mt-2 text-sm text-primary">
                {formatDate(item.eventStartsAt)}
                {item.registrationDeadline && <> · {t("Påmeldingsfrist")}: {formatDate(item.registrationDeadline)}</>}
              </p>
            )}
            {text && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <ContentLanguage
                  original={item.originalFields?.includes(
                    item.body?.length ? "body" : "summary",
                  )}
                >
                  {text}
                </ContentLanguage>
              </p>
            )}
            {item.links?.length ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {item.links.map((link) => (
                  <a
                    key={link._key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
