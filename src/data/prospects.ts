// Winnipeg Jets prospect pool — HAND-CURATED, community-maintained.
//
// "Where are they now" tracking for drafted/signed prospects: current team + league, no analytics
// (the NHL public API has no AHL/junior/European data, and we deliberately don't pull a third-party
// feed). Maintain this like contracts.ts / ufas.ts.
//
// ⚠️ THE ENTRIES BELOW ARE A BEST-EFFORT EXAMPLE SEED AND ARE LIKELY OUT OF DATE — prospect teams
// change every season. Verify and update against a public source (e.g. Elite Prospects, the team
// site) before relying on it. Once a prospect graduates to the NHL full-time, remove them here.

export const PROSPECTS_LAST_UPDATED = "2026-06 (example seed — needs verification)";

export type Prospect = {
  name: string;
  pos: "C" | "L" | "R" | "D" | "G";
  draftYear: number;
  round: number; // 0 = undrafted/free-agent signing
  overall?: number;
  team: string; // current club
  league: string; // AHL | OHL | WHL | QMJHL | NCAA | SHL | Liiga | KHL | ...
  note?: string;
  verified?: boolean;
};

export const PROSPECTS: Prospect[] = [
  { name: "Brayden Yager", pos: "C", draftYear: 2024, round: 1, overall: 14, team: "Manitoba Moose", league: "AHL" },
  { name: "Brad Lambert", pos: "C", draftYear: 2022, round: 1, overall: 30, team: "Manitoba Moose", league: "AHL" },
  { name: "Nikita Chibrikov", pos: "R", draftYear: 2021, round: 2, overall: 50, team: "Manitoba Moose", league: "AHL" },
  { name: "Elias Salomonsson", pos: "D", draftYear: 2022, round: 2, overall: 55, team: "Manitoba Moose", league: "AHL" },
  { name: "Colby Barlow", pos: "L", draftYear: 2023, round: 1, overall: 18, team: "Manitoba Moose", league: "AHL", note: "verify (AHL vs OHL)" },
  { name: "Kevin He", pos: "L", draftYear: 2024, round: 4, overall: 109, team: "Niagara IceDogs", league: "OHL" },
  { name: "Jacob Julien", pos: "C", draftYear: 2023, round: 5, overall: 133, team: "London Knights", league: "OHL", note: "verify" },
  { name: "Alfons Freij", pos: "D", draftYear: 2024, round: 2, overall: 46, team: "Växjö Lakers", league: "SHL", note: "verify" },
  { name: "Markus Loponen", pos: "C", draftYear: 2023, round: 6, overall: 165, team: "Kärpät", league: "Liiga", note: "verify" },
  { name: "Dmitri Kuzmin", pos: "D", draftYear: 2021, round: 3, overall: 82, team: "—", league: "KHL", note: "verify" },
  { name: "Fabian Wagner", pos: "C", draftYear: 2023, round: 4, overall: 101, team: "Linköping", league: "SHL", note: "verify" },
];
