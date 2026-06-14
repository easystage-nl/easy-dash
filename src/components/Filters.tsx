import type { ReactNode } from "react";
import type { OpleidingFacet } from "../lib/api";
import { Combobox, Input, type ComboOption } from "./ui";

export type SortKey = "newest" | "recent" | "title";

export interface FilterState {
  search: string;
  plaats: string;
  leerweg: string;
  opleiding: string;
  status: "active" | "removed" | "all";
  sort: SortKey;
}

const SearchIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const STATUS_OPTIONS: ComboOption[] = [
  { value: "active", label: "Active only" },
  { value: "removed", label: "Removed only" },
  { value: "all", label: "All statuses" },
];

const SORT_OPTIONS: ComboOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "recent", label: "Recently updated" },
  { value: "title", label: "Title (A–Z)" },
];

export function Filters({
  state,
  onChange,
  plaatsen,
  leerwegen,
  opleidingen,
  resultCount,
  rightSlot,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
  plaatsen: string[];
  leerwegen: string[];
  opleidingen: OpleidingFacet[];
  resultCount: number;
  rightSlot?: ReactNode;
}) {
  const update = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });
  const isFiltered =
    !!state.search ||
    !!state.plaats ||
    !!state.leerweg ||
    !!state.opleiding ||
    state.status !== "active";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-2 sm:px-6">
      {/* Primary row: free-text search + the opleiding picker (the filter that
          makes the dashboard actually usable). */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          type="search"
          icon={SearchIcon}
          placeholder="Search title or organisation…"
          value={state.search}
          onChange={(e) => update({ search: e.target.value })}
        />
        {opleidingen.length > 0 && (
          <Combobox
            placeholder="All opleidingen"
            value={state.opleiding}
            onChange={(v) => update({ opleiding: v })}
            options={opleidingen.map((o) => ({
              value: o.label,
              label: o.label,
              hint: o.count.toLocaleString(),
            }))}
          />
        )}
      </div>

      {/* Secondary row: the narrow categorical filters — all the same control. */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Combobox
          placeholder="All cities"
          value={state.plaats}
          onChange={(v) => update({ plaats: v })}
          options={plaatsen.map((p) => ({ value: p, label: p }))}
        />
        <Combobox
          placeholder="All leerwegen"
          value={state.leerweg}
          onChange={(v) => update({ leerweg: v })}
          options={leerwegen.map((l) => ({ value: l, label: l }))}
        />
        <Combobox
          placeholder="Status"
          clearable={false}
          value={state.status}
          onChange={(v) => update({ status: v as FilterState["status"] })}
          options={STATUS_OPTIONS}
        />
        <Combobox
          placeholder="Sort"
          clearable={false}
          value={state.sort}
          onChange={(v) => update({ sort: v as SortKey })}
          options={SORT_OPTIONS}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-[var(--muted)]">
          <span>
            <span className="font-medium tabular-nums text-[var(--fg)]">
              {resultCount.toLocaleString()}
            </span>{" "}
            {resultCount === 1 ? "result" : "results"}
          </span>
          {isFiltered && (
            <button
              onClick={() =>
                onChange({
                  search: "",
                  plaats: "",
                  leerweg: "",
                  opleiding: "",
                  status: "active",
                  sort: state.sort,
                })
              }
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--fg)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>
        {rightSlot}
      </div>
    </div>
  );
}
