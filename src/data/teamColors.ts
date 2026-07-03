// Team color palettes for the text-tricode chips (TeamLogo / TeamCode). We render team
// abbreviations instead of NHL/club logo artwork to avoid reproducing trademarked logos;
// the chip carries the team's colors so it still reads at a glance.
//
// Each entry is [background, text, border?] — 2 colors for most teams, 3 where the club has
// a clear third. Text is chosen to contrast the background. These are approximate brand
// colors compiled from public sources, not official spec values — tweak freely.
//
// Keyed by NHL tricode (uppercase). Includes a few historical codes (ATL/ARI/PHX) that
// appear in older standings. The Winnipeg Jets (WPG) use the ManitobaMark, not a chip, but
// their colors are kept here for completeness.

export const TEAM_COLORS: Record<string, [string, string] | [string, string, string]> = {
  ANA: ["#FC4C02", "#000000", "#B5985A"],
  BOS: ["#FFB81C", "#000000"],
  BUF: ["#003087", "#FFB81C"],
  CGY: ["#D2001C", "#FAAF19", "#000000"],
  CAR: ["#CC0000", "#FFFFFF", "#000000"],
  CHI: ["#CF0A2C", "#000000"],
  COL: ["#6F263D", "#A4A9AD", "#236192"],
  CBJ: ["#002654", "#FFFFFF", "#CE1126"],
  DAL: ["#006847", "#8F8F8C", "#000000"],
  DET: ["#CE1126", "#FFFFFF"],
  EDM: ["#FF4C00", "#041E42"],
  FLA: ["#041E42", "#B9975B", "#C8102E"],
  LAK: ["#000000", "#A2AAAD"],
  MIN: ["#154734", "#EAAA00", "#A6192E"],
  MTL: ["#AF1E2D", "#FFFFFF", "#192168"],
  NSH: ["#FFB81C", "#041E42"],
  NJD: ["#000000", "#CE1126"],
  NYI: ["#00539B", "#F47D30"],
  NYR: ["#0038A8", "#FFFFFF", "#CE1126"],
  OTT: ["#000000", "#C8102E", "#B9975B"],
  PHI: ["#F74902", "#000000"],
  PIT: ["#000000", "#FCB514"],
  SJS: ["#006D75", "#FFFFFF", "#E57200"],
  SEA: ["#001628", "#99D9D9", "#E9072B"],
  STL: ["#002F87", "#FCB514", "#041E42"],
  TBL: ["#002868", "#FFFFFF"],
  TOR: ["#00205B", "#FFFFFF"],
  UTA: ["#6CACE4", "#010101"],
  VAN: ["#00843D", "#00205B", "#99999A"],
  VGK: ["#B4975A", "#333F42", "#C8102E"],
  WSH: ["#C8102E", "#FFFFFF", "#041E42"],
  WPG: ["#041E42", "#7BAFD4", "#AC162C"],

  // Historical (older standings)
  ATL: ["#041E42", "#5C88DA", "#B5985A"],
  ARI: ["#8C2633", "#E2D6B5", "#111111"],
  PHX: ["#8C2633", "#E2D6B5", "#111111"],
};
