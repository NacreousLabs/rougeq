// Team color palettes for the text-tricode chips (TeamLogo / TeamCode). We render team
// abbreviations instead of CFL/club logo artwork to avoid reproducing trademarked logos;
// the chip carries the team's colors so it still reads at a glance.
//
// Each entry is [background, text, border?] — 2 colors for most teams, 3 where the club has
// a clear third. Text is chosen to contrast the background. These are approximate brand
// colors compiled from public sources, not official spec values — tweak freely.
//
// Keyed by CFL tricode (uppercase). The Winnipeg Blue Bombers (WPG) use the ManitobaMark,
// not a chip, but their colors are kept here for completeness. (Some codes — WPG, TOR, OTT,
// MTL, CGY, EDM — collide with NHL abbreviations, but these values are the CFL clubs'.)

export const TEAM_COLORS: Record<string, [string, string] | [string, string, string]> = {
  BC: ["#F26522", "#000000", "#A6A6A6"], // BC Lions — orange / black / silver
  CGY: ["#C8102E", "#000000", "#D5A021"], // Calgary Stampeders — red / black / gold
  EDM: ["#24523B", "#F0B323"], // Edmonton Elks — green / gold
  HAM: ["#000000", "#FFB81C"], // Hamilton Tiger-Cats — black / gold
  MTL: ["#00539B", "#E31837", "#FFFFFF"], // Montreal Alouettes — blue / red / white
  OTT: ["#000000", "#C8102E"], // Ottawa Redblacks — black / red
  SSK: ["#046A38", "#FFFFFF"], // Saskatchewan Roughriders — green / white
  TOR: ["#00205B", "#6CACE4"], // Toronto Argonauts — double blue
  WPG: ["#041E42", "#FFC72C", "#AC162C"], // Winnipeg Blue Bombers — navy / gold / red
};
