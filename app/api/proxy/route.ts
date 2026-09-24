const ALLOWED_ORIGINS: RegExp[] = [
  /^http:\/\/localhost:10021(?::\d+)?$/i,
  /^http:\/\/localhost:10011(?::\d+)?$/i,
  /^https?:\/\/([a-z0-9-]+\.)*infoveave\.com(:\d+)?$/i,
];

function isAllowed(url: URL): boolean {
  return ALLOWED_ORIGINS.some((re) => re.test(url.origin));
}

async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('url');
  if (!target) {
    return Response.json({ error: 'Missing url param' }, { status: 400 });
  }

  let dest: URL;
  try {
    dest = new URL(target);
  } catch {
    return Response.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!isAllowed(dest)) {
    return Response.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');

  const res = await fetch(dest.toString(), {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
  });

  const outHeaders = new Headers(res.headers);
  outHeaders.delete('content-encoding');
  outHeaders.delete('content-length');

  return new Response(res.body, { status: res.status, headers: outHeaders });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
