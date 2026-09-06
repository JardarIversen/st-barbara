import Link from "next/link";
import { contact } from "@/lib/parish";
import { getParishPlaces } from "@/sanity/data";

export default async function Footer() {
  const places = await getParishPlaces();
  return (
    <footer className="bg-night text-paper/75">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p
              translate="no"
              className="notranslate flex items-center gap-2 font-display text-2xl font-semibold text-paper"
            >
              <span aria-hidden className="text-gold">
                ✠
              </span>
              St. Barbara menighet
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              Den katolske kirke i Kongsberg, Notodden, Rjukan og Mo. En
              menighet i Oslo katolske bispedømme.
            </p>
          </div>

          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-gold">
              Snarveier
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["Messetider", "/messetider"],
                ["Katekese", "/katekese"],
                ["Innlegg", "/innlegg"],
                ["Om menigheten", "/om"],
                ["Donasjoner", "/donasjoner"],
                ["Kontakt", "/kontakt"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors hover:text-gold-light"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-gold">
              Messesteder
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {places.map((place) => (
                <li key={place._id}>
                  <span className="text-paper/90">{place.name}</span>
                  {place.locality && <span className="block text-xs text-paper/50">{place.locality}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-gold">
              Kontakt
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>St. Barbara kirke, Kongsberg</li>
              <li>
                <a
                  href={`tel:+47${contact.phone.replace(/\s/g, "")}`}
                  className="hover:text-gold-light"
                >
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-gold-light"
                >
                  {contact.email}
                </a>
              </li>
              <li className="pt-2 text-paper/90">
                Vipps <span className="font-semibold">{contact.vipps}</span>
              </li>
              <li className="text-xs text-paper/50">
                Konto {contact.konto}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-paper/15 pt-6 text-xs text-paper/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()} St. Barbara menighet · Oslo katolske
            bispedømme
          </p>
          <p>Foto: St. Barbara menighet</p>
        </div>
      </div>
    </footer>
  );
}
