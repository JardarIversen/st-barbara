import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "@/i18n/link";
import { getTranslations } from "@/i18n/server";
import { PlanView } from "@/components/mass-times";
import { addDays, buildCalendarItems, buildScheduleOverview, todayInOslo } from "@/lib/calendar";
import { getCalendarData } from "@/sanity/data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Faste messetider"),
    description: t("Vanlige messetider for Kongsberg, Notodden, Rjukan og Mo. Se kalenderen for endringer."),
  };
}

export default async function RegularMassTimesPage() {
  const { locale, t } = await getTranslations();
  await connection();
  const now = new Date();
  const today = todayInOslo(now);
  const endDate = addDays(today, 120);
  const data = await getCalendarData(today, endDate);
  const items = buildCalendarItems(data, today, endDate);
  const overview = buildScheduleOverview(data, items, now, today, locale);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:py-12">
      <h1 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
        {t("Faste messetider")}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        {t("Vanlige messetider for Kongsberg, Notodden, Rjukan og Mo. Se kalenderen for endringer.")}
      </p>
      <div className="my-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-primary">
        <Link href="/messetider/kalender" className="underline-offset-4 hover:underline">{t("Se hele kalenderen")} →</Link>
        <Link href="/kunngjoringer" className="underline-offset-4 hover:underline">{t("Se kunngjøringer")} →</Link>
      </div>
      <PlanView groups={overview} />
    </div>
  );
}
