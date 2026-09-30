import administrationDoc from '@/openapi-administration copy.json';
import type { Document, HttpMethods } from 'fumadocs-openapi';

// RFC 7807 shape, matching what the Infoveave services actually return.
const PROBLEM_DETAILS_SCHEMA = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      nullable: true,
      description: 'A short code or URL identifying the error type.',
    },
    title: {
      type: 'string',
      nullable: true,
      description: 'Short, human-readable summary of the error.',
    },
    status: {
      type: 'integer',
      format: 'int32',
      nullable: true,
      description: 'HTTP status code.',
    },
    detail: {
      type: 'string',
      nullable: true,
      description: 'Specific explanation of what went wrong.',
    },
    instance: {
      type: 'string',
      nullable: true,
      description: 'Identifier for this specific error occurrence, if provided.',
    },
  },
  additionalProperties: {},
};

// The administration spec references `#/components/schemas/ProblemDetails`
// without defining it, which crashes the OpenAPI renderer at build time.
function withProblemDetailsFallback(spec: unknown): Document {
  const doc = spec as Document & {
    components?: { schemas?: Record<string, unknown> };
  };
  doc.components ??= {};
  doc.components.schemas ??= {};
  doc.components.schemas.ProblemDetails ??=
    PROBLEM_DETAILS_SCHEMA as unknown as Record<string, unknown>;
  return doc;
}

const docs: Record<string, Document> = {
  administration: withProblemDetailsFallback(administrationDoc),
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
