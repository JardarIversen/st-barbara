import type { Bulletin } from "@/sanity/types";
import { formatArticleDate } from "@/lib/calendar";

export default function SourceBulletins({ bulletins }: { bulletins?: Bulletin[] }) {
  if (!bulletins?.length) return null;

  return (
    <section className="mt-12 border-t border-line pt-7">
      <h2 className="font-display text-2xl font-semibold text-ink">Kilde: søndagsbladet</h2>
      <p className="mt-2 text-sm text-stone">Åpne originaldokumentet dersom du vil kontrollere hele ukeplanen.</p>
      <ul className="mt-4 space-y-2">
        {bulletins.map((bulletin) => (
          <li key={bulletin._id}>
            <a
              href={bulletin.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-burgundy underline-offset-2 hover:underline"
            >
              Søndagsblad · {formatArticleDate(`${bulletin.issueDate}T12:00:00Z`)} (PDF)
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
