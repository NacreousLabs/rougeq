import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TEAM_NAME } from "@/lib/team";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 text-xs leading-relaxed text-zinc-500 md:flex-row md:items-start md:justify-between">
          <div className="max-w-lg">
            <div className="mb-3 text-zinc-700 dark:text-zinc-300">
              <Logo variant="full" team={TEAM_NAME} />
            </div>
            <p>
              <strong>RougeQ</strong> is an independent, non-commercial fan project.{" "}
              <strong>
                Not affiliated with, endorsed by, or sponsored by the Canadian Football League, the
                Winnipeg Blue Bombers, or any CFL team.
              </strong>{" "}
              All CFL and team names, marks, logos, and content are the property of their respective
              owners. Stats and media are drawn from publicly accessible CFL sources.
            </p>
          </div>
          <nav className="flex shrink-0 flex-col gap-1.5 md:items-end" aria-label="Footer links">
            <Link href="/about" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              About &amp; disclaimer
            </Link>
            <Link href="/methodology" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Methodology
            </Link>
            <span>Data: CFL public sources</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
