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

// Base URL of the easy-scraper Worker API. Empty in dev so requests stay
// same-origin and hit the Vite proxy (see vite.config.ts); set VITE_API_BASE
// to the deployed worker origin (e.g. https://easystage.nl) for production.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchListings(): Promise<Listing[]> {
  const res = await fetch(`${API_BASE}/listings?limit=1000&active=false`);
  if (!res.ok) throw new Error(`/listings ${res.status}`);
  return res.json();
}

export async function fetchRuns(): Promise<ScrapeRun[]> {
  const res = await fetch(`${API_BASE}/runs`);
  if (!res.ok) throw new Error(`/runs ${res.status}`);
  return res.json();
}
