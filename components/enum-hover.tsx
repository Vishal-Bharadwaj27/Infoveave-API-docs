'use client';

import { Popover } from '@base-ui/react/popover';
import { Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type EnumMap = Record<string, [string, number][]>;

const isObjectTrigger = (el: HTMLElement) =>
  el.tagName === 'BUTTON' &&
  el.hasAttribute('data-base-ui-click-trigger') &&
  el.textContent?.trim() === 'object';

// Makes the enum type names in the API reference (e.g. `ConnectionCategory`)
// behave like the built-in `object` popovers:
//  - click opens a card, click again / Esc / outside click closes it
//  - the card is anchored beside the name, so it moves with the page
// The reference renders these names as plain text, so we find them in the DOM.
// The `object` buttons already open their own popover on click; we only give
// them the same pointer cursor.
export function EnumHover({ enums }: { enums: EnumMap }) {
  const [tip, setTip] = useState<{ name: string; anchor: HTMLElement } | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef(tip);
  tipRef.current = tip;

  useEffect(() => {
    const enumTrigger = (t: EventTarget | null) =>
      (t as HTMLElement | null)?.closest?.<HTMLElement>('[data-enum-hover]') ??
      null;

    // Click a type name to open its card; click it again, press Esc or click
    // elsewhere to close it.
    const onClick = (e: MouseEvent) => {
      const el = enumTrigger(e.target);
      if (!el) return;
      const name = el.textContent?.trim() ?? '';
      if (tipRef.current?.anchor === el) return setTip(null);
      setQuery('');
      setTip({ name, anchor: el });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTip(null);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);

    // Give every interactive type a pointer cursor. Only touch nodes React has
    // already hydrated, otherwise the change causes a hydration mismatch.
    const hydrated = (el: HTMLElement) =>
      Object.keys(el).some((k) => k.startsWith('__reactFiber'));
    const mark = () => {
      const root = document.getElementById('nd-page');
      if (!root) return;
      for (const el of root.querySelectorAll<HTMLElement>('span, button, code')) {
        if (el.dataset.enumMarked || !hydrated(el)) continue;
        const text = el.textContent?.trim() ?? '';
        if (isObjectTrigger(el)) {
          el.dataset.enumMarked = 'true';
          el.style.cursor = 'pointer';
        } else if (
          text in enums &&
          el.children.length === 0 &&
          !el.closest('p, li, td, h1, h2, h3, pre')
        ) {
          el.dataset.enumMarked = 'true';
          el.dataset.enumHover = 'true';
          el.style.textDecoration = 'underline';
          el.style.cursor = 'pointer';
        }
      }
    };
    mark();
    const interval = setInterval(mark, 400);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [enums]);

  const q = query.trim().toLowerCase();
  const values = tip
    ? enums[tip.name].filter(
        ([name, value]) =>
          !q || name.toLowerCase().includes(q) || String(value).includes(q),
      )
    : [];

  return (
    <>
    {/* Field descriptions: muted gray and small, like the page subtitle. Only on pages that use this component. */}
    <style>{'#nd-page .prose-no-margin p { font-size: 13px; line-height: 1.5; color: var(--color-fd-muted-foreground); }'}</style>
    <Popover.Root
      open={tip !== null}
      onOpenChange={(open, details) => {
        // A press on the type name is handled by the click handler above
        // (it toggles), so don't treat it as an outside press.
        const target = details?.event?.target as HTMLElement | undefined;
        if (!open && !target?.closest?.('[data-enum-hover]')) setTip(null);
      }}
    >
      <Popover.Portal>
        <Popover.Positioner
          anchor={tip?.anchor ?? null}
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={12}
          className="z-50"
        >
          <Popover.Popup
            ref={popupRef}
            data-enum-popup=""
            initialFocus={false}
            className="flex max-h-(--available-height) w-[520px] max-w-[98vw] origin-(--transform-origin) flex-col overflow-hidden rounded-xl border bg-fd-popover/95 text-sm text-fd-popover-foreground shadow-lg backdrop-blur-lg focus-visible:outline-none"
          >
            {tip && (
              <>
                <div className="border-b px-4 py-3 font-mono">{tip.name}</div>
                <label className="flex items-center gap-2 border-b bg-fd-secondary px-4 py-2.5 text-fd-muted-foreground focus-within:text-fd-primary">
                  <Filter className="size-4 shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter Properties"
                    className="w-full bg-transparent text-fd-foreground outline-none placeholder:text-fd-muted-foreground"
                  />
                </label>
                <div className="overflow-y-auto px-4 pb-2">
                  {values.map(([name, value]) => (
                    <div
                      key={value}
                      className="flex items-baseline justify-between gap-4 border-b py-3 font-mono last:border-b-0"
                    >
                      <span className="text-fd-primary">{name}</span>
                      <span className="text-fd-muted-foreground">
                        integer = {value}
                      </span>
                    </div>
                  ))}
                  {values.length === 0 && (
                    <p className="py-3 text-fd-muted-foreground">
                      No matching values.
                    </p>
                  )}
                </div>
              </>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
    </>
  );
}
