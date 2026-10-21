// The public domain. Other hosts, such as the Vercel preview URLs, point their canonicals here.
export const SITE_URL = "https://kongsberg.katolsk.no";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
