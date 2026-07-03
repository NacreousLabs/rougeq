import type { Metadata } from "next";
import { requireAuth } from "@/lib/admin-auth";
import { listAdmins, ownerLogin } from "@/lib/admins";
import { addAdminAction, removeAdminAction } from "./actions";

export const metadata: Metadata = { title: "Admins · RougeQ admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; removed?: string; error?: string }>;
}) {
  await requireAuth();
  const flags = await searchParams;
  const admins = await listAdmins();
  const owner = ownerLogin();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="font-display text-3xl font-bold uppercase italic tracking-tight">Admins</h1>
      <p className="mt-1 text-sm text-zinc-500">
        GitHub accounts allowed to sign in to the admin. Removing someone takes effect immediately —
        it also ends any session they already have.
      </p>

      {flags.added && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          Admin added.
        </p>
      )}
      {flags.removed && (
        <p className="mt-3 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          Admin removed.
        </p>
      )}
      {flags.error === "invalid" && (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          That doesn&apos;t look like a valid GitHub username.
        </p>
      )}

      <form action={addAdminAction} className="mt-6 flex flex-wrap items-end gap-2">
        <label className="flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Add by GitHub username
          </span>
          <input
            name="login"
            placeholder="e.g. octocat"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button className="rounded-md bg-bombers-blue px-4 py-2 text-sm font-semibold text-white hover:bg-bombers-navy dark:bg-bombers-gold dark:text-bombers-navy dark:hover:bg-white">
          Add admin
        </button>
      </form>

      <ul className="mt-8 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {admins.map((a) => (
          <li key={a.login} className="flex items-center justify-between py-3">
            <div>
              <a
                href={`https://github.com/${a.login}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:underline"
              >
                {a.login}
              </a>
              {a.owner ? (
                <span className="ml-2 rounded bg-bombers-navy/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bombers-blue dark:bg-bombers-gold/10 dark:text-bombers-gold">
                  owner
                </span>
              ) : (
                a.addedBy && <span className="ml-2 text-xs text-zinc-400">added by {a.addedBy}</span>
              )}
            </div>
            {a.owner ? (
              <span className="text-xs text-zinc-400">always allowed</span>
            ) : (
              <form action={removeAdminAction}>
                <input type="hidden" name="login" value={a.login} />
                <button className="text-xs text-rose-600 hover:underline dark:text-rose-400">
                  Remove
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-zinc-400">
        The <strong>owner</strong> is set by the <code>ADMIN_GITHUB_LOGIN</code> environment variable
        ({owner || "unset"}) and can&apos;t be removed here — it&apos;s your lockout-proof account.
        Everyone else is managed from this page.
      </p>
    </div>
  );
}
