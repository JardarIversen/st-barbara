// Shared by the server page and the client views; keep free of "use client".

export const PLACE_FILTERS = [
  ["all", "Alle steder"],
  ["kongsberg", "Kongsberg"],
  ["notodden", "Notodden"],
  ["rjukan", "Rjukan"],
  ["mo", "Mo"],
] as const;

export type PlaceFilterValue = (typeof PLACE_FILTERS)[number][0];

export function isPlaceFilter(value: unknown): value is PlaceFilterValue {
  return PLACE_FILTERS.some(([key]) => key === value);
}

/** «?sted=mo», so the chosen place follows the visitor between the overview and the calendar. */
export function placeQuery(place: PlaceFilterValue) {
  return place === "all" ? "" : `?sted=${place}`;
}

export function placeFilterLabel(value: string) {
  return PLACE_FILTERS.find(([key]) => key === value)?.[1] ?? "";
}

/** «fast» is the regular-schedule section of the same page; «kalender» is the full calendar. */
export type MassTimesView = "oversikt" | "fast" | "kalender";

export function massTimesView(value: unknown): MassTimesView {
  return value === "fast" || value === "kalender" ? value : "oversikt";
}
