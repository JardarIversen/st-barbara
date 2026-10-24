import type { CalendarItem } from "@/lib/calendar";
import type { Place } from "@/sanity/types";
import { isDateOnlyRange, todayInOslo } from "./calendar.ts";
import { contact, phoneHref } from "./parish.ts";
import { absoluteUrl } from "./site.ts";

// schema.org data for search engines. It describes only what the page shows, and Sanity's
// null values are left out rather than sent as empty facts.
const PARISH_ID = absoluteUrl("/#parish");
const CHURCH_ID = absoluteUrl("/#church");
const MAIN_CHURCH = "place:kongsberg-st-barbara";

const telephone = (phone: string) => phoneHref(phone).replace(/^tel:/, "");

function postalAddress(place: Place) {
  if (!place.streetAddress && !place.locality) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: place.streetAddress ?? undefined,
    postalCode: place.postalCode ?? undefined,
    addressLocality: place.locality ?? undefined,
    addressCountry: "NO",
  };
}

// Only the parish's own church is marked as Catholic. Masses elsewhere are held in other churches,
// and Notodden is reached through its own contact, so other places get no parish telephone.
function placeData(place: Place) {
  if (place.sourceKey === MAIN_CHURCH) {
    return {
      "@type": "CatholicChurch",
      "@id": CHURCH_ID,
      name: place.name,
      address: postalAddress(place),
      hasMap: place.mapUrl ?? undefined,
      telephone: telephone(contact.phone),
      image: absoluteUrl("/images/kirken-eksterior.jpg"),
      publicAccess: true,
    };
  }
  return {
    "@type": ["church", "chapel"].includes(place.placeType) ? "Church" : "Place",
    name: place.name,
    address: postalAddress(place),
    hasMap: place.mapUrl ?? undefined,
  };
}

export function parishStructuredData(
  places: Place[],
  { url, description }: { url: string; description: string },
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": PARISH_ID,
        name: contact.name,
        description,
        url,
        email: contact.email,
        telephone: telephone(contact.phone),
        image: absoluteUrl("/parish-share.png"),
        parentOrganization: {
          "@type": "Organization",
          name: "Oslo katolske bispedømme",
          url: "https://www.katolsk.no",
        },
        location: places.map(placeData),
      },
    ],
  };
}

const EVENT_STATUS = {
  scheduled: "https://schema.org/EventScheduled",
  cancelled: "https://schema.org/EventCancelled",
  postponed: "https://schema.org/EventPostponed",
} as const;

// Regular masses are not marked up; only one-off events are.
export function eventStructuredData(item: CalendarItem, url: string) {
  if (item.kind !== "event" || !item.place) return null;
  const dateOnly = isDateOnlyRange(item);
  const date = (iso: string) => (dateOnly ? todayInOslo(new Date(iso)) : iso);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: item.title,
    description: item.summary ?? undefined,
    startDate: date(item.startsAt),
    endDate: item.endsAt ? date(item.endsAt) : undefined,
    eventStatus:
      EVENT_STATUS[item.status as keyof typeof EVENT_STATUS] ??
      EVENT_STATUS.scheduled,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage:
      item.language && item.language !== "other" ? item.language : undefined,
    location: {
      "@type": "Place",
      name: item.place.name,
      address: postalAddress(item.place),
    },
    organizer: { "@id": PARISH_ID, "@type": "Organization", name: contact.name },
    url,
  };
}
