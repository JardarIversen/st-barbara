"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ChevronDownIcon } from "lucide-react";
import Link from "@/i18n/link";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PRAYERS,
  defaultPrayer,
  type EucharisticPrayer,
  type LiturgyLanguage,
  type MassMode,
  type Season,
} from "@/lib/liturgy-options";

type LiturgyState = {
  mode: MassMode;
  prayer: EucharisticPrayer;
  explain: boolean;
};

type LiturgyContextValue = LiturgyState & {
  setMode: (mode: MassMode) => void;
  setPrayer: (prayer: EucharisticPrayer) => void;
  setExplain: (explain: boolean) => void;
  season: Season;
  language: LiturgyLanguage;
  /** What the page chooses by itself. */
  defaults: { mode: MassMode; prayer: EucharisticPrayer };
};

const LiturgyContext = createContext<LiturgyContextValue | null>(null);

function useLiturgy() {
  const value = useContext(LiturgyContext);
  if (!value) throw new Error("Used outside <LiturgyView>");
  return value;
}

/**
 * The reader's choices as a query string, so the page can be saved or shared as it is. What the
 * page chooses by itself is left out, so the plain address keeps following the day.
 */
function choiceQuery(
  state: LiturgyState,
  defaultMode: MassMode,
  base: URLSearchParams,
) {
  const query = new URLSearchParams(base);
  for (const key of ["modus", "eb", "forklaringer"]) query.delete(key);
  if (state.mode !== defaultMode) query.set("modus", state.mode);
  if (state.prayer !== defaultPrayer(state.mode)) query.set("eb", state.prayer);
  if (state.explain) query.set("forklaringer", "1");
  return query;
}

/**
 * Holds the reader's choices: Sunday or weekday Mass, which Eucharistic Prayer, and whether the
 * explanations are shown. The text itself is rendered once on the server; CSS shows the parts that
 * apply, using the data attributes on this wrapper.
 */
export function LiturgyView({
  initial,
  defaults,
  season,
  language,
  children,
}: {
  initial: LiturgyState;
  defaults: { mode: MassMode; prayer: EucharisticPrayer };
  season: Season;
  language: LiturgyLanguage;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial);
  const [prayerChosen, setPrayerChosen] = useState(
    initial.prayer !== defaultPrayer(initial.mode),
  );

  // Keep the address in step with the choices, without reloading the page.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.search = choiceQuery(state, defaults.mode, url.searchParams).toString();
    if (url.href !== window.location.href)
      window.history.replaceState(window.history.state, "", url);
  }, [state, defaults.mode]);

  const value: LiturgyContextValue = {
    ...state,
    season,
    language,
    defaults,
    setMode: (mode) =>
      setState((value) => ({
        ...value,
        mode,
        prayer:
          prayerChosen || !PRAYERS[language].includes(defaultPrayer(mode))
            ? value.prayer
            : defaultPrayer(mode),
      })),
    setPrayer: (prayer) => {
      setPrayerChosen(true);
      setState((value) => ({ ...value, prayer }));
    },
    setExplain: (explain) => setState((value) => ({ ...value, explain })),
  };

  return (
    <LiturgyContext value={value}>
      <div
        className="liturgi-visning"
        data-modus={state.mode}
        data-eb={state.prayer}
        data-forklaringer={state.explain ? "pa" : "av"}
      >
        {children}
      </div>
    </LiturgyContext>
  );
}

/** Sunday or weekday Mass (one of two), and the explanations for beginners (on or off). */
export function MassSettings({ automatic }: { automatic?: string }) {
  const { t } = useTranslations();
  const { mode, setMode, explain, setExplain, defaults } = useLiturgy();
  return (
    <div className="mt-7 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div
          role="radiogroup"
          aria-label={t("Hva slags messe")}
          className="inline-flex gap-0.5 rounded-sm border border-border bg-background p-0.5"
        >
          {(
            [
              ["hoymesse", t("Høymesse")],
              ["hverdag", t("Hverdagsmesse")],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={mode === value ? "default" : "ghost"}
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
          <Switch checked={explain} onCheckedChange={(on) => setExplain(on)} />
          {t("Vis forklaringer")}
        </label>
      </div>
      {automatic && mode === defaults.mode && (
        <p className="text-sm text-muted-foreground">{automatic}</p>
      )}
    </div>
  );
}

/** Switches the liturgy between Norwegian and English, keeping the reader's choices. */
export function LanguageToggle({ path }: { path: string }) {
  const { t } = useTranslations();
  const { language, mode, prayer, explain, defaults } = useLiturgy();
  const names: Record<LiturgyLanguage, string> = { nb: "Norsk", en: "English" };
  const href = (target: LiturgyLanguage) => {
    const query = choiceQuery({ mode, prayer, explain }, defaults.mode, new URLSearchParams());
    query.set("liturgi", target);
    if (!PRAYERS[target].includes(prayer)) query.delete("eb");
    return `${path}?${query}`;
  };
  return (
    <div
      role="group"
      aria-label={t("Språk i messens tekst")}
      translate="no"
      className="notranslate flex shrink-0 gap-1 text-sm"
    >
      {(["nb", "en"] as const).map((value) =>
        value === language ? (
          <span
            key={value}
            lang={value}
            aria-current="true"
            className="rounded-sm bg-primary px-2 py-1 font-medium text-primary-foreground"
          >
            {names[value]}
          </span>
        ) : (
          <Link
            key={value}
            href={href(value)}
            lang={value}
            className="focus-ring rounded-sm px-2 py-1 font-medium text-primary hover:underline"
          >
            {names[value]}
          </Link>
        ),
      )}
    </div>
  );
}

/** The priest chooses the Eucharistic Prayer; its first words tell the reader which one. */
export function PrayerSelect({
  options,
}: {
  options: Array<{ value: EucharisticPrayer; name: string; opening: string }>;
}) {
  const { t } = useTranslations();
  const { prayer, setPrayer } = useLiturgy();
  return (
    <div className="eb-valg">
      <Select
        items={options.map(({ value, name }) => ({ value, label: name }))}
        modal={false}
        value={prayer}
        onValueChange={(value) => {
          if (value) setPrayer(value as EucharisticPrayer);
        }}
      >
        <SelectTrigger aria-label={t("Velg eukaristisk bønn")} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ value, name, opening }) => (
            <SelectItem key={value} value={value} className="[&>span]:whitespace-normal">
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{opening}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="eb-hint">
        {t("Presten velger bønnen. Du kjenner den igjen på de første ordene etter «Hellig, hellig, hellig».")}
      </p>
    </div>
  );
}

/**
 * A part that only belongs to some Masses. When it doesn't apply today it shrinks to one line
 * that opens with a tap, so a wrong guess never hides text someone needs.
 */
export function OptionalPart({
  part,
  title,
  children,
}: {
  part: string;
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslations();
  const { mode, season } = useLiturgy();
  const applies =
    part === "gloria"
      ? mode === "hoymesse" && !season
      : part === "creed"
        ? mode === "hoymesse"
        : mode === "hverdag";
  const reason =
    part === "offertory-prayers"
      ? t("når det ikke synges")
      : mode === "hverdag"
        ? t("vanligvis ikke på hverdager")
        : season === "advent"
          ? t("ikke i advent")
          : t("ikke i fastetiden");
  // An opening by hand lasts until the kind of Mass changes.
  const [opened, setOpened] = useState<{ applies: boolean } | null>(null);
  const open = applies || opened?.applies === applies;

  if (open) return <div className={`del del-${part}`}>{children}</div>;
  return (
    <button
      type="button"
      className="del-lukket focus-ring"
      aria-expanded={false}
      onClick={() => setOpened({ applies })}
    >
      <span className="del-tittel">{title}</span>
      <span className="del-grunn">{reason}</span>
      <ChevronDownIcon aria-hidden="true" className="ml-auto size-4 shrink-0" />
    </button>
  );
}
