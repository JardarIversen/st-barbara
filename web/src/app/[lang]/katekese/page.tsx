import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { toPlainText, type PortableTextBlock } from "next-sanity";
import { buttonVariants } from "@/components/ui/button";
import ContentLanguage from "@/components/content-language";
import PortableContent from "@/components/portable-content";
import { splitPortableSections } from "@/lib/portable-sections";
import { getArticleByPagePath } from "@/sanity/data";
import { shareMetadata } from "@/lib/share";
import CatechesisProgram from "@/components/catechesis-program";
import { connection } from "next/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslations();
  const content = await getArticleByPagePath("/katekese");
  const title = content?.title ?? t("Katekese");
  return {
    title,
    description: content?.summary,
    ...shareMetadata(locale, { title, image: content?.mainImage }),
  };
}

/**
 * A paragraph that is nothing but a link, such as the sign-up forms, is the page's main
 * action and is shown as a button instead of a line of underlined text.
 */
function actionLink(block: PortableTextBlock) {
  if (block._type !== "block" || block.style !== "normal") return null;
  const spans = (block.children ?? []).filter(
    (child) => "text" in child && String(child.text).trim(),
  );
  if (spans.length !== 1) return null;
  const span = spans[0] as { text: string; marks?: string[] };
  const link = (
    block.markDefs as
      | Array<{ _key: string; _type: string; href?: string; blank?: boolean }>
      | undefined
  )?.find((def) => def._type === "link" && span.marks?.includes(def._key));
  return link?.href
    ? {
        key: block._key ?? link._key,
        label: span.text.trim(),
        href: link.href,
        blank: link.blank,
      }
    : null;
}

export default async function KatekesePage() {
  await connection();
  const { t } = await getTranslations();
  const content = await getArticleByPagePath("/katekese");
  if (!content) notFound();
  const { introduction, sections } = splitPortableSections(content.body);
  const originalBody = content.originalFields?.includes("body");
  const actions = introduction.flatMap((block) => actionLink(block) ?? []);

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 py-10 lg:py-12">
        <h1 className="font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          <ContentLanguage original={content.originalFields?.includes("title")}>
            {content.title}
          </ContentLanguage>
        </h1>
        <div className="mt-4 max-w-2xl">
          <PortableContent
            value={introduction.filter((block) => !actionLink(block))}
            original={originalBody}
          />
        </div>
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) => (
              <a
                key={action.key}
                href={action.href}
                target={action.blank ? "_blank" : undefined}
                rel={action.blank ? "noopener noreferrer" : undefined}
                className={buttonVariants({
                  size: "lg",
                  className: "h-auto min-h-control-lg py-2 whitespace-normal",
                })}
              >
                {action.label}
              </a>
            ))}
          </div>
        )}

        {content.catechesis ? (
          <CatechesisProgram program={content.catechesis} />
        ) : (
          <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
            {sections.map(({ heading, body }) => (
              <section
                key={heading._key}
                className="min-w-0 bg-background p-6 [overflow-wrap:anywhere] sm:p-8"
              >
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  <ContentLanguage original={originalBody}>
                    {toPlainText([heading])}
                  </ContentLanguage>
                </h2>
                <div className="mt-4 text-sm">
                  <PortableContent value={body} original={originalBody} />
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-foreground">
            {" "}
            {t("Fra katekeseåret")}{" "}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {" "}
            {t(
              "Våren 2026 mottok 5 barn sin første hellige kommunion, og 8 unge ble fermet av biskop Fredrik.",
            )}{" "}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <figure>
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-border">
                <Image
                  src="/images/forstekommunion-2026.jpg"
                  alt={t("Førstekommunionsbarna på kirketrappen, mai 2026")}
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                {" "}
                {t("Første kommunion, mai 2026")}{" "}
              </figcaption>
            </figure>
            <figure>
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-border">
                <Image
                  src="/images/konfirmasjon-2026.jpg"
                  alt={t("Konfirmantene med biskop Fredrik, mai 2026")}
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                {" "}
                {t("Konfirmasjon med biskop Fredrik, mai 2026")}{" "}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}
