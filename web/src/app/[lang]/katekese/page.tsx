import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { toPlainText } from "next-sanity";
import ContentLanguage from "@/components/content-language";
import PortableContent from "@/components/portable-content";
import { splitPortableSections } from "@/lib/portable-sections";
import { getArticleByPagePath } from "@/sanity/data";
import CatechesisProgram from "@/components/catechesis-program";
import { connection } from "next/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  const content = await getArticleByPagePath("/katekese");
  return {
    title: content?.title ?? t("Katekese"),
    description: content?.summary,
  };
}

export default async function KatekesePage() {
  await connection();
  const { t } = await getTranslations();
  const content = await getArticleByPagePath("/katekese");
  if (!content) notFound();
  const { introduction, sections } = splitPortableSections(content.body);
  const originalBody = content.originalFields?.includes("body");

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 py-10 lg:py-12">
        <h1 className="font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          <ContentLanguage original={content.originalFields?.includes("title")}>
            {content.title}
          </ContentLanguage>
        </h1>
        <div className="mt-4 max-w-2xl">
          <PortableContent value={introduction} original={originalBody} />
        </div>

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
