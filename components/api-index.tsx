import Link from 'next/link';
import connectionsMeta from '@/content/docs/connections/meta.json';
import ngaugeMeta from '@/content/docs/ngauge/meta.json';
import { METHOD_STYLES, methodFromFileName, source } from '@/lib/source';

const SECTIONS = [
  { slug: 'connections', order: connectionsMeta.pages },
  { slug: 'ngauge', order: ngaugeMeta.pages },
];

// Landing-page grid: one card per operation, grouped by service.
export function ApiIndex({ section }: { section: string }) {
  return (
    <div className="not-prose flex flex-col gap-10">
      {SECTIONS.filter((s) => s.slug === section).map(({ slug, order }) => {
        const pages = source.getPages().filter((p) => p.slugs[0] === slug);
        const rank = (p: (typeof pages)[number]) => {
          const i = order.indexOf(p.slugs[1]);
          return i === -1 ? order.length : i;
        };
        const ops = pages.filter((p) => p.slugs.length > 1).sort((a, b) => rank(a) - rank(b));
        return (
          <section key={slug}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {ops.map((p) => (
                <Card
                  key={p.url}
                  href={p.url}
                  title={p.data.title}
                  description={p.data.description}
                  method={methodFromFileName(p.path.split('/').pop() ?? '')}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Card(props: {
  href: string;
  title: string;
  description?: string;
  method?: string;
}) {
  return (
    <Link
      href={props.href}
      className="flex flex-col gap-1 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-sm transition-colors hover:bg-fd-accent/50"
    >
      <span className="font-medium">
        {props.title}
        {props.method && (
          <span
            className={`ms-2 font-mono text-xs font-semibold ${METHOD_STYLES[props.method]}`}
          >
            {props.method}
          </span>
        )}
      </span>
      {props.description && (
        <span className="text-sm text-fd-muted-foreground">
          {props.description}
        </span>
      )}
    </Link>
  );
}
