import type { Metadata } from "next";
import { Container } from "@/components/Container";

export const metadata: Metadata = { title: "RougeQ — Winnipeg Blue Bombers analytics" };
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Container size="lg">
      <div className="py-24 text-center">
        <h1 className="font-display text-6xl font-bold uppercase italic tracking-tight text-bombers-navy dark:text-bombers-gold">
          RougeQ
        </h1>
        <p className="mt-4 text-lg text-zinc-500">
          Advanced analytics for the Winnipeg Blue Bombers — coming soon.
        </p>
      </div>
    </Container>
  );
}
