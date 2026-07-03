import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAllowedAdmin } from "@/lib/admins";

// Admin gating via Auth.js (GitHub, allowlisted in src/lib/admins.ts). This
// FAILS CLOSED: if auth isn't configured (no AUTH_SECRET), the session check
// throws, or there's no signed-in user, access is denied. It also re-checks the
// allowlist on every request against the live list — so a user removed in
// /admin/users loses access immediately, not just on next login.

export async function isAuthed(): Promise<boolean> {
  if (!process.env.AUTH_SECRET) return false;
  try {
    const session = await auth();
    const login = (session?.user as { login?: string } | undefined)?.login;
    if (!login) return false;
    return await isAllowedAdmin(login);
  } catch {
    return false;
  }
}

/** For admin pages: redirect to the login screen unless signed in. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) redirect("/admin/login");
}
