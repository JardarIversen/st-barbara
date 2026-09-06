import type { Metadata } from "next";
import Image from "next/image";
import { contact } from "@/lib/parish";

export const metadata: Metadata = {
  title: "Katekese",
  description:
    "Trosopplæring i St. Barbara menighet: Gode Hyrde-katekese, førstekommunion, konfirmantundervisning og SycamOre for voksne.",
};

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

export default function KatekesePage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <h1 className="font-display text-5xl font-medium leading-tight text-ink">
          Katekese
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-stone">
          Katekesen er menighetens trosopplæring – fra de minste barna til
          voksne som vil bli kjent med Kirken. Påmeldingen for katekeseåret
          2026–2027 er åpen.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          {PROGRAMS.map((p) => (
            <div key={p.title} className="bg-paper p-8">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {p.title}
              </h2>
              <p className="mt-1 text-sm text-stone/80">{p.age}</p>
              <p className="mt-3 text-sm leading-relaxed text-stone">
                {p.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-sm border border-line bg-cream p-8 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Påmelding 2026–2027
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone">
              Påmeldingen skjer digitalt. Usikker på hvilket opplegg som
              passer? Send oss en e-post på{" "}
              <a
                href={`mailto:${contact.email}`}
                className="text-burgundy underline-offset-2 hover:underline"
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
            className="mt-6 inline-block shrink-0 rounded-sm bg-burgundy px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-burgundy-deep sm:mt-0"
          >
            Til påmeldingen
          </a>
        </div>
      </div>

      <section className="border-t border-line bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-ink">
            Fra katekeseåret
          </h2>
          <p className="mt-3 max-w-2xl text-stone">
            Våren 2026 mottok 5 barn sin første hellige kommunion, og 8 unge
            ble fermet av biskop Fredrik.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <figure>
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-line">
                <Image
                  src="/images/forstekommunion-2026.jpg"
                  alt="Førstekommunionsbarna på kirketrappen, mai 2026"
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-stone">
                Første kommunion, mai 2026
              </figcaption>
            </figure>
            <figure>
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-line">
                <Image
                  src="/images/konfirmasjon-2026.jpg"
                  alt="Konfirmantene med biskop Fredrik, mai 2026"
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-stone">
                Konfirmasjon med biskop Fredrik, mai 2026
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}
