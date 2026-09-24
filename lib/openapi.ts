import connectionsDoc from '@/openapi.json';
import ngaugeDoc from '@/openapi-ngauge.json';
import type { Document, HttpMethods } from 'fumadocs-openapi';

const docs: Record<string, Document> = {
  api: connectionsDoc as unknown as Document,
  ngauge: ngaugeDoc as unknown as Document,
};

export function getOpenAPIDocument(section: string): Document | undefined {
  return docs[section];
}

const METHOD_RE =
  /(?:^|\n)\s*#{0,6}\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+`?(\/\S*?)`?(?:\s|$)/im;
const FALLBACK_RE =
  /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+`?((?:\/api)?\/\S*?)`?(?:\s|$)/im;

export function parseOperationFromMarkdown(
  markdown: string,
): { method: HttpMethods; path: string } | undefined {
  const match = METHOD_RE.exec(markdown) ?? FALLBACK_RE.exec(markdown);
  if (!match) return undefined;
  let path = match[2].replace(/^`|`$/g, '').trim();
  // Strip trailing punctuation that can leak in from prose
  path = path.replace(/[),.;:]+$/, '');
  return {
    method: match[1].toLowerCase() as HttpMethods,
    path,
  };
}

export function operationExists(
  doc: Document,
  method: HttpMethods,
  path: string,
): boolean {
  const item = (doc.paths?.[path] as Record<string, unknown> | undefined);
  return Boolean(item && method in item);
}
