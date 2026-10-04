import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/i18n/link";
import { getTranslations } from "@/i18n/server";
import { getAnnouncement } from "@/sanity/data";
import ContentLanguage from "@/components/content-language";
import PortableContent from "@/components/portable-content";
import SourceBulletins from "@/components/source-bulletins";
import { buttonVariants } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getAnnouncement((await params).slug);
  return item ? { title: item.title, description: item.summary } : {};
}

export default async function AnnouncementPage({ params }: Props) {
  const { t } = await getTranslations();
  const item = await getAnnouncement((await params).slug);
  if (!item) notFound();
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
      <Link href="/kunngjoringer" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
        ← {t("Kunngjøringer")}
      </Link>
      <h1 className="mt-8 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
        <ContentLanguage original={item.originalFields?.includes("title")}>{item.title}</ContentLanguage>
      </h1>
      {item.summary && (
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          <ContentLanguage original={item.originalFields?.includes("summary")}>{item.summary}</ContentLanguage>
        </p>
      )}
      {item.links?.length ? (
        <div className="mt-7 flex flex-wrap gap-3">
          {item.links.map((link) => (
            <a key={link._key} href={link.url} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
      <div className="mt-10">
        <PortableContent value={item.body} original={item.originalFields?.includes("body")} />
      </div>
      <SourceBulletins bulletins={item.sourceBulletins ?? []} />
    </article>
  );
}
