"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
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
  /** What the page would choose by itself, so links only carry real choices. */
  defaults: { mode: MassMode; prayer: EucharisticPrayer };
};

const LiturgyContext = createContext<LiturgyContextValue | null>(null);

function useLiturgy() {
  const value = useContext(LiturgyContext);
  if (!value) throw new Error("Used outside <LiturgyView>");
  return value;
}

const EXPLAIN_KEY = "messen-forklaringer";
const noSubscription = () => () => {};
function storedExplain() {
  try {
    return window.localStorage.getItem(EXPLAIN_KEY) === "1";
  } catch {
    return false;
  }
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
  const [state, setState] = useState({ mode: initial.mode, prayer: initial.prayer });
  const [prayerChosen, setPrayerChosen] = useState(
    initial.prayer !== defaultPrayer(initial.mode),
  );
  // Someone who wants the explanations keeps them on the next time they scan the code.
  const stored = useSyncExternalStore(noSubscription, storedExplain, () => false);
  const [explainChoice, setExplainChoice] = useState<boolean | null>(
    initial.explain ? true : null,
  );
  const explain = explainChoice ?? stored;

  const value: LiturgyContextValue = {
    ...state,
    explain,
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
    setExplain: (on) => {
      try {
        if (on) window.localStorage.setItem(EXPLAIN_KEY, "1");
        else window.localStorage.removeItem(EXPLAIN_KEY);
      } catch {}
      setExplainChoice(on);
    },
  };

  return (
    <LiturgyContext value={value}>
      <div
        className="liturgi-visning"
        data-modus={state.mode}
        data-eb={state.prayer}
        data-forklaringer={explain ? "pa" : "av"}
      >
        {children}
      </div>
    </LiturgyContext>
  );
}

/** Sunday or weekday Mass, and the explanations for beginners. */
export function MassSettings({ automatic }: { automatic?: string }) {
  const { t } = useTranslations();
  const { mode, setMode, explain, setExplain, defaults } = useLiturgy();
  return (
    <div className="mt-7 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t("Hva slags messe")} className="flex gap-1">
          {(
            [
              ["hoymesse", t("Høymesse")],
              ["hverdag", t("Hverdagsmesse")],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={mode === value ? "default" : "outline"}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant={explain ? "default" : "outline"}
          aria-pressed={explain}
          onClick={() => setExplain(!explain)}
        >
          {t("Forklaringer")}
        </Button>
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
  const { language, mode, prayer, defaults } = useLiturgy();
  const names: Record<LiturgyLanguage, string> = { nb: "Norsk", en: "English" };
  const href = (target: LiturgyLanguage) => {
    const query = new URLSearchParams({ liturgi: target });
    if (mode !== defaults.mode) query.set("modus", mode);
    if (prayer !== defaults.prayer && PRAYERS[target].includes(prayer))
      query.set("eb", prayer);
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
