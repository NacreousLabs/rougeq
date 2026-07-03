"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAuthed } from "@/lib/admin-auth";
import { addAdmin, removeAdmin, ownerLogin } from "@/lib/admins";

// GitHub usernames: 1–39 chars, alphanumeric or single hyphens, no leading/
// trailing hyphen.
const GH_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export async function addAdminAction(fd: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const login = String(fd.get("login") ?? "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  if (!GH_USERNAME.test(login)) redirect("/admin/users?error=invalid");

  const session = await auth();
  const by = (session?.user as { login?: string } | undefined)?.login ?? null;
  addAdmin(login, by);
  revalidatePath("/admin/users");
  redirect("/admin/users?added=1");
}

export async function removeAdminAction(fd: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const login = String(fd.get("login") ?? "").trim().toLowerCase();
  // The owner (ADMIN_GITHUB_LOGIN) can't be removed here — it's env-controlled.
  if (login && login !== ownerLogin()) removeAdmin(login);
  revalidatePath("/admin/users");
  redirect("/admin/users?removed=1");
}
