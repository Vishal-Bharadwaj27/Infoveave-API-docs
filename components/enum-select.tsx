'use client';

import { Popover } from '@base-ui/react/popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

const GROUPS = [
  'Database',
  'ObjectStorage',
  'FileTransfer',
  'DocumentStorage',
  'Email',
  'GenericApi',
  'Application',
  'Messaging',
  'AiProvider',
  'Custom',
];

// A searchable dropdown for an enum field: shows names, hands back the number.
export function EnumSelect({
  options,
  value,
  onChange,
  grouped = false,
}: {
  options: [string, number][];
  value: string;
  onChange: (value: string) => void;
  /** Group by category (providers: 0-13 Database, 100s ObjectStorage, ...). */
  grouped?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const current = options.find(([, v]) => String(v) === value);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      options.filter(
        ([name, v]) =>
          !q || name.toLowerCase().includes(q) || String(v).includes(q),
      ),
    [options, q],
  );

  const pick = (v: number) => {
    onChange(String(v));
    setOpen(false);
  };

  const focusItem = (from: HTMLElement | null, dir: 1 | -1) => {
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    );
    if (items.length === 0) return;
    const i = from ? items.indexOf(from) : -1;
    if (dir === -1 && i <= 0) return searchRef.current?.focus();
    items[Math.min(items.length - 1, Math.max(0, i + dir))]?.focus();
  };

  let lastGroup = -1;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setQuery('');
      }}
    >
      <Popover.Trigger
        type="button"
        className="group flex w-full items-center justify-between gap-2 rounded-lg border bg-fd-secondary px-3 py-2 text-start text-sm text-fd-secondary-foreground transition-colors hover:bg-fd-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring data-[popup-open]:ring-2 data-[popup-open]:ring-fd-ring"
      >
        <span className="truncate">
          {current ? (
            <>
              {current[0]}{' '}
              <span className="text-fd-muted-foreground">({current[1]})</span>
            </>
          ) : (
            <span className="text-fd-muted-foreground">Select</span>
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-50"
        >
          <Popover.Popup
            initialFocus={searchRef}
            className="flex max-h-[min(340px,var(--available-height))] w-(--anchor-width) min-w-[260px] origin-(--transform-origin) flex-col overflow-hidden rounded-xl border bg-fd-popover/95 text-sm text-fd-popover-foreground shadow-lg backdrop-blur-lg focus-visible:outline-none data-closed:animate-fd-popover-out data-open:animate-fd-popover-in"
          >
            <label className="flex items-center gap-2 border-b px-3 py-2.5 text-fd-muted-foreground focus-within:text-fd-primary">
              <Search className="size-4 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered[0]) pick(filtered[0][1]);
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    focusItem(null, 1);
                  }
                }}
                placeholder="Search"
                className="w-full bg-transparent text-fd-foreground outline-none placeholder:text-fd-muted-foreground"
              />
            </label>
            <div ref={listRef} role="listbox" className="overflow-y-auto p-1.5">
              {filtered.map(([name, v]) => {
                const group = Math.floor(v / 100);
                const header =
                  grouped && group !== lastGroup ? GROUPS[group] : null;
                lastGroup = group;
                const selected = String(v) === value;
                return (
                  <div key={v}>
                    {header && (
                      <div className="px-2.5 pb-1 pt-2.5 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                        {header}
                      </div>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      ref={(el) => {
                        if (el && selected && open)
                          el.scrollIntoView({ block: 'center' });
                      }}
                      onClick={() => pick(v)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          focusItem(e.currentTarget, 1);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          focusItem(e.currentTarget, -1);
                        }
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-start transition-colors hover:bg-fd-accent focus-visible:bg-fd-accent focus-visible:outline-none ${
                        selected ? 'bg-fd-primary/10 text-fd-primary' : ''
                      }`}
                    >
                      <Check
                        className={`size-3.5 shrink-0 ${selected ? '' : 'invisible'}`}
                      />
                      <span className="flex-1 truncate font-mono">{name}</span>
                      <span className="font-mono text-xs text-fd-muted-foreground">
                        {v}
                      </span>
                    </button>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-2.5 py-3 text-fd-muted-foreground">
                  No matches.
                </p>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
