import type { InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

const fieldBase =
  "h-10 w-full rounded-lg border bg-[var(--card)] px-3 text-sm text-[var(--fg)] shadow-[var(--shadow-sm)] " +
  "border-[var(--border)] placeholder:text-[var(--faint)] " +
  "hover:border-[var(--border-strong)] " +
  "focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-tint)] " +
  "transition-[border-color,box-shadow] duration-150";

export function Input({
  className,
  icon,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  if (!icon) return <input className={cn(fieldBase, className)} {...rest} />;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--faint)]">
        {icon}
      </span>
      <input className={cn(fieldBase, "pl-9", className)} {...rest} />
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "muted" | "new" | "removed";
  className?: string;
}) {
  const variants: Record<string, string> = {
    default: "border-[var(--border-strong)] text-[var(--fg)] bg-[var(--accent)]",
    muted: "border-[var(--border)] text-[var(--muted)] bg-transparent",
    new: "border-[var(--border-strong)] text-[var(--fg)] bg-[var(--accent)]",
    removed: "border-[var(--border)] text-[var(--faint)] bg-transparent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-tight",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  onClick,
  className,
  as: As = "div",
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  as?: "div" | "a";
  href?: string;
}) {
  const cls = cn(
    "group relative block rounded-xl border bg-[var(--card)] border-[var(--border)] p-4 text-left",
    "shadow-[var(--shadow-sm)] transition-colors duration-150",
    "hover:border-[var(--border-strong)]",
    onClick || href ? "cursor-pointer" : "",
    className,
  );
  if (As === "a") {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <div className={cls} onClick={onClick}>
      {children}
    </div>
  );
}

export interface ComboOption {
  value: string;
  label: string;
  hint?: string;
}

const ChevronIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClearIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/**
 * One dropdown for every filter so the controls stay consistent. A button that
 * opens a compact popover: optional type-to-filter box (auto-on past 8 options)
 * and a scroll-capped list — so long facets like opleidingen never flood the UI.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  clearable = true,
  searchable,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ComboOption[];
  placeholder: string;
  clearable?: boolean;
  searchable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const canSearch = searchable ?? options.length > 8;
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (canSearch) searchRef.current?.focus();
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, canSearch]);

  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(fieldBase, "flex cursor-pointer items-center justify-between gap-2 pr-2.5 text-left")}
      >
        <span className={cn("truncate", selected ? "text-[var(--fg)]" : "text-[var(--faint)]")}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[var(--faint)]">
          {clearable && selected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear"
              onClick={(e) => {
                e.stopPropagation();
                pick("");
              }}
              className="grid h-5 w-5 place-items-center rounded transition-colors hover:bg-[var(--accent)] hover:text-[var(--fg)]"
            >
              {ClearIcon}
            </span>
          )}
          <span className={cn("transition-transform duration-150", open && "rotate-180")}>{ChevronIcon}</span>
        </span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 w-full overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--card)] shadow-[var(--shadow-md)]">
          {canSearch && (
            <div className="border-b border-[var(--border)] p-1.5">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to filter…"
                className="h-8 w-full rounded-md bg-[var(--accent)] px-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--faint)] focus:outline-none"
              />
            </div>
          )}
          <ul role="listbox" className="max-h-64 overflow-y-auto p-1">
            {clearable && (
              <ComboRow active={!value} muted label={placeholder} onClick={() => pick("")} />
            )}
            {filtered.length === 0 ? (
              <li className="px-2.5 py-2 text-xs text-[var(--faint)]">No matches</li>
            ) : (
              filtered.map((o, i) => (
                <ComboRow
                  key={`${o.value}-${i}`}
                  active={o.value === value}
                  label={o.label}
                  hint={o.hint}
                  onClick={() => pick(o.value)}
                />
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function ComboRow({
  label,
  hint,
  active,
  muted,
  onClick,
}: {
  label: string;
  hint?: string;
  active: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
          active ? "bg-[var(--accent)] font-medium text-[var(--fg)]" : "hover:bg-[var(--accent)]",
          muted && !active ? "text-[var(--muted)]" : "text-[var(--fg)]",
        )}
      >
        <span className="truncate">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          {hint && <span className="text-[11px] tabular-nums text-[var(--faint)]">{hint}</span>}
          {active && <span className="text-[var(--fg)]">{CheckIcon}</span>}
        </span>
      </button>
    </li>
  );
}
