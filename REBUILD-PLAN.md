# RougeQ — Football (CFL) Rebuild Plan

RougeQ was scaffolded from **PuckQ**, an NHL/Winnipeg Jets hockey analytics app, then
migrated to the **CFL / Winnipeg Blue Bombers**. The migration and a working analytics
site are **substantially built** on this branch — see the status below. This doc now serves
as the record of what was done and what remains; the deep data-model reference lives in
[`ANALYTICS-SPEC.md`](ANALYTICS-SPEC.md).

---

## 1. Status

### ✅ Built (working, on free CFL.ca JSON — no key, no browser, no paid feed)
- **Rebrand** — brand seam, nav/footer/theme, logos, copy, team colors, single-year CFL
  seasons, package/DB/LICENSE. Fully CFL/Blue Bombers.
- **Schema** — [`src/db/schema.ts`](src/db/schema.ts) replaced with football tables:
  `teams`, `games`, `team_ratings`, `players`, `player_season`, `projections` (+ CMS tables kept).
- **Data pipeline** (`npm run refresh`):
  - [`scripts/ingest.ts`](scripts/ingest.ts) — teams + schedule/scores from `rounds.json`/`squads.json`
  - [`scripts/players.ts`](scripts/players.ts) — passing/rushing/receiving season stats from `get_league_stats`
  - [`scripts/ratings.ts`](scripts/ratings.ts) — SRS/OSRS/DSRS, Elo, Pythagorean, luck, SoS
  - [`scripts/projections.ts`](scripts/projections.ts) — Monte-Carlo playoff/division odds
- **Pages** — homepage dashboard, `/power`, `/standings` (+projections), `/stats` (team
  offense/scoring), `/players` (leaders + percentiles), `/team/[tricode]`, `/player/[id]`,
  `/search`. All server-rendered, cross-linked.
- **Analytics method** — documented + implemented per [`ANALYTICS-SPEC.md`](ANALYTICS-SPEC.md) §2–3.

### ⏳ Remaining
- **Deploy + automate** — ship it (Railway scaffold exists) and wire the daily refresh cron
  (`/api/refresh` + GitHub Actions) so data self-updates.
- **Editorial / CMS** — the `/admin` scaffold + `recaps`/`posts` tables exist but the editor UIs
  were removed and the area is gated by **GitHub OAuth** (`AUTH_SECRET`, `AUTH_GITHUB_ID/SECRET`,
  `ADMIN_GITHUB_LOGIN`). Needs those credentials configured before the recap / "Numbers" tools can
  be built and verified.
- **Detail depth** — game pages, team/player game logs (blocked: only season aggregates are free).
- **Historical seasons** — `rounds.json` is current-season only; player stats can go back via
  `get_league_stats?season=`, but historical *games* would need another source (e.g. CFLdb.ca).
- **Play-by-play / EPA** — paid (Genius) or live-capture forward-only. See ANALYTICS-SPEC.md §5.

**Reusable, still in place (sport-agnostic):** `SortableTable`, `Container`, `PageHeader`,
`InfoTip`, `NavSearch`, `ThemeToggle`, `Avatar`, `Markdown`, the admin/auth stack, and the
`posts`/`recaps`/`adminUsers` CMS tables.

---

## Appendix — original rebuild plan (historical)

The sections below are the pre-build plan, kept for context. The data-source investigation they
describe was carried out and resolved: **ESPN's CFL feed is dead after 2022 and the official
`api.cfl.ca` is gone**; the working source is CFL.ca's undocumented JSON (see ANALYTICS-SPEC.md
Appendix A). Where these sections and the Status above disagree, the Status is current.

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
