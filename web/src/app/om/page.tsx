import type { Metadata } from "next";
import Image from "next/image";
import { municipalities, priests } from "@/lib/parish";

export const metadata: Metadata = {
  title: "Om menigheten",
  description:
    "St. Barbara menighet ble opprettet i 2021 og dekker Kongsberg, Numedal og Øst-Telemark. Les om historien, kirken og prestene våre.",
};

const TIMELINE = [
  {
    year: "1887",
    text: "Kirkebygget i Rogstadbakken reises – en hvit trekirke med spir og rosevindu.",
  },
  {
    year: "2021",
    text: "St. Barbara menighet opprettes 15. august som egen menighet i Oslo katolske bispedømme.",
  },
  {
    year: "2023",
    text: "Kirken vigsles til St. Barbara 23. september, med relikvier i alteret og full kirke.",
  },
];

export default function OmPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="font-display text-5xl font-medium leading-tight text-ink">
              Om menigheten
            </h1>
            <div className="mt-6 space-y-4 leading-relaxed text-stone">
              <p>
                St. Barbara menighet er Den katolske kirkes menighet for
                Kongsberg, Numedal og Øst-Telemark. Vi feirer messe i
                Kongsberg, Notodden, Rjukan og Mo, og samler katolikker fra
                mange land og språk i ett fellesskap.
              </p>
              <p>Menigheten dekker {municipalities}.</p>
              <p>
                Menigheten ble opprettet i 2021 og er en av de yngste i Oslo
                katolske bispedømme. Kirken vår i Rogstadbakken ble vigslet til
                den hellige Barbara i 2023. Barbara er skytshelgen for
                bergverksfolk, og festdagen hennes feires 4. desember.
              </p>
            </div>
          </div>
          <figure className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full border border-line">
              <Image
                src="/images/prest-morgen.jpg"
                alt="På vei til St. Barbara kirke en tidlig morgen"
                fill
                sizes="(min-width: 1024px) 400px, 85vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs tracking-wide text-stone">
              På vei til kirken
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Timeline */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-ink">
            Historien
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3">
            {TIMELINE.map((item) => (
              <div key={item.year} className="bg-paper p-8">
                <p className="font-display text-5xl font-medium text-burgundy">
                  {item.year}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-stone">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consecration photos */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-4xl font-medium text-ink">
            Kirkevigselen
          </h2>
          <p className="mt-3 max-w-2xl text-stone">
            23. september 2023 vigslet biskopen kirken og alteret.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                src: "/images/vigsling-prosesjon.jpg",
                alt: "Prosesjon under vigslingsmessen",
              },
              {
                src: "/images/vigsling-rokelse.jpg",
                alt: "Røkelse foran alterbildet under vigslingen",
              },
              {
                src: "/images/kirken-kveld.jpg",
                alt: "Kirken om kvelden etter vigslingen, med lys i rosevinduet",
              },
            ].map((img) => (
              <div
                key={img.src}
                className="relative aspect-[3/4] overflow-hidden rounded-sm border border-line"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 30vw, 90vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Priests */}
      <section className="border-t border-line bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center font-display text-4xl font-medium text-ink">
            Våre prester
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-3">
            {priests.map((p) => (
              <div key={p.name} className="text-center">
                <div className="relative mx-auto aspect-[3/4] w-44 overflow-hidden rounded-t-full border border-line sm:w-full">
                  <Image
                    src={p.image}
                    alt={`Portrett av ${p.name}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                  {p.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-stone">
                  {p.role}
                </p>
                <p className="mt-2 text-sm text-burgundy">{p.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
