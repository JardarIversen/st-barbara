import Link from "@/i18n/link";
import { getTranslations } from "@/i18n/server";
import { LITURGY_NAV, type LiturgyLanguage } from "@/lib/order-of-mass";

const LANGUAGE_NAMES: Record<LiturgyLanguage, string> = {
  nb: "Norsk",
  en: "English",
};

/** Jumps between the parts of the Mass, and switches the liturgy between Norwegian and English. */
export default async function LiturgyBar({
  language,
  path,
}: {
  language: LiturgyLanguage;
  path: string;
}) {
  const { t } = await getTranslations();
  return (
    <div className="sticky top-16 z-40 -mx-5 mt-8 border-y border-border bg-background/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:top-[4.7rem]">
      <div className="flex items-center gap-3">
        <nav
          aria-label={t("Deler av messen")}
          lang={language}
          translate="no"
          className="notranslate flex min-w-0 flex-1 gap-4 overflow-x-auto py-3 text-sm font-medium"
        >
          {LITURGY_NAV[language].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="focus-ring shrink-0 rounded-sm text-foreground/80 hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div
          role="group"
          aria-label={t("Språk i messens tekst")}
          translate="no"
          className="notranslate flex shrink-0 gap-1 text-sm"
        >
          {(["nb", "en"] as const).map((value) =>
            value === language ? (
              <span
                key={value}
                lang={value}
                aria-current="true"
                className="rounded-sm bg-primary px-2 py-1 font-medium text-primary-foreground"
              >
                {LANGUAGE_NAMES[value]}
              </span>
            ) : (
              <Link
                key={value}
                href={`${path}?liturgi=${value}`}
                lang={value}
                className="focus-ring rounded-sm px-2 py-1 font-medium text-primary hover:underline"
              >
                {LANGUAGE_NAMES[value]}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
