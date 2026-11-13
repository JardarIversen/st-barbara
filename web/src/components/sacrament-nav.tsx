import { getTranslations } from "@/i18n/server";
import Link from "@/i18n/link";
import { SACRAMENTS, SACRAMENTS_PATH, sacramentPath } from "@/lib/sacraments";

/** The other sacrament pages, beside the text on wide screens and after it on phones. */
export default async function SacramentNav({ current }: { current: string }) {
  const { t } = await getTranslations();
  return (
    <nav
      aria-label={t("Sakramenter")}
      className="self-start border-t border-border pt-6 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
    >
      <Link
        href={SACRAMENTS_PATH}
        className="focus-ring rounded-sm font-display text-xl font-semibold text-foreground hover:text-primary"
      >
        {t("Sakramenter")}
      </Link>
      <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-1">
        {SACRAMENTS.map((sacrament) => {
          const active = sacrament.slug === current;
          return (
            <li key={sacrament.slug}>
              <Link
                href={sacramentPath(sacrament.slug)}
                aria-current={active ? "page" : undefined}
                className={`focus-ring block rounded-sm py-1 text-[0.95rem] ${
                  active
                    ? "font-medium text-primary"
                    : "text-foreground/75 hover:text-primary"
                }`}
              >
                {t(sacrament.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
