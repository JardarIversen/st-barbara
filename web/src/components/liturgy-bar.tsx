import { LanguageToggle } from "@/components/liturgy-view";
import { getTranslations } from "@/i18n/server";
import { LITURGY_NAV, type LiturgyLanguage } from "@/lib/order-of-mass";

/** Jumps between the parts of the Mass, and switches the liturgy between Norwegian and English.
    Must be inside <LiturgyView>. */
export default async function LiturgyBar({
  language,
  path,
  anchor,
}: {
  language: LiturgyLanguage;
  path: string;
  anchor?: string;
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
        <LanguageToggle path={path} anchor={anchor} />
      </div>
    </div>
  );
}
