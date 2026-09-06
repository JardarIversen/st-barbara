import type { Announcement } from "@/sanity/types";

function announcementText(item: Announcement) {
  const body = item.body
    .flatMap((block) =>
      "children" in block
        ? (block.children as Array<{ text?: string }>).map((child) => child.text ?? "")
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
}: {
  items: Announcement[];
  limit?: number;
}) {
  if (!items.length) {
    return <p className="border-t border-line py-5 text-sm text-stone">Ingen aktive oppslag nå.</p>;
  }

  const visibleItems = limit === undefined ? items : items.slice(0, limit);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visibleItems.map((item) => {
        const text = announcementText(item);

        return (
          <article key={item._id} className="rounded-sm border border-line bg-paper p-4">
            <h3 className="font-display text-xl font-semibold leading-snug text-ink">{item.title}</h3>
            {text && <p className="mt-3 text-sm leading-relaxed text-stone">{text}</p>}
            {item.links?.length ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {item.links.map((link) => (
                  <a
                    key={link._key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-burgundy underline-offset-2 hover:underline"
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
