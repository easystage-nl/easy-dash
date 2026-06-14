import type { Listing } from "../lib/api";
import { Badge, Card } from "./ui";
import { formatDate, listingUrl, relativeTime } from "../lib/utils";

const NEW_WINDOW_SEC = 24 * 60 * 60;

export function ListingCard({ l, now }: { l: Listing; now: number }) {
  const title = l.wervende_titel?.trim() || l.titel || "(no title)";
  const url = listingUrl(l.leerplaats_id, l.titel);
  const isNew = now / 1000 - l.first_seen_at < NEW_WINDOW_SEC;
  const isRemoved = !!l.removed_at;
  const org = l.org_naam ?? "Unknown org";

  return (
    <Card as="a" href={url} className="flex flex-col">
      <div className="flex items-start gap-3">
        {l.org_logo_url ? (
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            <img
              src={l.org_logo_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (el.parentElement) el.parentElement.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--accent)] text-sm font-semibold text-[var(--muted)]">
            {org.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--fg)]">
              {title}
            </h3>
            <span className="shrink-0">
              {isRemoved ? (
                <Badge variant="removed">Removed</Badge>
              ) : isNew ? (
                <Badge variant="new">New</Badge>
              ) : null}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">
            {org}
            {l.plaats ? ` · ${l.plaats}` : ""}
          </p>
        </div>
      </div>

      {l.opleiding && (
        <p className="mt-2.5 flex items-center gap-1.5 truncate text-xs font-medium text-[var(--fg)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--muted)]">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5" />
          </svg>
          <span className="truncate">{l.opleiding}</span>
        </p>
      )}

      {(l.leerweg || l.niveaunaam || l.dagen_per_week || l.startdatum) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {l.leerweg && <Badge>{l.leerweg}</Badge>}
          {l.niveaunaam && <Badge variant="muted">{l.niveaunaam}</Badge>}
          {l.dagen_per_week && <Badge>{l.dagen_per_week} dagen/wk</Badge>}
          {l.startdatum && <Badge variant="muted">start {formatDate(l.startdatum)}</Badge>}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2.5 text-[11px] tabular-nums text-[var(--faint)]">
        <span>first seen {relativeTime(l.first_seen_at, now)}</span>
        {isRemoved ? (
          <span>removed {relativeTime(l.removed_at, now)}</span>
        ) : (
          <span>updated {relativeTime(l.last_seen_at, now)}</span>
        )}
      </div>
    </Card>
  );
}
