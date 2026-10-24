import { getTranslations } from "@/i18n/server";
import Link from "@/i18n/link";
import { contact, notoddenContact, phoneHref, phoneLabel } from "@/lib/parish";
import { getParishPlaces } from "@/sanity/data";
import PlaceText from "@/components/place-text";

export default async function Footer() {
  const { t } = await getTranslations();
  const places = await getParishPlaces();
  return (
    <footer className="bg-inverse text-background/75">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p
              translate="no"
              className="notranslate flex items-center gap-2 font-display text-2xl font-semibold text-background"
            >
              <span aria-hidden className="text-brand">
                ✠
              </span>{" "}
              {t("St. Barbara menighet")}{" "}
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              {" "}
              <PlaceText>
                {t(
                  "Den katolske kirke i Kongsberg, Notodden, Rjukan og Mo. En menighet i Oslo katolske bispedømme.",
                )}
              </PlaceText>{" "}
            </p>
            <div className="mt-6 text-sm">
              <p className="text-background/90">
                Vipps <span className="font-semibold">{contact.vipps}</span>
              </p>
              <p className="mt-1.5 text-xs text-background/50">
                {t("Konto")} {contact.konto}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-brand">
              {" "}
              {t("Snarveier")}{" "}
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
                    className="transition-colors hover:text-brand-soft"
                  >
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-brand">
              {" "}
              {t("Messesteder")}{" "}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {places.map((place) => (
                <li key={place._id} translate="no" className="notranslate">
                  <span className="text-background/90">{place.name}</span>
                  {place.locality && (
                    <span className="block text-xs text-background/50">
                      {place.locality}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-brand">
              {" "}
              {t("Kontakt")}{" "}
            </p>
            <div className="mt-4 text-sm">
              <p className="text-background/90">
                {t("St. Barbara kirke, Kongsberg")}
              </p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <a
                    href={phoneHref(contact.phone)}
                    className="hover:text-brand-soft"
                  >
                    {phoneLabel(contact.phone)}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-brand-soft"
                  >
                    {contact.email}
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-6 text-sm">
              <p translate="no" className="notranslate text-background/90">
                {notoddenContact.name}
              </p>
              <p className="text-xs text-background/50">
                {t("Kontaktperson for Notodden")}
              </p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <a
                    href={phoneHref(notoddenContact.phone)}
                    className="hover:text-brand-soft"
                  >
                    {phoneLabel(notoddenContact.phone)}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${notoddenContact.email}`}
                    className="hover:text-brand-soft"
                  >
                    {notoddenContact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-background/15 pt-6 text-xs text-background/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            {t("St. Barbara menighet · Oslo katolske bispedømme")}{" "}
          </p>
          <p>{t("Foto: St. Barbara menighet")}</p>
        </div>
      </div>
    </footer>
  );
}
