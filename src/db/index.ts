import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_FILE ?? path.join(process.cwd(), "puckq.db");

// Ensure the parent directory exists before opening. On a host the DB lives on a
// mounted volume (e.g. /data) that isn't present during the build, where this
// module is imported while collecting page data — without this, `new Database`
// throws "unable to open database file" and the build fails.
mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("busy_timeout = 5000");

export const db = drizzle(sqlite, { schema });
export * from "./schema";
