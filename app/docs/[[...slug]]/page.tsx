import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { APIPage } from '@/components/api-page';
import {
  getOpenAPIDocument,
  operationExists,
  parseOperationFromMarkdown,
} from '@/lib/openapi';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  // Render interactive OpenAPI UI (method badges, schema/param tables,
  // response tabs, try-it-out playground) for each documented service.
  const section = params.slug?.[0];
  const doc = section ? getOpenAPIDocument(section) : undefined;
  const processed = await page.data.getText('processed').catch(() => '');
  // Fall back to the raw MDX file so the `## METHOD /path` heading is intact.
  let rawFile = '';
  try {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    rawFile = await readFile(
      join(process.cwd(), 'content/docs', `${page.path}.mdx`),
      'utf8',
    ).catch(() => '');
  } catch {
    rawFile = '';
  }
  const operation = doc
    ? (parseOperationFromMarkdown(rawFile) ??
      parseOperationFromMarkdown(processed) ??
      parseOperationFromMarkdown(`${page.data.title} ${page.data.description ?? ''}`))
    : undefined;
  const useOpenAPIUI =
    doc &&
    operation &&
    operationExists(doc, operation.method, operation.path);

  return (
    <DocsPage
      toc={useOpenAPIUI ? [] : page.data.toc}
      full={useOpenAPIUI ? true : page.data.full}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      {!useOpenAPIUI && (
        <div className="flex flex-row gap-2 items-center border-b pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
          />
        </div>
      )}
      {useOpenAPIUI && doc && operation ? (
        <DocsBody>
          <APIPage
            payload={{ bundled: doc, proxyUrl: '/api/proxy' }}
            operations={[
              { path: operation.path, method: operation.method },
            ]}
          />
        </DocsBody>
      ) : (
        <DocsBody>
          <MDX
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      )}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
