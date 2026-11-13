// The sacrament pages, in the order the parish asked for. Each page's text is a Sanity
// article whose pagePath is `/sakramenter/<slug>`; the labels here are only the menu names,
// so the header can show them without fetching content.
export const SACRAMENTS_PATH = "/sakramenter";

export const SACRAMENTS = [
  { slug: "dap", label: "Dåp" },
  { slug: "konfirmasjon", label: "Konfirmasjon" },
  { slug: "nattverd", label: "Nattverd (Eukaristi)" },
  { slug: "skriftemal", label: "Skriftemål" },
  { slug: "sykesalving", label: "Sykesalving" },
  { slug: "ordinasjon", label: "Ordinasjon" },
  { slug: "ektevielse", label: "Ektevielse" },
  { slug: "begravelse", label: "Begravelse" },
] as const;

export type Sacrament = (typeof SACRAMENTS)[number];

export function sacramentPath(slug: string) {
  return `${SACRAMENTS_PATH}/${slug}`;
}

export const SACRAMENT_PATHS: string[] = SACRAMENTS.map((sacrament) =>
  sacramentPath(sacrament.slug),
);

export function findSacrament(slug: string) {
  return SACRAMENTS.find((sacrament) => sacrament.slug === slug);
}

export function isSacramentPath(path?: string) {
  return path !== undefined && SACRAMENT_PATHS.includes(path);
}
