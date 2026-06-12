import type { ScrapeRun } from "../lib/api";
import { relativeTime } from "../lib/utils";

export function Header({
  totalActive,
  totalAll,
  latestRun,
  onRefresh,
  refreshing,
}: {
  totalActive: number;
  totalAll: number;
  latestRun: ScrapeRun | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const lastFinished = latestRun?.finished_at ?? null;
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span>
            <span className="font-mono font-medium text-[var(--fg)]">{totalActive}</span> active
            <span className="mx-1.5 text-[var(--border-strong)]">·</span>
            <span className="font-mono">{totalAll}</span> total
          </span>
          <span className="hidden text-[var(--border-strong)] sm:inline">·</span>
          <span className="hidden sm:inline">
            scraped {relativeTime(lastFinished)}
          </span>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-xs font-medium text-[var(--fg)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--accent)] disabled:opacity-50"
          >
            {refreshing ? "…" : "Refresh"}
          </button>
        </div>
      </div>
    </header>
  );
}
