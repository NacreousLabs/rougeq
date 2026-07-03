import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

export const teams = sqliteTable("teams", {
  tricode: text("tricode").primaryKey(),
  fullName: text("full_name").notNull(),
  conference: text("conference"),
  division: text("division"),
  logoLight: text("logo_light"),
  logoDark: text("logo_dark"),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position").notNull(),
  sweaterNumber: integer("sweater_number"),
  teamTricode: text("team_tricode"),
  headshot: text("headshot"),
  shootsCatches: text("shoots_catches"),
  birthDate: text("birth_date"),
  heightInches: integer("height_inches"),
  weightPounds: integer("weight_pounds"),
  birthCity: text("birth_city"),
  birthCountry: text("birth_country"),
});

export const games = sqliteTable("games", {
  id: integer("id").primaryKey(),
  season: integer("season").notNull(),
  gameType: integer("game_type").notNull(),
  gameDate: text("game_date").notNull(),
  startTimeUtc: text("start_time_utc"),
  homeTricode: text("home_tricode").notNull(),
  awayTricode: text("away_tricode").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  gameState: text("game_state"),
  lastPeriodType: text("last_period_type"), // REG | OT | SO
  venue: text("venue"),
  attendance: integer("attendance"), // from the NHL official HTML game-summary report
  tvBroadcasts: text("tv_broadcasts"), // comma-joined network abbrevs
  threeMinRecap: text("three_min_recap"), // nhl.com path
  condensedGame: text("condensed_game"), // nhl.com path
  gameCenterLink: text("game_center_link"), // nhl.com path
});

export const standings = sqliteTable(
  "standings",
  {
    tricode: text("tricode").notNull(),
    seasonId: integer("season_id").notNull(),
    fullName: text("full_name"),
    logo: text("logo"),
    conference: text("conference"),
    division: text("division"),
    gamesPlayed: integer("games_played").notNull(),
    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),
    otLosses: integer("ot_losses").notNull(),
    points: integer("points").notNull(),
    goalFor: integer("goal_for").notNull(),
    goalAgainst: integer("goal_against").notNull(),
    goalDifferential: integer("goal_differential").notNull(),
    winPctg: real("win_pctg"),
    streakCode: text("streak_code"),
    streakCount: integer("streak_count"),
    l10Wins: integer("l10_wins"),
    l10Losses: integer("l10_losses"),
    l10OtLosses: integer("l10_ot_losses"),
    conferenceSequence: integer("conference_sequence"),
    divisionSequence: integer("division_sequence"),
    leagueSequence: integer("league_sequence"),
    wildcardSequence: integer("wildcard_sequence"),
    clinchIndicator: text("clinch_indicator"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.tricode, t.seasonId] }) }),
);

export const playerStats = sqliteTable("player_stats", {
  playerId: integer("player_id")
    .primaryKey()
    .references(() => players.id),
  gamesPlayed: integer("games_played"),
  goals: integer("goals"),
  assists: integer("assists"),
  points: integer("points"),
  plusMinus: integer("plus_minus"),
  pim: integer("pim"),
  shots: integer("shots"),
  shootingPctg: real("shooting_pctg"),
  powerPlayGoals: integer("power_play_goals"),
  powerPlayPoints: integer("power_play_points"),
  gameWinningGoals: integer("game_winning_goals"),
  // goalie-only
  wins: integer("wins"),
  losses: integer("losses"),
  otLosses: integer("ot_losses"),
  savePctg: real("save_pctg"),
  goalsAgainstAvg: real("goals_against_avg"),
  shutouts: integer("shutouts"),
});

export const playerGameLog = sqliteTable("player_game_log", {
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id),
  gameId: integer("game_id").notNull(),
  gameDate: text("game_date").notNull(),
  opponentAbbrev: text("opponent_abbrev"),
  homeRoad: text("home_road"),
  goals: integer("goals"),
  assists: integer("assists"),
  points: integer("points"),
  plusMinus: integer("plus_minus"),
  shots: integer("shots"),
  toi: text("toi"),
});

const teamStatsCols = () => ({
  tricode: text("tricode").notNull(),
  seasonId: integer("season_id").notNull(),
  fullName: text("full_name"),
  gamesPlayed: integer("games_played"),
  goalsForPerGame: real("goals_for_per_game"),
  goalsAgainstPerGame: real("goals_against_per_game"),
  shotsForPerGame: real("shots_for_per_game"),
  shotsAgainstPerGame: real("shots_against_per_game"),
  powerPlayPct: real("power_play_pct"),
  penaltyKillPct: real("penalty_kill_pct"),
  faceoffWinPct: real("faceoff_win_pct"),
  pointPct: real("point_pct"),
  satPct: real("sat_pct"),
  hits: integer("hits"),
  blockedShots: integer("blocked_shots"),
  giveaways: integer("giveaways"),
  takeaways: integer("takeaways"),
});
export const teamStats = sqliteTable("team_stats", teamStatsCols(), (t) => ({
  pk: primaryKey({ columns: [t.tricode, t.seasonId] }),
}));
// Playoff team summary (gameTypeId=3), self-seeding — mirrors team_stats.
export const teamPlayoff = sqliteTable("team_playoff", teamStatsCols(), (t) => ({
  pk: primaryKey({ columns: [t.tricode, t.seasonId] }),
}));

export const draftPicks = sqliteTable("draft_picks", {
  // `${draftYear}-${overallPick}` — overall pick is unique within a year.
  id: text("id").primaryKey(),
  draftYear: integer("draft_year").notNull(),
  round: integer("round").notNull(),
  pickInRound: integer("pick_in_round").notNull(),
  overallPick: integer("overall_pick").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position"),
  countryCode: text("country_code"),
  heightInches: integer("height_inches"),
  weightPounds: integer("weight_pounds"),
  amateurLeague: text("amateur_league"),
  amateurClub: text("amateur_club"),
  teamPickHistory: text("team_pick_history"),
});

export const teamSituational = sqliteTable(
  "team_situational",
  {
    tricode: text("tricode").notNull(),
    seasonId: integer("season_id").notNull(),
    // Record when leading / trailing after the 2nd period.
    winsLeadP2: integer("wins_lead_p2"),
    lossLeadP2: integer("loss_lead_p2"),
    otLossLeadP2: integer("ot_loss_lead_p2"),
    winsTrailP2: integer("wins_trail_p2"),
    lossTrailP2: integer("loss_trail_p2"),
    otLossTrailP2: integer("ot_loss_trail_p2"),
    winPctLeadP2: real("win_pct_lead_p2"),
    winPctTrailP2: real("win_pct_trail_p2"),
    // Goals by period (period 3 derived from season totals at read time).
    p1GoalsFor: integer("p1_goals_for"),
    p1GoalsAgainst: integer("p1_goals_against"),
    p2GoalsFor: integer("p2_goals_for"),
    p2GoalsAgainst: integer("p2_goals_against"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.tricode, t.seasonId] }) }),
);

// League-wide per-player season stats — for percentile ranking + season scoping.
// Regular season and playoffs live in parallel tables (identical columns); the
// factories return fresh column builders so both tables can share the shape.
const skaterSeasonCols = () => ({
  playerId: integer("player_id").notNull(),
  seasonId: integer("season_id").notNull(),
  fullName: text("full_name").notNull(),
  positionCode: text("position_code").notNull(),
  teamAbbrev: text("team_abbrev"),
  gamesPlayed: integer("games_played"),
  goals: integer("goals"),
  assists: integer("assists"),
  points: integer("points"),
  shots: integer("shots"),
  shootingPct: real("shooting_pct"),
  plusMinus: integer("plus_minus"),
  ppPoints: integer("pp_points"),
  faceoffWinPct: real("faceoff_win_pct"),
  toiPerGame: real("toi_per_game"), // seconds
  hitsPer60: real("hits_per_60"),
  blockedShotsPer60: real("blocked_shots_per_60"),
  takeawaysPer60: real("takeaways_per_60"),
  giveawaysPer60: real("giveaways_per_60"),
});
const goalieSeasonCols = () => ({
  playerId: integer("player_id").notNull(),
  seasonId: integer("season_id").notNull(),
  fullName: text("full_name").notNull(),
  teamAbbrev: text("team_abbrev"),
  gamesPlayed: integer("games_played"),
  wins: integer("wins"),
  losses: integer("losses"),
  otLosses: integer("ot_losses"),
  savePct: real("save_pct"),
  goalsAgainstAvg: real("goals_against_avg"),
  shutouts: integer("shutouts"),
  shotsAgainst: integer("shots_against"),
  saves: integer("saves"),
});
export const skaterSeason = sqliteTable("skater_season", skaterSeasonCols(), (t) => ({
  pk: primaryKey({ columns: [t.playerId, t.seasonId] }),
}));
export const skaterPlayoff = sqliteTable("skater_playoff", skaterSeasonCols(), (t) => ({
  pk: primaryKey({ columns: [t.playerId, t.seasonId] }),
}));
export const goalieSeason = sqliteTable("goalie_season", goalieSeasonCols(), (t) => ({
  pk: primaryKey({ columns: [t.playerId, t.seasonId] }),
}));
export const goaliePlayoff = sqliteTable("goalie_playoff", goalieSeasonCols(), (t) => ({
  pk: primaryKey({ columns: [t.playerId, t.seasonId] }),
}));

export type SkaterSeason = typeof skaterSeason.$inferSelect;
export type GoalieSeason = typeof goalieSeason.$inferSelect;

export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Standing = typeof standings.$inferSelect;
export type TeamSituational = typeof teamSituational.$inferSelect;
// Per-shot events from play-by-play, for the expected-goals model + xG aggregates.
export const shots = sqliteTable(
  "shots",
  {
    gameId: integer("game_id").notNull(),
    eventId: integer("event_id").notNull(),
    season: integer("season").notNull(),
    gameType: integer("game_type").notNull(),
    period: integer("period"),
    timeSec: integer("time_sec"), // seconds into the period
    shotTeamId: integer("shot_team_id"),
    isHome: integer("is_home"), // 1 if shooting team is home
    shooterId: integer("shooter_id"),
    goalieId: integer("goalie_id"),
    x: integer("x"),
    y: integer("y"),
    distance: real("distance"),
    angle: real("angle"),
    shotType: text("shot_type"),
    zoneCode: text("zone_code"),
    situationCode: text("situation_code"),
    strength: text("strength"), // EV | PP | PK (shooter's perspective)
    is5v5: integer("is_5v5"),
    emptyNetFor: integer("empty_net_for"), // shooting at an empty net
    result: text("result"), // GOAL | SOG | MISS | BLOCK
    isGoal: integer("is_goal"),
    isFenwick: integer("is_fenwick"), // unblocked attempt (GOAL/SOG/MISS)
    rebound: integer("rebound"),
    rush: integer("rush"),
    xg: real("xg"), // filled by the model (unblocked, non-empty-net shots)
  },
  (t) => ({ pk: primaryKey({ columns: [t.gameId, t.eventId] }) }),
);

export type Shot = typeof shots.$inferSelect;

// Player shifts (Jets players) from the shift-charts endpoint, for on-ice metrics.
export const shifts = sqliteTable("shifts", {
  id: integer("id").primaryKey(), // NHL shift row id
  gameId: integer("game_id").notNull(),
  season: integer("season").notNull(),
  playerId: integer("player_id").notNull(),
  teamId: integer("team_id").notNull(),
  period: integer("period").notNull(),
  startSec: integer("start_sec").notNull(),
  endSec: integer("end_sec").notNull(),
});

// Faceoffs from play-by-play, with the zone from the Jets' perspective (for zone starts).
export const faceoffs = sqliteTable(
  "faceoffs",
  {
    gameId: integer("game_id").notNull(),
    eventId: integer("event_id").notNull(),
    season: integer("season").notNull(),
    period: integer("period"),
    timeSec: integer("time_sec"),
    jetsZone: text("jets_zone"), // O | D | N (Jets' offensive / defensive / neutral)
    is5v5: integer("is_5v5"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.gameId, t.eventId] }) }),
);

// Precomputed 5v5 on-ice impact + zone starts per Jets player per season.
const onIceCols = () => ({
  playerId: integer("player_id").notNull(),
  season: integer("season").notNull(),
  cf: integer("cf").notNull(), // 5v5 shot attempts for while on ice
  ca: integer("ca").notNull(), // against
  xgf: real("xgf").notNull(),
  xga: real("xga").notNull(),
  gf: integer("gf").notNull().default(0), // 5v5 goals for while on ice
  ga: integer("ga").notNull().default(0), // against
  ozStarts: integer("oz_starts").notNull().default(0),
  dzStarts: integer("dz_starts").notNull().default(0),
  nzStarts: integer("nz_starts").notNull().default(0),
});
export const onIce = sqliteTable("on_ice", onIceCols(), (t) => ({
  pk: primaryKey({ columns: [t.playerId, t.season] }),
}));
// Playoff on-ice (computed from playoff games only), self-seeding — mirrors on_ice.
export const onIcePlayoff = sqliteTable("on_ice_playoff", onIceCols(), (t) => ({
  pk: primaryKey({ columns: [t.playerId, t.season] }),
}));

// With-or-without-you: 5v5 on-ice totals while two Jets skaters share the ice (playerA < playerB).
export const wowy = sqliteTable(
  "wowy",
  {
    season: integer("season").notNull(),
    playerA: integer("player_a").notNull(),
    playerB: integer("player_b").notNull(),
    cf: integer("cf").notNull(),
    ca: integer("ca").notNull(),
    xgf: real("xgf").notNull(),
    xga: real("xga").notNull(),
    gf: integer("gf").notNull().default(0),
    ga: integer("ga").notNull().default(0),
  },
  (t) => ({ pk: primaryKey({ columns: [t.season, t.playerA, t.playerB] }) }),
);

// Most-used 5v5 forward trios per season (p1 < p2 < p3), with on-ice totals while together.
export const lines = sqliteTable(
  "lines",
  {
    season: integer("season").notNull(),
    p1: integer("p1").notNull(),
    p2: integer("p2").notNull(),
    p3: integer("p3").notNull(),
    cf: integer("cf").notNull(),
    ca: integer("ca").notNull(),
    xgf: real("xgf").notNull(),
    xga: real("xga").notNull(),
    gf: integer("gf").notNull().default(0),
    ga: integer("ga").notNull().default(0),
  },
  (t) => ({ pk: primaryKey({ columns: [t.season, t.p1, t.p2, t.p3] }) }),
);

// League-wide raw data (current season only) — to rank our advanced metrics vs the whole NHL.
// Same shape as `shots`/`shifts` but covers every team's games. Kept separate so Jets-only
// aggregations over `shots` stay correct.
export const leagueGames = sqliteTable("league_games", {
  id: integer("id").primaryKey(),
  season: integer("season").notNull(),
  gameType: integer("game_type").notNull(),
});

export const leagueShots = sqliteTable(
  "league_shots",
  {
    gameId: integer("game_id").notNull(),
    eventId: integer("event_id").notNull(),
    season: integer("season").notNull(),
    gameType: integer("game_type").notNull(),
    period: integer("period"),
    timeSec: integer("time_sec"),
    shotTeamId: integer("shot_team_id"),
    isHome: integer("is_home"),
    shooterId: integer("shooter_id"),
    goalieId: integer("goalie_id"),
    x: integer("x"),
    y: integer("y"),
    distance: real("distance"),
    angle: real("angle"),
    shotType: text("shot_type"),
    strength: text("strength"),
    is5v5: integer("is_5v5"),
    emptyNetFor: integer("empty_net_for"),
    result: text("result"),
    isGoal: integer("is_goal"),
    isFenwick: integer("is_fenwick"),
    rebound: integer("rebound"),
    rush: integer("rush"),
    xg: real("xg"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.gameId, t.eventId] }) }),
);

export const leagueShifts = sqliteTable("league_shifts", {
  id: integer("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  season: integer("season").notNull(),
  playerId: integer("player_id").notNull(),
  teamId: integer("team_id").notNull(),
  period: integer("period").notNull(),
  startSec: integer("start_sec").notNull(),
  endSec: integer("end_sec").notNull(),
});

// Per-player league summaries (current season) — denominators for NHL percentiles.
export const leagueSkater = sqliteTable(
  "league_skater",
  {
    season: integer("season").notNull(),
    playerId: integer("player_id").notNull(),
    toi: real("toi").notNull(), // total 5v5-or-all on-ice seconds (from shifts)
    ixg: real("ixg").notNull(),
    cf: integer("cf").notNull(),
    ca: integer("ca").notNull(),
    xgf: real("xgf").notNull(),
    xga: real("xga").notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.season, t.playerId] }) }),
);

export const leagueGoalie = sqliteTable(
  "league_goalie",
  {
    season: integer("season").notNull(),
    playerId: integer("player_id").notNull(),
    shotsFaced: integer("shots_faced").notNull(),
    ga: integer("ga").notNull(),
    xga: real("xga").notNull(),
    rebounds: integer("rebounds").notNull().default(0), // rebound shots faced (lower rate = better control)
  },
  (t) => ({ pk: primaryKey({ columns: [t.season, t.playerId] }) }),
);

// AI- or rule-generated plain-language analytics summaries per player per season.
export const playerSummaries = sqliteTable(
  "player_summaries",
  {
    playerId: integer("player_id").notNull(),
    season: integer("season").notNull(),
    summary: text("summary").notNull(),
    model: text("model").notNull(), // model id, or "rule-based"
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.playerId, t.season] }) }),
);

// Quality of competition / teammates (5v5, current season) — xGF%-weighted by shared TOI.
export const playerContext = sqliteTable(
  "player_context",
  {
    season: integer("season").notNull(),
    playerId: integer("player_id").notNull(),
    qoc: real("qoc").notNull(), // avg opponent on-ice xGF% (higher = tougher competition)
    qot: real("qot").notNull(), // avg teammate on-ice xGF% (higher = better linemates)
    toi: real("toi").notNull(), // 5v5 seconds in the sample
  },
  (t) => ({ pk: primaryKey({ columns: [t.season, t.playerId] }) }),
);

// Regularized adjusted plus-minus — isolated per-player 5v5 impact (current season).
export const rapm = sqliteTable(
  "rapm",
  {
    season: integer("season").notNull(),
    playerId: integer("player_id").notNull(),
    xgfImpact: real("xgf_impact").notNull(), // isolated xGF/60 impact (+ = drives offense)
    xgaImpact: real("xga_impact").notNull(), // isolated xGA/60 impact (+ = suppresses, i.e. lowers xGA)
    netImpact: real("net_impact").notNull(),
    toi: real("toi").notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.season, t.playerId] }) }),
);

export type Shift = typeof shifts.$inferSelect;
export type Faceoff = typeof faceoffs.$inferSelect;
export type OnIce = typeof onIce.$inferSelect;
export type Wowy = typeof wowy.$inferSelect;
export type Line = typeof lines.$inferSelect;
export type PlayerSummary = typeof playerSummaries.$inferSelect;
export type LeagueSkater = typeof leagueSkater.$inferSelect;
export type LeagueGoalie = typeof leagueGoalie.$inferSelect;
export type PlayerContext = typeof playerContext.$inferSelect;
export type Rapm = typeof rapm.$inferSelect;

// Jets prospect pool — editable in the admin (/admin/prospects); seeded from src/data/prospects.ts.
export const prospects = sqliteTable("prospects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  pos: text("pos").notNull().default("C"),
  draftYear: integer("draft_year"),
  round: integer("round"),
  overall: integer("overall"),
  team: text("team"),
  league: text("league"),
  note: text("note"),
});
export type Prospect = typeof prospects.$inferSelect;
export type DraftPick = typeof draftPicks.$inferSelect;
export type PlayerStats = typeof playerStats.$inferSelect;
export type PlayerGameLog = typeof playerGameLog.$inferSelect;
export type TeamStats = typeof teamStats.$inferSelect;

// Post-game recaps authored in the in-app admin (DB-backed so they publish
// without a redeploy). One per game; the prose is Markdown, rendered alongside
// the live <GameRecap> data block.
export const recaps = sqliteTable("recaps", {
  gameId: integer("game_id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""), // Markdown
  status: text("status").notNull().default("draft"), // draft | published
  aiNotes: text("ai_notes").notNull().default(""), // private AI writing brief (not published)
  aiModel: text("ai_model").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
export type Recap = typeof recaps.$inferSelect;

// Player contracts (cap hit / term / clauses) — hand-curated, unofficial (not in
// the NHL API). DB-backed so the in-app admin can edit them without a redeploy;
// seeded once from src/data/contracts.ts. Keyed by NHL playerId.
export const contracts = sqliteTable("contracts", {
  playerId: integer("player_id").primaryKey(),
  capHit: integer("cap_hit"), // average annual value, USD
  termYears: integer("term_years"), // total length of the deal
  expiry: integer("expiry"), // offseason year the deal ends (2031 = through 2030-31)
  status: text("status"), // UFA | RFA (free-agent status at expiry)
  clause: text("clause"), // NMC | NTC | M-NTC
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  note: text("note"),
  updatedAt: text("updated_at").notNull(),
});
export type ContractRow = typeof contracts.$inferSelect;

// Additional admin allowlist beyond the ADMIN_GITHUB_LOGIN "owner" account,
// managed in /admin/users. GitHub usernames, stored lowercased. Self-creates at
// runtime (see src/lib/admins.ts) so a deploy needs no migration on the volume.
export const adminUsers = sqliteTable("admin_users", {
  login: text("login").primaryKey(), // GitHub username, lowercased
  addedBy: text("added_by"),
  addedAt: text("added_at").notNull(),
});
export type AdminUser = typeof adminUsers.$inferSelect;

// "The Numbers" — DB-backed data explainers authored in /admin/numbers (no
// redeploy). Body is Markdown with `:::chart <id>:::` shortcodes for inline
// charts. Each post has a subject (the team season, or a player) that grounds
// both the AI writing aid and which charts are available. Self-creating at
// runtime (see src/lib/posts.ts) so no volume migration is needed.
export const posts = sqliteTable("posts", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""), // Markdown + :::chart::: shortcodes
  subjectType: text("subject_type").notNull().default("team"), // team | player
  subjectId: integer("subject_id"), // NHL playerId when subjectType = player
  // Optional head-to-head opponent (same kind as the subject): a playerId when
  // subjectType = player, a team tricode when subjectType = team. Enables the
  // compare charts + comparison AI brief.
  compareRef: text("compare_ref"),
  // Season scope for player stat charts. mode: single | range | career.
  // from/to are seasonIds; gameType: 2 = regular, 3 = playoffs, 0 = both.
  seasonMode: text("season_mode"),
  seasonFrom: integer("season_from"),
  seasonTo: integer("season_to"),
  gameType: integer("game_type"),
  aiNotes: text("ai_notes").notNull().default(""), // private AI data brief
  aiModel: text("ai_model").notNull().default(""),
  status: text("status").notNull().default("draft"), // draft | published
  publishedDate: text("published_date"), // YYYY-MM-DD, set on first publish
  updatedAt: text("updated_at").notNull(),
});
export type Post = typeof posts.$inferSelect;
