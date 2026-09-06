import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { SanityLive } from "@/sanity/live";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { localizedPath } from "@/i18n/config";
import { headers } from "next/headers";
import { getTranslations } from "@/i18n/server";
import { LocaleProvider } from "@/i18n/client";
import { AutomaticTranslation } from "@/components/language-switcher";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslations();
  const path = (await headers()).get("x-site-path") ?? `/${locale}`;
  return {
    metadataBase: new URL("https://kongsberg.katolsk.no"),
    alternates: {
      canonical: path,
      languages: {
        nb: localizedPath(path, "nb"),
        en: localizedPath(path, "en"),
        "x-default": localizedPath(path, "nb"),
      },
    },
    title: {
      default: t("St. Barbara menighet – Den katolske kirke i Kongsberg"),
      template: t("%s – St. Barbara menighet"),
    },
    description: t(
      "St. Barbara katolske menighet i Kongsberg. Messetider for Kongsberg, Notodden, Rjukan og Mo, katekese, sakramenter og menighetsliv.",
    ),
    openGraph: { locale: locale === "en" ? "en_GB" : "nb_NO" },
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
  if (!isLocale(lang)) notFound();
  return (
    <html
      lang={lang}
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LocaleProvider locale={lang}>
          <AutomaticTranslation />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SanityLive includeDrafts={false} />
        </LocaleProvider>
      </body>
    </html>
  );
}
