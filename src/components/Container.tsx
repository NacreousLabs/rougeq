// Standard page container. Three intentional width tiers so the layout doesn't
// "shift" between sibling pages:
//   lg  → data/listing pages (standings, roster, analytics, records, home)
//   md  → detail pages (player, game, season, compare, draft, playoffs, seasons)
//   sm  → reading/forms (about, articles, search, live)

const SIZES = {
  lg: "max-w-5xl",
  md: "max-w-4xl",
  sm: "max-w-3xl",
} as const;

export function Container({
  size = "lg",
  className = "",
  children,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full flex-1 px-6 py-10 ${SIZES[size]} ${className}`}>{children}</div>
  );
}
