import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type ViewMode = "list" | "map";

const icons: Record<ViewMode, ReactNode> = {
  list: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  map: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  ),
};

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--accent)] p-0.5 text-xs"
    >
      {(["list", "map"] as const).map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={value === m}
          onClick={() => onChange(m)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium capitalize transition-all",
            value === m
              ? "bg-[var(--card)] text-[var(--brand)] shadow-[var(--shadow-sm)]"
              : "text-[var(--muted)] hover:text-[var(--fg)]",
          )}
        >
          {icons[m]}
          {m}
        </button>
      ))}
    </div>
  );
}
