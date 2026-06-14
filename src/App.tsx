import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Filters, type FilterState } from "./components/Filters";
import { ListingCard } from "./components/ListingCard";
import { ViewToggle, type ViewMode } from "./components/ViewToggle";
import {
  fetchFacets,
  fetchListings,
  fetchRuns,
  type Facets,
  type Listing,
  type ListingQuery,
  type ScrapeRun,
} from "./lib/api";

// Leaflet ships ~150kB of JS + CSS. Only load it when the map tab is opened.
const MapView = lazy(() =>
  import("./components/MapView").then((m) => ({ default: m.MapView })),
);

const PAGE_SIZE = 100;

const DEFAULT_FILTERS: FilterState = {
  search: "",
  plaats: "",
  leerweg: "",
  opleiding: "",
  status: "active",
  sort: "newest",
};

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function App() {
  const [items, setItems] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets>({
    plaatsen: [],
    leerwegen: [],
    opleidingen: [],
  });
  const [runs, setRuns] = useState<ScrapeRun[]>([]);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  const [loading, setLoading] = useState(true); // first page of current query
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim()), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  // The opleiding filter shows a human label but the API filters by crebocode.
  // Resolve label → crebocode against the facet list (exact match only).
  const crebocode = useMemo(
    () => facets.opleidingen.find((o) => o.label === filters.opleiding)?.crebocode,
    [facets.opleidingen, filters.opleiding],
  );

  const query = useMemo<ListingQuery>(
    () => ({
      q: debouncedSearch || undefined,
      plaats: filters.plaats || undefined,
      leerweg: filters.leerweg || undefined,
      crebocode: crebocode || undefined,
      status: filters.status,
      sort: filters.sort,
    }),
    [debouncedSearch, filters.plaats, filters.leerweg, crebocode, filters.status, filters.sort],
  );

  // Header counts + filter options + latest run. Independent of the query so
  // "active" reflects the whole table, not the current page.
  async function loadMeta() {
    const [f, r] = await Promise.all([fetchFacets(), fetchRuns()]);
    setFacets(f);
    setRuns(r);
  }

  useEffect(() => {
    void loadMeta().catch((e) => setError(errMsg(e)));
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, []);

  // Fetch the first page whenever the query (or a manual refresh) changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListings({ ...query, limit: PAGE_SIZE, offset: 0 })
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setTotal(page.total);
        setNow(Date.now());
      })
      .catch((e) => !cancelled && setError(errMsg(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await fetchListings({ ...query, limit: PAGE_SIZE, offset: items.length });
      setItems((prev) => [...prev, ...page.items]);
      setTotal(page.total);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoadingMore(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      await loadMeta();
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setRefreshing(false);
    }
  }

  const latestRun = runs.find((r) => r.finished_at) ?? runs[0] ?? null;
  const hasMore = items.length < total;

  return (
    <div className="min-h-screen">
      <Header
        latestRun={latestRun}
        onRefresh={() => void refresh()}
        refreshing={refreshing}
      />

      <Filters
        state={filters}
        onChange={setFilters}
        plaatsen={facets.plaatsen}
        leerwegen={facets.leerwegen}
        opleidingen={facets.opleidingen}
        resultCount={total}
        rightSlot={<ViewToggle value={view} onChange={setView} />}
      />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <EmptyState title="Couldn't load listings" body={error} />
        ) : total === 0 ? (
          <EmptyState
            title="No listings match"
            body="Try clearing some filters or widening your search."
          />
        ) : view === "map" ? (
          <>
            <Suspense
              fallback={
                <div className="h-[480px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--accent)]/50" />
              }
            >
              <MapView listings={items} />
            </Suspense>
            <LoadMore
              shown={items.length}
              total={total}
              hasMore={hasMore}
              loading={loadingMore}
              onClick={() => void loadMore()}
              noun="on map"
            />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l) => (
                <ListingCard key={l.leerplaats_id} l={l} now={now} />
              ))}
            </div>
            <LoadMore
              shown={items.length}
              total={total}
              hasMore={hasMore}
              loading={loadingMore}
              onClick={() => void loadMore()}
            />
          </>
        )}
      </main>
    </div>
  );
}

function LoadMore({
  shown,
  total,
  hasMore,
  loading,
  onClick,
  noun = "",
}: {
  shown: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  onClick: () => void;
  noun?: string;
}) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-xs text-[var(--muted)]">
        Showing <span className="font-mono text-[var(--fg)]">{shown.toLocaleString()}</span> of{" "}
        <span className="font-mono">{total.toLocaleString()}</span>
        {noun ? ` ${noun}` : ""}
      </p>
      {hasMore && (
        <button
          onClick={onClick}
          disabled={loading}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-xs font-semibold text-[var(--fg)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="h-44 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-[var(--accent)]" />
            <div className="flex-1 space-y-2 py-0.5">
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-[var(--accent)]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--accent)]" />
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--accent)]" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--accent)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--card)]/40 p-14 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--fg)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{body}</p>
    </div>
  );
}
