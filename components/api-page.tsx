'use client';

import { createOpenAPIPage } from 'fumadocs-openapi/ui';

// The specs use `text/json` (and `application/*+json`), which have no
// built-in media adapter. Treat them as JSON so the renderer (request
// tabs, code samples, playground) doesn't throw "Media type not supported".
const jsonAdapter = {
  encode: (data: { body: unknown }) => JSON.stringify(data.body),
  generateExample: (data: { body: unknown }) =>
    `const body = JSON.stringify(${JSON.stringify(data.body, null, 2)})`,
};

export const APIPage = createOpenAPIPage({
  mediaAdapters: {
    'text/json': jsonAdapter,
    'application/*+json': jsonAdapter,
  },
});
