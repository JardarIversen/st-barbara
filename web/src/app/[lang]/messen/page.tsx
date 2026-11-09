import type { Metadata } from "next";
import Link from "@/i18n/link";
import { getTranslations } from "@/i18n/server";
import LiturgyBar from "@/components/liturgy-bar";
import OrderOfMass from "@/components/order-of-mass";
import PostureLegend from "@/components/posture-legend";
import { liturgyLanguage } from "@/lib/order-of-mass";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Messens ordning"),
    description: t(
      "Messens faste ledd på norsk og engelsk, slik de står i liturgiheftet i St. Barbara kirke.",
    ),
  };
}

export default async function OrderOfMassPage({
  searchParams,
}: {
  searchParams: Promise<{ liturgi?: string | string[] }>;
}) {
  const { locale, t } = await getTranslations();
  const language = liturgyLanguage((await searchParams).liturgi) ?? locale;

  return (
    <article className="mx-auto max-w-2xl px-5 py-10 lg:py-14">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        {t("Liturgiheftet")}
      </p>
      <h1 className="font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
        {t("Messens ordning")}
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        {t(
          "Her står messens faste ledd i forenklet form, slik de står i liturgiheftet i kirken. Lesningene og bønnene skifter med kirkeåret, og presten kan velge andre former enn dem som står her. På hverdager faller Gloria og trosbekjennelsen vanligvis bort.",
        )}
      </p>
      <p className="mt-4">
        <Link
          href="/messen/i-dag"
          className="focus-ring rounded-sm text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("Dagens messe med lesninger →")}
        </Link>
      </p>
      <PostureLegend />
      <LiturgyBar language={language} path="/messen" />
      <div className="mt-10">
        <OrderOfMass language={language} />
      </div>
    </article>
  );
}
