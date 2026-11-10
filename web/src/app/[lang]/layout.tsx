import type { Metadata, Viewport } from "next";
import { EB_Garamond, Source_Sans_3 } from "next/font/google";
import Header from "@/components/header";
import { NavigationHistory } from "@/components/navigation-history";
import Footer from "@/components/footer";
import { SanityLive } from "@/sanity/live";
import { notFound } from "next/navigation";
import { contentLocale, isLocale, routeLanguage } from "@/i18n/config";
import { localizedPath } from "@/i18n/config";
import { headers } from "next/headers";
import { getSiteLanguage, getTranslations } from "@/i18n/server";
import { LocaleProvider } from "@/i18n/client";
import { AutomaticTranslation } from "@/components/language-switcher";
import { SITE_URL } from "@/lib/site";
import { shareMetadata } from "@/lib/share";
import "../globals.css";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

// The browser frame on a phone takes the page's paper colour.
export const viewport: Viewport = { themeColor: "#f8f7f4" };

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslations();
  const path = (await headers()).get("x-site-path") ?? `/${locale}`;
  const automatic = !isLocale(await getSiteLanguage());
  return {
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: automatic ? localizedPath(path, "en") : path,
      languages: {
        nb: localizedPath(path, "nb"),
        en: localizedPath(path, "en"),
        "x-default": localizedPath(path, "nb"),
      },
    },
    robots: automatic ? { index: false, follow: true } : undefined,
    title: {
      default: t("St. Barbara menighet – Den katolske kirke i Kongsberg"),
      template: t("%s – St. Barbara menighet"),
    },
    description: t(
      "St. Barbara katolske menighet i Kongsberg. Messetider for Kongsberg, Notodden, Rjukan og Mo, katekese, sakramenter og menighetsliv.",
    ),
    ...shareMetadata(locale),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (routeLanguage(lang) !== lang) notFound();
  const locale = contentLocale(lang);
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${garamond.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LocaleProvider locale={locale} language={lang}>
          <AutomaticTranslation />
          <NavigationHistory />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SanityLive includeDrafts={false} />
        </LocaleProvider>
      </body>
    </html>
  );
}
