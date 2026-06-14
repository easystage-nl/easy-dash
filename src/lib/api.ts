export interface Listing {
  leerplaats_id: string;
  titel: string;
  wervende_titel: string | null;
  org_naam: string | null;
  org_logo_url: string | null;
  plaats: string | null;
  postcode: string | null;
  leerweg: string | null;
  startdatum: string | null;
  dagen_per_week: string | null;
  lat: number | null;
  lon: number | null;
  first_seen_at: number;
  last_seen_at: number;
  removed_at: number | null;
  crebocode: string | null;
  opleiding: string | null;
  niveaunaam: string | null;
}

export interface OpleidingFacet {
  crebocode: string;
  label: string;
  count: number;
}

export interface ScrapeRun {
  id: number;
  started_at: number;
  finished_at: number | null;
  total_count: number | null;
  new_count: number | null;
  removed_count: number | null;
  notified_count: number | null;
  error: string | null;
}

export type Status = "active" | "removed" | "all";
export type SortKey = "newest" | "recent" | "title";

export interface ListingQuery {
  q?: string;
  plaats?: string;
  leerweg?: string;
  crebocode?: string;
  status?: Status;
  sort?: SortKey;
  limit?: number;
  offset?: number;
}

export interface ListingsPage {
  items: Listing[];
  total: number;
}

export interface Stats {
  active: number;
  removed: number;
  total: number;
}

export interface Facets {
  plaatsen: string[];
  leerwegen: string[];
  opleidingen: OpleidingFacet[];
}

// Base URL of the easy-scraper Worker API. Empty in dev so requests stay
// same-origin and hit the Vite proxy (see vite.config.ts); set VITE_API_BASE
// to the deployed worker origin (e.g. https://api.easystage.nl) for production.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchListings(query: ListingQuery = {}): Promise<ListingsPage> {
  const p = new URLSearchParams();
  if (query.q) p.set("q", query.q);
  if (query.plaats) p.set("plaats", query.plaats);
  if (query.leerweg) p.set("leerweg", query.leerweg);
  if (query.crebocode) p.set("crebocode", query.crebocode);
  if (query.status) p.set("status", query.status);
  if (query.sort) p.set("sort", query.sort);
  p.set("limit", String(query.limit ?? 100));
  p.set("offset", String(query.offset ?? 0));
  const res = await fetch(`${API_BASE}/listings?${p.toString()}`);
  if (!res.ok) throw new Error(`/listings ${res.status}`);
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error(`/stats ${res.status}`);
  return res.json();
}

export async function fetchFacets(): Promise<Facets> {
  const res = await fetch(`${API_BASE}/facets`);
  if (!res.ok) throw new Error(`/facets ${res.status}`);
  return res.json();
}

export async function fetchRuns(): Promise<ScrapeRun[]> {
  const res = await fetch(`${API_BASE}/runs`);
  if (!res.ok) throw new Error(`/runs ${res.status}`);
  return res.json();
}
