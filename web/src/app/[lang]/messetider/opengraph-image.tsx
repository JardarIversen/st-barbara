import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { contentLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/translate";
import {
  LANGUAGE_LABELS,
  addDays,
  buildCalendarItems,
  calendarPlaceLabel,
  calendarTitle,
  formatCalendarTime,
  toCalendarListItems,
  todayInOslo,
} from "@/lib/calendar";
import { getCalendarData } from "@/sanity/data";

// The link preview for the Mass times shows the next Masses themselves, so the times can be
// read where the link is shared. It is drawn when a preview is asked for, never at build time.
export const alt = "Messetider i St. Barbara menighet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Six rows reach from a weekday to the Sunday Mass.
const ROWS = 6;
const PAPER = "#f8f7f4";
const INK = "#1b1a18";
const MUTED = "#5c5953";
const RULE = "#dad8d1";
const RED = "#8f1d24";
const TOWER =
  "M3 2h4v2.5h3V2h4v2.5h3V2h4v7h-2v21H5V9H3zM10.7 17.5h2.6v-4.2a1.3 1.3 0 0 0-2.6 0zM7.2 25.5h2.6v-4.2a1.3 1.3 0 0 0-2.6 0zM14.2 25.5h2.6v-4.2a1.3 1.3 0 0 0-2.6 0z";

const font = (file: string) =>
  readFile(join(process.cwd(), "assets/fonts", file));

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = contentLocale((await params).lang);
  const t = getTranslator(locale);
  const now = new Date();
  const today = todayInOslo(now);
  const until = addDays(today, 28);
  const masses = toCalendarListItems(
    buildCalendarItems(await getCalendarData(today, until), today, until)
      .filter(
        (item) =>
          item.eventType === "mass" &&
          item.status === "scheduled" &&
          new Date(item.startsAt) >= now,
      )
      .slice(0, ROWS),
  );
  const day = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const [garamond, sans, sansBold] = await Promise.all([
    font("EBGaramond-SemiBold.ttf"),
    font("SourceSans3-Regular.ttf"),
    font("SourceSans3-SemiBold.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: PAPER,
          color: INK,
          fontFamily: "Source Sans 3",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 380,
            padding: "0 48px",
            background: RED,
            color: PAPER,
          }}
        >
          <svg width="48" height="64" viewBox="0 0 24 32">
            <path d={TOWER} fill={PAPER} fillRule="evenodd" />
          </svg>
          <div
            style={{
              marginTop: 30,
              fontFamily: "EB Garamond",
              fontSize: 62,
              lineHeight: 1.05,
            }}
          >
            {t("Messetider")}
          </div>
          <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.3 }}>
            {t("St. Barbara menighet")}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 8,
              fontSize: 21,
              lineHeight: 1.35,
              opacity: 0.8,
            }}
          >
            <div>Kongsberg · Notodden</div>
            <div>Rjukan · Mo</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "0 56px",
          }}
        >
          {masses.length === 0 && (
            <div style={{ fontSize: 34, color: MUTED }}>
              {t("Nye messetider kommer snart.")}
            </div>
          )}
          {masses.map((mass, index) => {
            const label = day.format(new Date(mass.startsAt));
            const place = calendarPlaceLabel(mass.place);
            const language =
              mass.language && (mass.language !== "nb" || locale === "en")
                ? t(LANGUAGE_LABELS[mass.language] ?? "Annet språk")
                : "";
            return (
              <div
                key={mass.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 86,
                  borderTop: index ? `2px solid ${RULE}` : "none",
                }}
              >
                <div
                  style={{
                    width: 230,
                    fontSize: 30,
                    fontWeight: 600,
                  }}
                >
                  {label.charAt(0).toLocaleUpperCase(locale) + label.slice(1)}
                </div>
                <div
                  style={{
                    width: 150,
                    fontFamily: "EB Garamond",
                    fontSize: 48,
                    color: RED,
                  }}
                >
                  {formatCalendarTime(mass.startsAt, locale)}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {calendarTitle(mass)}
                  </div>
                  <div style={{ fontSize: 24, color: MUTED }}>
                    {[place, language].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            );
          })}
          {/* A shared preview is kept for weeks; the line says where the times are current. */}
          <div
            style={{
              display: "flex",
              marginTop: 14,
              paddingTop: 14,
              borderTop: `2px solid ${RULE}`,
              fontSize: 23,
              color: MUTED,
            }}
          >
            {t("Se oppdaterte tider på")}
            <span style={{ marginLeft: 7, fontWeight: 600, color: RED }}>
              kongsberg.katolsk.no
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "EB Garamond", data: garamond, weight: 600, style: "normal" },
        { name: "Source Sans 3", data: sans, weight: 400, style: "normal" },
        { name: "Source Sans 3", data: sansBold, weight: 600, style: "normal" },
      ],
    },
  );
}
