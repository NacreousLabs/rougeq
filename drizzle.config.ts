import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // Same file the app uses (src/db). On the host, set DATABASE_FILE to the
    // mounted volume path (e.g. /data/puckq.db) before running db:push.
    url: process.env.DATABASE_FILE ?? "./puckq.db",
  },
} satisfies Config;
