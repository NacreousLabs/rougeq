import Link from "next/link";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Admin · RougeQ", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requireAuth();
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="font-display text-3xl font-bold uppercase italic tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-zinc-500">
        RougeQ admin. Content tools (recaps, The Numbers articles, contracts, prospects) and the data
        refresh return once the CFL data layer is in (Phase 3).
      </p>
      <div className="mt-8">
        <Link
          href="/admin/users"
          className="font-display text-xs font-semibold uppercase tracking-wider text-rouge hover:underline dark:text-bombers-gold"
        >
          Manage admin users →
        </Link>
      </div>
    </div>
  );
}
