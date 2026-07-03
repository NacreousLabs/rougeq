import { db, adminUsers } from "@/db";
import { eq, sql } from "drizzle-orm";

// Admin allowlist — who may sign in to /admin.
//
// The ADMIN_GITHUB_LOGIN env account is the permanent "owner": always allowed,
// can't be removed (so you can never lock yourself out). Additional admins live
// in the admin_users table and are managed at /admin/users. The table
// self-creates on first use so a new deploy needs no manual migration against
// the volume DB. GitHub usernames are matched case-insensitively (lowercased).

let tableReady = false;
function ensureTable(): void {
  if (tableReady) return;
  db.run(
    sql`CREATE TABLE IF NOT EXISTS admin_users (login text PRIMARY KEY, added_by text, added_at text NOT NULL)`,
  );
  tableReady = true;
}

export function ownerLogin(): string {
  return (process.env.ADMIN_GITHUB_LOGIN ?? "").toLowerCase();
}

/** True if this GitHub login may access the admin (owner, or in the allowlist). */
export async function isAllowedAdmin(login: string | null | undefined): Promise<boolean> {
  const l = (login ?? "").toLowerCase();
  if (!l) return false;
  const owner = ownerLogin();
  if (owner && l === owner) return true;
  ensureTable();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.login, l));
  return rows.length > 0;
}

export type AdminEntry = {
  login: string;
  owner: boolean;
  addedBy: string | null;
  addedAt: string | null;
};

/** The owner (from env) plus the DB allowlist, owner first. */
export async function listAdmins(): Promise<AdminEntry[]> {
  ensureTable();
  const owner = ownerLogin();
  const rows = await db.select().from(adminUsers);
  const out: AdminEntry[] = [];
  if (owner) out.push({ login: owner, owner: true, addedBy: null, addedAt: null });
  for (const r of rows) {
    if (r.login === owner) continue; // avoid double-listing the owner
    out.push({ login: r.login, owner: false, addedBy: r.addedBy, addedAt: r.addedAt });
  }
  return out;
}

export function addAdmin(login: string, addedBy: string | null): void {
  const l = login.trim().toLowerCase();
  if (!l) return;
  ensureTable();
  db.insert(adminUsers)
    .values({ login: l, addedBy: addedBy?.toLowerCase() ?? null, addedAt: new Date().toISOString() })
    .onConflictDoNothing()
    .run();
}

export function removeAdmin(login: string): void {
  const l = login.trim().toLowerCase();
  if (!l) return;
  ensureTable();
  db.delete(adminUsers).where(eq(adminUsers.login, l)).run();
}
