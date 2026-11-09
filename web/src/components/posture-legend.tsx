import { getTranslations } from "@/i18n/server";

const POSTURES = [
  ["staende", "Stå"],
  ["sittende", "Sitt"],
  ["knelende", "Knel"],
] as const;

/** What the posture icons in the margin mean, as on page 2 of the booklet. */
export default async function PostureLegend() {
  const { t } = await getTranslations();
  return (
    <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
      {POSTURES.map(([icon, label]) => (
        <span key={icon} className="flex items-center gap-2">
          <span aria-hidden="true" className={`ikon ikon-${icon} text-foreground`} />
          {t(label)}
        </span>
      ))}
    </p>
  );
}
