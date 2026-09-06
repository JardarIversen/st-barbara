import type { Metadata } from "next";
import Image from "next/image";
import { contact, priests } from "@/lib/parish";
import { getParishPlaces } from "@/sanity/data";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt St. Barbara menighet i Kongsberg – adresse, telefon, e-post og våre prester.",
};

export default async function KontaktPage() {
  const places = await getParishPlaces();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
      <h1 className="font-display text-5xl font-medium leading-tight text-ink">
        Kontakt
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone">
        Gjelder det dåp, vielse, sjelesorg eller noe annet – ta kontakt, så
        finner vi tid til en samtale.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-8">
          <div className="rounded-sm border border-line bg-cream p-8">
            <h2 className="font-display text-2xl font-semibold text-ink">Messesteder</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {places.map((place) => (
                <div key={place._id} className="border-t border-line pt-3 text-sm">
                  <h3 className="font-medium text-ink">{place.name}</h3>
                  <p className="mt-1 text-stone">
                    {[place.streetAddress, [place.postalCode, place.locality].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                  </p>
                  {place.mapUrl && (
                    <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-burgundy underline-offset-2 hover:underline">Vis kart</a>
                  )}
                </div>
              ))}
            </div>
            <dl className="mt-7 space-y-4 border-t border-line pt-5 text-sm">
              <div>
                <dt className="text-xs font-medium text-stone">Telefon</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:+47${contact.phone.replace(/\s/g, "")}`}
                    className="text-ink hover:text-burgundy"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-stone">E-post</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-ink hover:text-burgundy"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Våre prester
            </h2>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {priests.map((p) => (
                <li key={p.name} className="flex items-center gap-5 py-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-line">
                    <Image
                      src={p.image}
                      alt={`Portrett av ${p.name}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-stone">{p.role}</p>
                  </div>
                  <a
                    href={`tel:+47${p.phone.replace(/\s/g, "")}`}
                    className="ml-auto text-sm text-burgundy hover:underline"
                  >
                    {p.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <figure className="relative">
          <div className="relative h-full min-h-105 overflow-hidden rounded-sm border border-line">
            <Image
              src="/images/vigsling-prosesjon.jpg"
              alt="Prosesjon i St. Barbara kirke"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
        </figure>
      </div>
    </div>
  );
}
