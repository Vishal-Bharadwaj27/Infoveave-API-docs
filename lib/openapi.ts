import connectionsDoc from '@/openapi.json';
import ngaugeDoc from '@/openapi-ngauge.json';
import datagovernanceDoc from '@/openapi-datagovernance.json';
import datagraphDoc from '@/openapi-datagraph.json';
import dataqualityDoc from '@/openapi-dataquality.json';
import type { Document, HttpMethods } from 'fumadocs-openapi';

const docs: Record<string, Document> = {
  connections: connectionsDoc as unknown as Document,
  ngauge: ngaugeDoc as unknown as Document,
  datagovernance: withProblemDetailsFallback(datagovernanceDoc),
  datagraph: withProblemDetailsFallback(datagraphDoc),
  dataquality: withProblemDetailsFallback(dataqualityDoc),
};

// Some service specs reference `#/components/schemas/ProblemDetails` without
// defining it, which crashes the OpenAPI renderer at build time. Backfill it
// from the connections spec (RFC 7807 shape) when missing.
function withProblemDetailsFallback(spec: unknown): Document {
  const doc = spec as Document & {
    components?: { schemas?: Record<string, unknown> };
  };
  doc.components ??= {};
  doc.components.schemas ??= {};
  if (!doc.components.schemas.ProblemDetails) {
    const fallback = (
      connectionsDoc as unknown as {
        components?: { schemas?: Record<string, unknown> };
      }
    ).components?.schemas?.ProblemDetails;
    if (fallback) doc.components.schemas.ProblemDetails = fallback;
  }
  return doc;
}

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
