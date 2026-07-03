"use server";

import { signOut } from "@/auth";

// Content actions (recaps, articles, contracts, prospects, data refresh) return
// in Phase 3 once the CFL data layer is in. Auth is sport-agnostic and stays.
export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
