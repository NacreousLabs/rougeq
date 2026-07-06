# RougeQ — Free-Data Analytics Spec

What advanced analytics RougeQ can build **for $0**, mapped to the verified CFL.ca data
endpoints and to a football schema. This is deliberately scoped to what the free data
actually supports — see [REBUILD-PLAN.md](REBUILD-PLAN.md) for the broader rebuild and
[the data-source findings](#appendix-a--verified-endpoints) below for how these were confirmed.

**The governing constraint:** free data granularity is **season-aggregate box scores + game
scores/linescores**. No play-by-play, no per-game player splits, no participation data. Every
metric below is derivable from that; anything needing finer data is in [§5 Out of scope](#5--explicitly-out-of-scope).

---

## 1. Data inventory (verified, free, direct JSON)

| Feed | URL | Gives |
|---|---|---|
| Standings | `cflscoreboard.cfl.ca/json/scoreboard/squads.json` | teams: `wins, loss, draw` (+ id/abbr) |
| Schedule + results | `cflscoreboard.cfl.ca/json/scoreboard/rounds.json` | every game: teams, **scores**, status, date, `cflId` |
| Change hash | `cflscoreboard.cfl.ca/json/scoreboard/checksums.json` | poll to detect updates before refetch |
| Scoreboard (linescores) | `cfl.ca/wp-content/themes/cfl.ca/inc/admin-ajax.php?action=scoreboard&lang=en&week=` | per-game **quarter linescores**, venue, gametracker URL |
| Player season stats | `…/admin-ajax.php?action=get_league_stats&stat_category=<cat>&season=<yr>` | season box-score lines per player |

`stat_category` verified: `passing, rushing, receiving, field_goals, punting` (each a positional
array — column meanings must be mapped once from the `/stats/` page headers). Team-level stats:
aggregate player rows by team, or probe additional `get_league_stats` categories (TODO).

**Key insight:** every team rating below comes from **game scores in `rounds.json`** — the single
most reliable free signal. Player analytics come from `get_league_stats`.

---

## 2. Team analytics (from game scores + schedule)

All computable from `rounds.json` results alone. These are the flagship "advanced" features.

### 2.1 Pythagorean win expectation
```
expWinPct = PF^k / (PF^k + PA^k)      k = 2.37   (football-tuned; Football Outsiders)
expWins   = expWinPct * gamesPlayed
luck      = actualWins - expWins       (over/underperformance vs scoring)
```
Inputs: sum each team's points-for (PF) / points-against (PA) from `rounds.json`.

### 2.2 SRS — Simple Rating System (opponent-adjusted margin, in points)
```
MOV_i    = (PF_i - PA_i) / gamesPlayed_i          # raw average margin
rating_i = MOV_i + (1/n_i) * Σ_over_games rating_opponent
```
Solve by iteration: initialise `rating_i = MOV_i`, recompute using current opponent ratings,
repeat ~100× (or to Δ<0.001). Optionally cap single-game margin (e.g. ±21) to limit blowout
leverage. Split into **OSRS/DSRS** by running the same solve on points-scored and points-allowed
separately. Output: rating in points above/below average; **strength of schedule = SRS − MOV**.

### 2.3 Elo ratings
```
start   = 1500 (regress 1/3 toward 1500 each new season)
E_home  = 1 / (1 + 10^((elo_away - elo_home - HFA)/400))     HFA ≈ 65 Elo (~2.6 pts)
elo'    = elo + K * mult * (S - E)                            K = 20, S = 1/0.5/0
mult    = ln(|margin| + 1) * (2.2 / (0.001*eloDiffWinner + 2.2))   # MoV multiplier (538-style)
```
Gives a live power rating that updates each game and a natural basis for win-probability and
game projections.

### 2.4 Derived team tables
- **Power ranking** = blend/borda of SRS + Elo (display both, rank by SRS).
- **Projected standings / playoff odds** = Monte-Carlo the remaining `rounds.json` schedule using
  Elo win probabilities (N=10k sims), tally division finishes + crossover/Grey Cup odds.
- **Points-by-quarter profile** from linescores (fast/slow starts, 4th-quarter margins).

---

## 3. Player analytics (from `get_league_stats`)

Season aggregates → rate stats + league-relative context. No per-game splits (see §5).

### 3.1 Rate stats (derive from the raw box-score columns)
- **Passing:** Y/A = yds/att · TD% = TD/att · INT% (given) · comp% (given) · efficiency (given).
  `NY/A`/`ANY/A` only if sack yardage is present in the feed (verify; may not be).
- **Rushing:** Y/C = yds/att · TD rate · (long, if present).
- **Receiving:** Y/R = yds/rec · catch% = rec/targets (if targets present) · Y/T · TD rate.
- **Kicking/Punting:** FG% by distance bucket (if bucketed), net punting avg, inside-20 rate.

### 3.2 Percentile ranking (the reusable "context" layer)
For each category + rate stat, rank a player against **qualified** peers league-wide:
```
qualified   = players with volume ≥ threshold (e.g. QB att ≥ 8×weeks, WR targets ≥ ...)
percentile  = (rank - 1) / (nQualified - 1) * 100      # empirical, 0–100
```
This drives the existing percentile-bar UI in [charts.tsx](src/components/charts.tsx) and the
[CompareTale](src/components/CompareTale.tsx) player-vs-player view — both reusable as-is.

### 3.3 Trends & comparisons
- Season-over-season lines per player (multi-season `get_league_stats` calls).
- Player-vs-player and player-vs-league on any rate stat (CompareTale).
- Career/rate aggregates for Bombers players (subject-filtered to `team = WPG`).

---

## 4. Proposed football schema (scoped to free data)

Replaces the hockey `src/db/schema.ts`; keep the CMS tables (`posts`, `recaps`, `adminUsers`).
Drizzle/SQLite style, matching the existing file.

```ts
teams        (tricode PK, fullName, division, colors…)
players      (id PK, name, position, teamTricode, cflUrl)
games        (id PK, cflId, season, week, gameType, date, homeTri, awayTri,
              homeScore, awayScore, status, venue, q1..q4 linescores)   // from rounds.json + scoreboard
teamGame     (gameId, tricode, isHome, pf, pa, result)  PK(gameId,tricode)  // derived per-team-per-game
teamRatings  (tricode, season, srs, osrs, dsrs, elo, pythExpWins, luck, sos, gp, wins, losses, ties)
              PK(tricode,season)                                          // computed (§2)
playerSeason (playerId, season, category, teamTricode, gp, <statCols json or typed>, …)
              PK(playerId,season,category)                                // from get_league_stats
playerRates  (playerId, season, category, metric, value, percentile)     // computed (§3)
              PK(playerId,season,category,metric)
```

Notes: `games.gameType` = 2 regular / 3 playoffs (Grey Cup), matching `resolveGameType`.
`playerSeason` can store the positional array as typed columns per category (cleanest) or a JSON
blob keyed by mapped header names (faster to ship). Column mapping is a one-time task per category.

---

## 5. Explicitly out of scope (not free-derivable)

| Metric family | Why blocked |
|---|---|
| **EPA/play, success rate, WPA, situational (down/distance) splits** | need play-by-play; free Genius widget only serves a ~3-play live window |
| **Per-game player box scores / game logs** | `get_league_stats` is season-only; ignores game/week params |
| **Air yards, YAC, aDOT, pressure/coverage** | need charting/tracking data (premium even in NFL) |
| **On-field impact isolation — WOWY / RAPM / QoC-QoT** (PuckQ's signature) | needs per-play participation (who's on the field); not in PBP text at any tier realistically |
| **DVOA-style opponent-adjusted efficiency** | needs play-level opponent adjustment |

**Reachable later, with effort:** EPA/success-rate become possible if a **live PBP collector**
(polls the Genius gametracker every ~15s during games, accumulates `court.matchActions`) is run
going forward — forward-only, no historical backfill. See [REBUILD-PLAN.md](REBUILD-PLAN.md) §
live-capture. On-field-impact metrics remain out of reach regardless.

---

## 6. Build order

1. **Ingest** `rounds.json` + `squads.json` → `games`, `teamGame`, `teams` (Phase 2).
2. **Team ratings** compute job → `teamRatings` (SRS/Elo/Pyth/SoS). *This is the flagship analytics
   and needs only scores — ship it first.*
3. **Ingest** `get_league_stats` per category/season → `playerSeason`; map columns once.
4. **Player rates + percentiles** compute job → `playerRates`.
5. **Pages** (Phase 4): power rankings, projected standings, team pages, player leaderboards with
   percentile bars, compare view — refit the existing components off the new tables.

---

## Appendix A — verified endpoints

All confirmed live (2026 season) via direct `curl --compressed` — no headless browser required for
§1–§3 data. The player-stats endpoint returns positional JSON arrays; the scoreboard JSON files are
static and gzip/brotli-encoded. Game-level play-by-play is served by Genius Sports
(`gsm-widgets.betstream.betgenius.com`, product `democfl_light`) as a **live rolling window only** —
the paywall boundary for deep play-level analytics.
