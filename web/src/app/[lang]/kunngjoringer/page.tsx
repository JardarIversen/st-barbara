import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import AnnouncementBoard from "@/components/announcement-board";
import { rankAnnouncements } from "@/lib/announcements";
import { getActiveAnnouncements } from "@/sanity/data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Kunngjøringer"),
    description: t("Aktuelle kunngjøringer fra St. Barbara menighet."),
  };
}

export default async function KunngjoringerPage() {
  const { t } = await getTranslations();
  await connection();
  const announcements = await getActiveAnnouncements(new Date().toISOString());

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
      <h1 className="font-display text-5xl font-medium leading-tight text-foreground">
        {t("Kunngjøringer")}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {" "}
        {t("Aktuell informasjon fra menigheten.")}{" "}
      </p>
      <div className="mt-12">
        <AnnouncementBoard items={rankAnnouncements(announcements)} />
      </div>
    </div>
  );
}
