import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // Same file the app uses (src/db). On the host, set DATABASE_FILE to the
    // mounted volume path (e.g. /data/rougeq.db) before running db:push.
    url: process.env.DATABASE_FILE ?? "./rougeq.db",
  },
} satisfies Config;
