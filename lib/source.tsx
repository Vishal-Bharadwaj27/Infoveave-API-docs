import { llms, loader } from 'fumadocs-core/source';
import type { LoaderPlugin } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const METHOD_STYLES: Record<string, string> = {
  GET: 'text-green-600 dark:text-green-400',
  POST: 'text-blue-600 dark:text-blue-400',
  PUT: 'text-amber-600 dark:text-amber-400',
  PATCH: 'text-orange-600 dark:text-orange-400',
  DELETE: 'text-red-600 dark:text-red-400',
};

export function methodFromFileName(name: string): string | undefined {
  const m = /^(get|post|put|patch|delete)(?:-|\.|$)/i.exec(name);
  return m?.[1].toUpperCase();
}

// Adds the HTTP method badge (parsed from the file name, e.g.
// `post-api-v10-...mdx`) to the right of each API page in the sidebar.
const methodBadgePlugin: LoaderPlugin = {
  name: 'infoveave:method-badge',
  transformPageTree: {
    file(node, filePath) {
      const base = filePath?.split(/[\\/]/).pop() ?? '';
      const method = methodFromFileName(base);
      if (!method) return node;
      node.name = (
        <>
          {node.name}{' '}
          <span
            className={`ms-auto text-xs text-nowrap font-mono font-semibold ${METHOD_STYLES[method]}`}
          >
            {method}
          </span>
        </>
      );
      return node;
    },
  },
};

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), methodBadgePlugin],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
