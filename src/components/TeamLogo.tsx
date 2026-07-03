import { TEAM } from "@/lib/team";
import { ManitobaMark } from "./ManitobaMark";
import { TEAM_COLORS } from "@/data/teamColors";

// Single place every team "logo" is rendered. We don't show NHL/club logo artwork (it's
// trademarked); instead each team is a colored text chip of its tricode (TeamCode), in the
// team's own colors. The Winnipeg Jets (WPG) show our original ManitobaMark instead.

export type TeamLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const MARK_CLS: Record<TeamLogoSize, string> = {
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
};

const CHIP_CLS: Record<TeamLogoSize, string> = {
  xs: "px-1 py-0.5 text-[10px]",
  sm: "px-1.5 py-0.5 text-[11px]",
  md: "px-2 py-1 text-sm",
  lg: "px-2.5 py-1 text-base",
  xl: "px-3 py-1.5 text-lg",
};

export function TeamLogo({ tricode, size = "sm" }: { tricode?: string | null; size?: TeamLogoSize }) {
  if (tricode === TEAM) return <ManitobaMark className={`${MARK_CLS[size]} shrink-0`} title="Winnipeg" />;
  return <TeamCode tricode={tricode ?? ""} size={size} />;
}

function TeamCode({ tricode, size }: { tricode: string; size: TeamLogoSize }) {
  const code = tricode.toUpperCase();
  const colors = TEAM_COLORS[code] ?? ["#52525b", "#ffffff"];
  const [bg, text, border] = colors;
  return (
    <span
      title={code || undefined}
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-extrabold leading-none tracking-wide ${CHIP_CLS[size]} ${
        border ? "" : "ring-1 ring-zinc-900/10 dark:ring-white/15"
      }`}
      style={{
        backgroundColor: bg,
        color: text,
        ...(border ? { border: `1.5px solid ${border}` } : {}),
      }}
    >
      {code || "—"}
    </span>
  );
}
