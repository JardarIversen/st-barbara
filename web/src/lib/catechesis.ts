import type { PortableTextBlock } from "next-sanity";

type Copy = {
  title: string;
  summary?: string;
  body?: PortableTextBlock[];
  originalFields?: string[];
};
export type CatechesisContact = { name: string; email: string };
export type CatechesisSession = Copy & {
  _key: string;
  startTime: string;
  endTime: string;
  massTime?: string;
  communionYear?: number;
  communionDate?: string;
};
export type CatechesisGroup = Copy & {
  _key: string;
  sessions: CatechesisSession[];
  sessionDates?: string[];
  contact?: CatechesisContact;
};
export type CatechesisProgram = {
  summary?: string;
  originalFields?: string[];
  groups: CatechesisGroup[];
  otherOfferings?: Array<Copy & { _key: string; contact?: CatechesisContact }>;
};

// Date-only values are shared across languages. No dates are inferred from prose.
export function catechesisDates(dates: string[] = [], today: string) {
  const sorted = [...new Set(dates)].sort();
  const months = new Map<string, string[]>();
  for (const date of sorted) {
    const month = date.slice(0, 7);
    months.set(month, [...(months.get(month) ?? []), date]);
  }
  return {
    next: sorted.find((date) => date >= today),
    months: [...months.entries()],
  };
}
