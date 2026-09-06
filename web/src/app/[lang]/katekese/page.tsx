import { getTranslations } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { contact } from "@/lib/parish";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Katekese"),
    description: t(
      "Trosopplæring i St. Barbara menighet: Gode Hyrde-katekese, førstekommunion, konfirmantundervisning og SycamOre for voksne.",
    ),
  };
}

const PROGRAMS = [
  {
    title: "Gode Hyrde-katekese",
    age: "3–7 år",
    text: "Montessori-basert trosopplæring der barna møter Den gode hyrde gjennom fortelling, stillhet og undring.",
  },
  {
    title: "Førstekommunion",
    age: "9–12 år",
    text: "Forberedelse til skriftemålet og den første hellige kommunion.",
  },
  {
    title: "Konfirmantundervisning",
    age: "Ungdom, 2026/27",
    text: "To års forberedelse til fermingens sakrament, med undervisning, messer og fellesskap.",
  },
  {
    title: "SycamOre",
    age: "Voksne",
    text: "Filmbasert kurs om den katolske tro – for konvertitter, foreldre og alle som vil gå dypere.",
  },
];

export default async function KatekesePage() {
  const { t } = await getTranslations();
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <h1 className="font-display text-5xl font-medium leading-tight text-foreground">
          {" "}
          {t("Katekese")}{" "}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          {" "}
          {t(
            "Katekesen er menighetens trosopplæring – fra de minste barna til voksne som vil bli kjent med Kirken. Påmeldingen for katekeseåret 2026–2027 er åpen.",
          )}{" "}
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
          {PROGRAMS.map((p) => (
            <div key={t(p.title)} className="bg-background p-8">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t(p.title)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground/80">
                {t(p.age)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(p.text)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-sm border border-border bg-muted p-8 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {" "}
              {t("Påmelding 2026–2027")}{" "}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {" "}
              {t(
                "Påmeldingen skjer digitalt. Usikker på hvilket opplegg som passer? Send oss en e-post på",
              )}{" "}
              <a
                href={`mailto:${contact.email}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {contact.email}
              </a>
              .
            </p>
          </div>
          <a
            href="https://kongsberg.katolsk.no/index.php/2026/06/11/pamelding-til-katekese/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              size: "lg",
              className: "mt-6 sm:mt-0",
            })}
          >
            {" "}
            {t("Til påmeldingen")}{" "}
          </a>
        </div>
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
