import type { ScrapeRun } from "../lib/api";
import { relativeTime } from "../lib/utils";

export function Header({
  latestRun,
  onRefresh,
  refreshing,
}: {
  latestRun: ScrapeRun | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const isRunning = latestRun != null && latestRun.finished_at == null;
  const updated = isRunning ? "scraping…" : relativeTime(latestRun?.finished_at ?? null);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/65">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--brand)] shadow-[var(--shadow-sm)]">
            <svg viewBox="0 0 1024 1024" className="h-4 w-4 fill-[var(--brand-fg)]" aria-hidden="true">
              <path d="M320 320V128h384v192h192v192H128V320h192zM128 576h768v320H128V576zm256-256h256.064V192H384v128z" />
            </svg>
          </span>
          <span className="text-[15px] font-bold tracking-tight text-[var(--fg)]">
            easystage<span className="font-medium text-[var(--faint)]">.nl</span>
          </span>
        </a>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          title={`Updated ${updated}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-medium text-[var(--fg)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--accent)] disabled:opacity-50"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={refreshing ? "animate-spin" : ""}
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          <span className="hidden sm:inline">{refreshing ? "Refreshing" : updated}</span>
        </button>
      </div>
    </header>
  );
}
