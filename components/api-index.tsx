import Link from 'next/link';
import administrationMeta from '@/content/docs/administration/meta.json';
import accountMeta from '@/content/docs/administration/account/meta.json';
import apiTriggerMeta from '@/content/docs/administration/api-trigger/meta.json';
import auditMeta from '@/content/docs/administration/audit/meta.json';
import calendarMeta from '@/content/docs/administration/calendar/meta.json';
import connectionMeta from '@/content/docs/administration/connection/meta.json';
import contextSetupMeta from '@/content/docs/administration/context-setup/meta.json';
import emailTriggerMeta from '@/content/docs/administration/email-trigger/meta.json';
import externalLoginSettingMeta from '@/content/docs/administration/external-login-setting/meta.json';
import folderMeta from '@/content/docs/administration/folder/meta.json';
import issueBoardMeta from '@/content/docs/administration/issue-board/meta.json';
import notificationsMeta from '@/content/docs/administration/notifications/meta.json';
import organisationSettingMeta from '@/content/docs/administration/organisation-setting/meta.json';
import roleMeta from '@/content/docs/administration/role/meta.json';
import shareMeta from '@/content/docs/administration/share/meta.json';
import smtpMeta from '@/content/docs/administration/smtp/meta.json';
import templatesMeta from '@/content/docs/administration/templates/meta.json';
import tenantMeta from '@/content/docs/administration/tenant/meta.json';
import trashMeta from '@/content/docs/administration/trash/meta.json';
import userMeta from '@/content/docs/administration/user/meta.json';
import { METHOD_STYLES, methodFromFileName, source } from '@/lib/source';

type Page = ReturnType<typeof source.getPages>[number];

// Administration's sidebar is grouped into modules (one folder per tag);
// mirror the same grouping here so the overview grid matches the sidebar.
const MODULES: Record<string, { title: string; order: string[] }> = {
  account: { title: accountMeta.title, order: accountMeta.pages },
  'api-trigger': { title: apiTriggerMeta.title, order: apiTriggerMeta.pages },
  audit: { title: auditMeta.title, order: auditMeta.pages },
  calendar: { title: calendarMeta.title, order: calendarMeta.pages },
  connection: { title: connectionMeta.title, order: connectionMeta.pages },
  'context-setup': { title: contextSetupMeta.title, order: contextSetupMeta.pages },
  'email-trigger': { title: emailTriggerMeta.title, order: emailTriggerMeta.pages },
  'external-login-setting': {
    title: externalLoginSettingMeta.title,
    order: externalLoginSettingMeta.pages,
  },
  folder: { title: folderMeta.title, order: folderMeta.pages },
  'issue-board': { title: issueBoardMeta.title, order: issueBoardMeta.pages },
  notifications: { title: notificationsMeta.title, order: notificationsMeta.pages },
  'organisation-setting': {
    title: organisationSettingMeta.title,
    order: organisationSettingMeta.pages,
  },
  role: { title: roleMeta.title, order: roleMeta.pages },
  share: { title: shareMeta.title, order: shareMeta.pages },
  smtp: { title: smtpMeta.title, order: smtpMeta.pages },
  templates: { title: templatesMeta.title, order: templatesMeta.pages },
  tenant: { title: tenantMeta.title, order: tenantMeta.pages },
  trash: { title: trashMeta.title, order: trashMeta.pages },
  user: { title: userMeta.title, order: userMeta.pages },
};

const SECTIONS = [{ slug: 'administration', moduleOrder: administrationMeta.pages }];

// Landing-page grid: one card per operation, grouped by module (matches the
// nested sidebar categories).
export function ApiIndex({ section }: { section: string }) {
  return (
    <div className="not-prose flex flex-col gap-10">
      {SECTIONS.filter((s) => s.slug === section).map(({ slug, moduleOrder }) => {
        const pages = source
          .getPages()
          .filter((p) => p.slugs[0] === slug && p.slugs.length > 1);

        const grouped = new Map<string, Page[]>();
        const ungrouped: Page[] = [];
        for (const p of pages) {
          const moduleSlug = p.slugs[1];
          if (p.slugs.length >= 3 && MODULES[moduleSlug]) {
            const group = grouped.get(moduleSlug) ?? [];
            group.push(p);
            grouped.set(moduleSlug, group);
          } else {
            ungrouped.push(p);
          }
        }

        const orderedModules = moduleOrder.filter((s) => MODULES[s] && grouped.has(s));

        return (
          <div key={slug} className="flex flex-col gap-10">
            {orderedModules.map((moduleSlug) => {
              const { title, order } = MODULES[moduleSlug];
              const rank = (p: Page) => {
                const i = order.indexOf(p.slugs[2]);
                return i === -1 ? order.length : i;
              };
              const ops = [...(grouped.get(moduleSlug) ?? [])].sort(
                (a, b) => rank(a) - rank(b),
              );
              return (
                <section key={moduleSlug}>
                  <h2 className="mb-4 text-lg font-semibold">{title}</h2>
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
            {ungrouped.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">General</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {ungrouped.map((p) => (
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
            )}
          </div>
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
