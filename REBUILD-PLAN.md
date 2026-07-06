# RougeQ — Football (CFL) Rebuild Plan

RougeQ was scaffolded from **PuckQ**, an NHL/Winnipeg Jets hockey analytics app. The
brand, navigation, theme, and config seam have been rebranded to the **CFL / Winnipeg
Blue Bombers** (see "What's already done"). What remains is the hard part: the app's
**data model and analytics engine are still hockey** and must be rebuilt for football.

This document is the plan for that rebuild. Nothing here is committed to yet — it exists
so the data-source and scope decisions can be made deliberately.

---

## 1. Current state

**Done (coherently CFL now):**
- Brand seam — [`src/lib/team.ts`](src/lib/team.ts) (`BRAND`, `TEAM`, `TEAM_NAME`, `LEAGUE`).
- Nav / footer / theme — [`SiteNav`](src/components/SiteNav.tsx) (empty `NAV`, awaiting CFL pages),
  [`SiteFooter`](src/components/SiteFooter.tsx), [`globals.css`](src/app/globals.css) Bombers tokens.
- Logo / marks — [`Logo`](src/components/Logo.tsx), [`ManitobaMark`](src/components/ManitobaMark.tsx),
  OG / apple / favicon.
- Copy — [`about`](src/app/about/page.tsx), [`error`](src/app/error.tsx), metadata.
- Team colors — [`teamColors.ts`](src/data/teamColors.ts) now lists the 9 CFL clubs.
- Season model — [`seasons.ts`](src/lib/seasons.ts) now single-year CFL seasons.
- DB filename, package name, LICENSE, `.env.example`.

**Dormant hockey engine (to be replaced — the subject of this plan):**
- **Schema** — [`src/db/schema.ts`](src/db/schema.ts): ~30 tables, all hockey (shots, faceoffs,
  shifts, xG, on-ice/WOWY/lines, goalies, save %, draft, NHL cap contracts).
- **Analytics components** — [`charts.tsx`](src/components/charts.tsx),
  [`AnalyticsTabs`](src/components/AnalyticsTabs.tsx), `CompareControls`, `CompareTale`,
  `CompareModeTabs`, `GameTypeSelect` — shaped around hockey types.
- **Seed data** — [`contracts.ts`](src/data/contracts.ts), [`prospects.ts`](src/data/prospects.ts):
  Jets rosters / NHL contracts.
- **Data pipeline** — the `ingest`/`xg`/`onice`/`league`/`impact`/`summaries` scripts referenced
  in [`package.json`](package.json) **do not exist in this repo** (only `register-refresh-task.ps1`
  does). So there is no working ingest today; the DB is empty and the homepage is "coming soon."

**Reusable as-is (sport-agnostic):** `SortableTable`, `SeasonSelect`, `Container`, `PageHeader`,
`SectionHeading`, `InfoTip`, `NavSearch`, `NavDropdown`, `ThemeToggle`, `Avatar`, `Markdown`,
the admin/auth stack, and the `posts`/`recaps`/`adminUsers` tables (CMS, not sport-specific).

**Known dangling reference:** the footer links to `/methodology`, which has no route yet — wire
it up (or drop the link) during Phase 4.

---

## 2. The core challenge

Hockey and football share almost no statistical structure. A football rebuild is a **new data
model + new ingest + new analytics + new stat pages**, not a rename. The one genuine blocker is
the **data source** — there is no free, official, structured CFL feed equivalent to the NHL's
public web API. That decision gates everything else, so it comes first (Phase 0).

CFL-specific wrinkles the model should respect: **3 downs** (not 4), the **rouge / single point**,
a **12-player**, wider/longer field, no fair catch, and the **Grey Cup** as the championship.
(`resolveGameType` already treats `3` = playoffs incl. Grey Cup, `2` = regular season.)

---

## 3. Data-source options (decide first)

| Option | What you get | Cost / effort | Risk |
|---|---|---|---|
| **A. ESPN hidden API** (`site.api.espn.com/apis/site/v2/sports/football/cfl/…`) | Scoreboard, schedule, standings, teams, rosters, box scores as JSON | Free, structured, low effort | Unofficial/undocumented, can change without notice; limited advanced/PBP depth |
| **B. CFL.ca scraping** | Official numbers, deeper game logs & splits | Free but HTML scraping (fragile), medium effort | ToS gray area; markup churn breaks parsers |
| **C. Commercial feed** (Genius Sports / Sportradar) | Complete incl. play-by-play & advanced | Paid + licensing | Cost; contract |
| **D. Manual / CSV seed** | Whatever you enter (Bombers-first MVP) | Trivial to prototype | Not sustainable; no auto-refresh |

**Recommendation:** start with **A (ESPN hidden API)** as the structured backbone, fall back to
**B (CFL.ca)** for anything A doesn't expose, and **defer play-by-play / advanced metrics** until a
source is confirmed. Mirror the original app's "**Bombers-first**" approach: ingest the whole league
for standings/schedule context, compute deep metrics for the Blue Bombers only.

> Action for Phase 0: a half-day spike hitting Option A for one recent Bombers game + the current
> standings, to confirm shape and coverage before committing to the schema.

---

## 4. Target football schema (Phase 1 sketch)

Replaces `src/db/schema.ts`. Keep the CMS tables (`posts`, `recaps`, `adminUsers`) unchanged.

- **`teams`** — tricode, fullName, division (West/East), colors/logo refs.
- **`players`** — id, name, position (QB/RB/WR/OL/DL/LB/DB/K/P…), jersey, height/weight, teamTricode,
  status (active/IR/practice roster).
- **`games`** — id, season (year), gameType (2 regular / 3 playoffs), date, home/away tricode,
  scores, venue, attendance, week, tv, links to CFL.ca recaps.
- **`standings`** — per team/season: GP, W, L, T, points, PF, PA, net, div rank, home/away, streak, last-N.
- **Team stats** (season + game): points, total net yards, pass yds, rush yds, first downs,
  3rd/2nd-down conversion %, red-zone %, turnovers (INT/fumbles lost), takeaways, sacks for/against,
  penalties/yds, time of possession, net punting, return yds. (CFL: track the **rouge/singles**.)
- **Player stats by group** (season + game log):
  - **Passing** — att, comp, yds, TD, INT, sacks, rating/efficiency, QB rushing.
  - **Rushing** — carries, yds, avg, TD, fumbles, 20+/long.
  - **Receiving** — targets, rec, yds, YAC, TD, drops, long.
  - **Defense** — tackles (solo/assist), sacks, TFL, INT, PD, FF/FR, defensive TD.
  - **Special teams** — FGM/FGA by distance, long, XP, punts/avg/net/in-20, kick/punt returns, **singles**.
- **Play-by-play** (only if a source lands) — down, distance, yardline, play type, result, EPA-style
  value. Powers the football analogues of the old advanced tab.

Advanced/derived metrics to compute later (Phase 3), football analogues of what the hockey app did:
per-game & per-play efficiency rates, success rate, EPA/play (needs PBP), pass/rush splits by down &
field zone, red-zone & short-yardage efficiency, percentile ranks vs the league, and player
game-log trends.

---

## 5. Phased plan

- **Phase 0 — Data source (decide + spike).** Pick from §3; validate coverage on one Bombers game
  + current standings. *Output: a `docs/data-source.md` note + a throwaway fetch script.*
- **Phase 1 — Schema.** Replace `src/db/schema.ts` per §4; `npm run db:push`. Reseed `contracts`/
  `prospects` with Bombers players (or drop until later).
- **Phase 2 — Ingest.** Build the `scripts/ingest.ts` family (teams, schedule, standings, box scores,
  rosters) against the chosen source; wire the existing daily-refresh cron + `/api/refresh`.
- **Phase 3 — Derived metrics.** Compute team/player efficiency + percentiles; PBP-based metrics only
  if a source landed. Replace `player_summaries` generation.
- **Phase 4 — Pages & components.** Build the CFL routes (home dashboard, standings, schedule/scores,
  team, roster, player, game recap, numbers/blog) and refit `charts.tsx` / `AnalyticsTabs` /
  `CompareTale` to football stats. Populate `NAV` in `SiteNav`. Wire `/methodology`.
- **Phase 5 — Content & polish.** Methodology page, recaps/numbers via the existing admin CMS, SEO.

**Suggested first milestone (thin vertical slice):** Phase 0 → minimal Phase 1 (teams/games/standings
only) → Phase 2 ingest for standings + schedule → one real page (a live **standings** table using the
already-built `SortableTable`). That turns "coming soon" into a real, data-backed page and de-risks the
data source before investing in the full stat model.
