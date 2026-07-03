// Winnipeg Jets player contracts — HAND-CURATED, community-maintained.
//
// Contract/salary data is NOT in the NHL public API. These values are compiled from public
// reporting and may be out of date or wrong — they are NOT official. Verify against a source
// like PuckPedia / the NHLPA before relying on them. `capHit` is the average annual value (USD).
//
// To maintain: edit an entry below (keyed by NHL playerId). Set verified:true once you've
// confirmed a row. Players with `capHit: null` still need values filled in.
//
// `expiry` = the offseason year the deal ends; e.g. 2031 means the last season is 2030-31.
// `status` = the player's free-agent status when the deal expires (UFA / RFA).

export type ExpiryStatus = "UFA" | "RFA";
export type Clause = "NMC" | "NTC" | "M-NTC";

export type Contract = {
  capHit: number | null; // average annual value (USD)
  termYears: number | null; // total length of the deal
  expiry: number | null; // offseason year the deal ends (2031 = through 2030-31)
  status: ExpiryStatus | null;
  clause?: Clause;
  verified?: boolean; // true once a human has confirmed this row
  note?: string;
};

export const CONTRACTS_LAST_UPDATED = "2026-06 (pre-fill — needs verification)";

// Keyed by NHL playerId (matches /player/[id]). Current Winnipeg Jets roster (2025-26).
export const CONTRACTS: Record<number, Contract> = {
  // ── Core (reasonably confident, still verify) ──
  8476460: { capHit: 8_500_000, termYears: 7, expiry: 2031, status: "UFA", clause: "NMC" }, // Mark Scheifele
  8476945: { capHit: 8_500_000, termYears: 7, expiry: 2031, status: "UFA", clause: "NMC" }, // Connor Hellebuyck
  8477504: { capHit: 6_250_000, termYears: 8, expiry: 2028, status: "UFA" }, // Josh Morrissey
  8476331: { capHit: 4_900_000, termYears: 4, expiry: 2028, status: "UFA" }, // Dylan DeMelo
  8476392: { capHit: 3_250_000, termYears: 5, expiry: 2028, status: "UFA", note: "Captain" }, // Adam Lowry
  8478398: { capHit: 12_000_000, termYears: 8, expiry: 2034, status: "UFA", clause: "NMC", verified: true }, // Kyle Connor

  // ── Need verification / terms unconfirmed (fill capHit/expiry) ──
  8480014: { capHit: 7_500_000, termYears: 6, expiry: 2031, status: "UFA", verified: true }, // Gabriel Vilardi
  8482149: { capHit: null, termYears: null, expiry: null, status: null, note: "Perfetti — bridge deal; terms unconfirmed." }, // Cole Perfetti
  8480145: { capHit: null, termYears: null, expiry: null, status: null, note: "Pionk — re-signed 2025; terms unconfirmed." }, // Neal Pionk
  8480049: { capHit: null, termYears: null, expiry: null, status: null, note: "Samberg — extension 2025; terms unconfirmed." }, // Dylan Samberg
  8475799: { capHit: null, termYears: null, expiry: null, status: null }, // Nino Niederreiter
  8476480: { capHit: null, termYears: null, expiry: null, status: null }, // Vladislav Namestnikov
  8480113: { capHit: null, termYears: null, expiry: null, status: null }, // Alex Iafallo
  8473604: { capHit: null, termYears: null, expiry: null, status: null, note: "Toews — signed 2025 comeback deal; verify." }, // Jonathan Toews
  8474679: { capHit: null, termYears: null, expiry: null, status: null, note: "Nyquist — signed 2025; verify." }, // Gustav Nyquist
  8480289: { capHit: null, termYears: null, expiry: null, status: null }, // Morgan Barron
  8476871: { capHit: null, termYears: null, expiry: null, status: null }, // Tanner Pearson
  8481043: { capHit: null, termYears: null, expiry: null, status: null }, // Cole Koepke
  8474568: { capHit: null, termYears: null, expiry: null, status: null }, // Luke Schenn
  8476525: { capHit: null, termYears: null, expiry: null, status: null }, // Colin Miller
  8477938: { capHit: null, termYears: null, expiry: null, status: null }, // Haydn Fleury
  8479378: { capHit: null, termYears: null, expiry: null, status: null }, // Logan Stanley
  8481572: { capHit: null, termYears: null, expiry: null, status: null }, // Ville Heinola
  8477480: { capHit: null, termYears: null, expiry: null, status: null }, // Eric Comrie

  // ── Younger / depth / call-ups (likely ELC or two-way) ──
  8483471: { capHit: null, termYears: null, expiry: null, status: "RFA", note: "ELC — verify." }, // Brad Lambert
  8484242: { capHit: null, termYears: null, expiry: null, status: "RFA", note: "ELC — verify." }, // Brayden Yager
  8482787: { capHit: null, termYears: null, expiry: null, status: "RFA", note: "ELC — verify." }, // Nikita Chibrikov
  8482765: { capHit: null, termYears: null, expiry: null, status: "RFA", note: "ELC — verify." }, // Isak Rosen
  8483510: { capHit: null, termYears: null, expiry: null, status: "RFA", note: "ELC — verify." }, // Elias Salomonsson
  8483526: { capHit: null, termYears: null, expiry: null, status: "RFA" }, // Danil Zhilkin
  8484135: { capHit: null, termYears: null, expiry: null, status: "RFA" }, // Parker Ford
  8482192: { capHit: null, termYears: null, expiry: null, status: "RFA" }, // Isaak Phillips
  8480196: { capHit: null, termYears: null, expiry: null, status: "RFA" }, // Jacob Bryson
  8482652: { capHit: null, termYears: null, expiry: null, status: "RFA" }, // Walker Duehr
  8483114: { capHit: null, termYears: null, expiry: null, status: "RFA", note: "ELC — verify." }, // Thomas Milic
};
