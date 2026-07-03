// RougeQ's original "Winnipeg" mark — a simplified silhouette of Manitoba with a hockey
// puck over Winnipeg (south-central). It stands in for the Winnipeg Jets logo everywhere
// so we don't reproduce True North / NHL trademarked artwork. A generic province outline
// plus colors only, so it's fully ours.
//
// Colors are the Winnipeg Jets palette (navy / blue / silver). The viewBox is taller than
// wide (Manitoba is a tall province). Call sites size it with square classes (h-6 w-6,
// h-5 w-5, …); preserveAspectRatio "meet" keeps it centered and undistorted inside the
// square. The blue fill + navy outline + silver puck ring read on white cards, the navy
// nav/header, and dark-mode zinc-900 alike, so a single design works on every background.

const NAVY = "#041E42"; // Jets navy — outline + puck
const BLUE = "#2D68A8"; // Jets blue — province fill
const SILVER = "#A2AAAD"; // Jets silver — analytics ring

export function ManitobaMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
    >
      {/* Simplified Manitoba silhouette: the flat top (60th parallel), the straight west
          border (Saskatchewan), the stepped Hudson Bay coast across the northeast (the
          Churchill notch out to the Cape Tatnam point), then the long Ontario border
          angling back down to the flat south border (49th parallel). */}
      <path
        d="M4.8 3.5 L17.4 3.5 L17.2 6.5 L19.2 8 L18.4 10 L21.5 11 L26.5 13 L16.8 25 L16.8 36.5 L5.9 36.5 Z"
        fill={BLUE}
        stroke={NAVY}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Puck over Winnipeg (south-central) — navy disc with a silver analytics ring,
          echoing the RougeQ mark. */}
      <circle cx="12.5" cy="32.8" r="2.3" fill={NAVY} />
      <circle cx="12.5" cy="32.8" r="1.15" fill="none" stroke={SILVER} strokeWidth="0.9" opacity="0.95" />
    </svg>
  );
}
