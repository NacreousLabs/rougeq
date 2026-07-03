# RougeQ

An independent, non-commercial **Winnipeg Jets** stats, analytics, and results hub —
covering the current franchise era (2011-12 → present). Built with Next.js, Drizzle ORM,
and SQLite.

## Disclaimer

RougeQ is **not affiliated with, endorsed by, or sponsored by** the National Hockey League,
the Winnipeg Jets, or any NHL team. All NHL and team names, marks, logos, and content are
the property of their respective owners and are used here for identification and
informational, non-commercial purposes only. Stats are unofficial — see
[NHL.com](https://www.nhl.com) for official data. Rights holders may request removal of any
content (see the in-app About page).

## Features

Schedule, rosters, standings (with playoff indicators), team & player analytics, MoneyPuck-
style percentile player cards, player/team comparison, season hubs, playoff history, draft
history & outcomes, franchise records, all-time vs-opponent records, game pages with shot
maps, and global search — all season-selectable from 2011-12 onward.

## Setup

```bash
npm install
npm run db:push        # create the SQLite schema (puckq.db)
npm run ingest         # pull all seasons from the NHL public API (a few minutes)
npm run dev            # http://localhost:3000
```

Faster refreshes:

```bash
npm run ingest:current     # current season only
npm run ingest:standings   # standings only (all seasons)
npm run ingest:schedule    # schedules only (all seasons)
```

To keep the current season fresh automatically, run `scripts/register-refresh-task.ps1`
(registers a daily Windows task running `ingest:current`).

## Data

Data is pulled from the NHL's publicly accessible web endpoints
(`api-web.nhle.com`, `api.nhle.com`) and stored locally in `puckq.db` (git-ignored;
regenerate with the commands above). Pages read from the local DB; a few game/player views
fetch live game detail, cached via Next's Data Cache to avoid hammering the source.

No expected-goals (xG) or other proprietary model stats are included — advanced metrics here
(Corsi/SAT%, PDO, per-60 rates, percentiles) are derived from public counting/rate stats.

## License

Source code is MIT licensed (see [LICENSE](LICENSE)). The license covers the code only, not
NHL data/marks/content.
