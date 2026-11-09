// Choices for how the order of Mass is shown. Kept apart from the booklet text so the browser
// gets these without the whole liturgy.

export type LiturgyLanguage = "nb" | "en";
/** Sunday and solemnity ("høymesse"), or an ordinary weekday Mass. */
export type MassMode = "hoymesse" | "hverdag";
export type EucharisticPrayer = "1" | "2" | "3" | "4";
export type Season = "advent" | "lent" | null;

export function massMode(value: unknown): MassMode | null {
  const mode = Array.isArray(value) ? value[0] : value;
  return mode === "hoymesse" || mode === "hverdag" ? mode : null;
}

/** The prayers each language has. English has only the two printed in the booklet. */
export const PRAYERS: Record<LiturgyLanguage, EucharisticPrayer[]> = {
  nb: ["1", "2", "3", "4"],
  en: ["2", "3"],
};

export function eucharisticPrayer(
  value: unknown,
  language: LiturgyLanguage,
): EucharisticPrayer | null {
  const prayer = Array.isArray(value) ? value[0] : value;
  return PRAYERS[language].includes(prayer as EucharisticPrayer)
    ? (prayer as EucharisticPrayer)
    : null;
}

// Our assumption until the parish says otherwise: III at Sunday Mass, II on weekdays.
export const defaultPrayer = (mode: MassMode): EucharisticPrayer =>
  mode === "hoymesse" ? "3" : "2";

/** Sundays get the Sunday Mass; any other day the weekday Mass. */
export function defaultMode(date: string): MassMode {
  return new Date(`${date}T00:00:00Z`).getUTCDay() === 0 ? "hoymesse" : "hverdag";
}

function shift(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** Easter Sunday in the Gregorian calendar (the anonymous Gregorian algorithm). */
export function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Advent and Lent, when the Gloria is not sung on Sundays. Lent runs from Ash Wednesday to the
 * Wednesday of Holy Week; the Mass of the Lord's Supper on Holy Thursday has the Gloria again.
 */
export function liturgicalSeason(date: string): Season {
  const year = Number(date.slice(0, 4));
  const easter = easterSunday(year);
  if (date >= shift(easter, -46) && date <= shift(easter, -4)) return "lent";
  const christmas = `${year}-12-25`;
  const weekday = new Date(`${christmas}T00:00:00Z`).getUTCDay();
  const fourthSunday = shift(christmas, -(weekday === 0 ? 7 : weekday));
  if (date >= shift(fourthSunday, -21) && date < christmas) return "advent";
  return null;
}
