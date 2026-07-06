import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

// ── CFL core ────────────────────────────────────────────────────────────────

export const teams = sqliteTable("teams", {
  tricode: text("tricode").primaryKey(), // CFL abbreviation, e.g. WPG
  fullName: text("full_name").notNull(),
  division: text("division"), // West | East
  logoLight: text("logo_light"),
  logoDark: text("logo_dark"),
});

// One row per game, sourced from the CFL scoreboard feed (rounds.json + the
// scoreboard AJAX linescores). Scores + schedule are all we need for the team
// ratings in scripts/ratings.ts. See ANALYTICS-SPEC.md §2.
export const games = sqliteTable("games", {
  id: integer("id").primaryKey(), // CFL fixture id (rounds.json `id`)
  cflId: integer("cfl_id"), // the short event id used in cfl.ca/games/<cflId>/ URLs
  season: integer("season").notNull(), // single calendar year, e.g. 2026
  week: integer("week"),
  gameType: integer("game_type").notNull(), // 2 = regular, 3 = playoffs (incl. Grey Cup)
  date: text("date").notNull(), // ISO date/time
  homeTricode: text("home_tricode").notNull(),
  awayTricode: text("away_tricode").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: text("status"), // complete | in_progress | scheduled …
  venue: text("venue"),
  // Quarter linescores (from the scoreboard AJAX feed), when available.
  homeQ1: integer("home_q1"),
  homeQ2: integer("home_q2"),
  homeQ3: integer("home_q3"),
  homeQ4: integer("home_q4"),
  awayQ1: integer("away_q1"),
  awayQ2: integer("away_q2"),
  awayQ3: integer("away_q3"),
  awayQ4: integer("away_q4"),
});

// Computed team ratings per season (SRS / Elo / Pythagorean / SoS), rebuilt from
// `games` by scripts/ratings.ts. See ANALYTICS-SPEC.md §2 for the formulas.
export const teamRatings = sqliteTable(
  "team_ratings",
  {
    tricode: text("tricode").notNull(),
    season: integer("season").notNull(),
    gamesPlayed: integer("games_played").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    losses: integer("losses").notNull().default(0),
    ties: integer("ties").notNull().default(0),
    pointsFor: integer("points_for").notNull().default(0),
    pointsAgainst: integer("points_against").notNull().default(0),
    mov: real("mov"), // average margin of victory (points)
    srs: real("srs"), // Simple Rating System (opponent-adjusted margin)
    osrs: real("osrs"), // offensive SRS
    dsrs: real("dsrs"), // defensive SRS
    sos: real("sos"), // strength of schedule (srs - mov)
    elo: real("elo"), // current Elo rating
    pythWins: real("pyth_wins"), // Pythagorean expected wins
    luck: real("luck"), // actualWins - pythWins
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.tricode, t.season] }) }),
);

export type Team = typeof teams.$inferSelect;
export type Game = typeof games.$inferSelect;
export type TeamRating = typeof teamRatings.$inferSelect;

// ── CMS / admin (sport-agnostic; carried over from the shell) ────────────────

// Post-game recaps authored in the in-app admin (DB-backed so they publish
// without a redeploy). One per game; prose is Markdown.
export const recaps = sqliteTable("recaps", {
  gameId: integer("game_id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  status: text("status").notNull().default("draft"), // draft | published
  aiNotes: text("ai_notes").notNull().default(""),
  aiModel: text("ai_model").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
export type Recap = typeof recaps.$inferSelect;

// Additional admin allowlist beyond the ADMIN_GITHUB_LOGIN owner, managed in
// /admin/users. GitHub usernames, stored lowercased.
export const adminUsers = sqliteTable("admin_users", {
  login: text("login").primaryKey(),
  addedBy: text("added_by"),
  addedAt: text("added_at").notNull(),
});
export type AdminUser = typeof adminUsers.$inferSelect;

// "The Numbers" — DB-backed data explainers authored in /admin/numbers. Body is
// Markdown with `:::chart <id>:::` shortcodes. Subject grounds the AI aid + charts.
export const posts = sqliteTable("posts", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  subjectType: text("subject_type").notNull().default("team"), // team | player
  subjectId: integer("subject_id"), // playerId when subjectType = player
  compareRef: text("compare_ref"), // opponent player id / team tricode
  seasonMode: text("season_mode"), // single | range | career
  seasonFrom: integer("season_from"),
  seasonTo: integer("season_to"),
  gameType: integer("game_type"),
  aiNotes: text("ai_notes").notNull().default(""),
  aiModel: text("ai_model").notNull().default(""),
  status: text("status").notNull().default("draft"),
  publishedDate: text("published_date"),
  updatedAt: text("updated_at").notNull(),
});
export type Post = typeof posts.$inferSelect;
