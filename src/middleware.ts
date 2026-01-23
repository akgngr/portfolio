import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (_context, next) => {
  try {
    const result: unknown = await next();
    if (result instanceof Response) {
      const contentLength = result.headers.get('content-length');
      const contentType = result.headers.get('content-type') ?? '';

      if (contentType.includes('text/html') && contentLength && Number(contentLength) <= 64) {
        const text = await result.clone().text();
        if (text.trim() === '[object Object]') {
          return new Response(
            JSON.stringify(
              {
                note: 'HTML response body is the string "[object Object]" (object was likely coerced to string).',
                contentType,
                contentLength
              },
              null,
              2
            ),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-App-Debug': 'object-object'
              }
            }
          );
        }
      }

      const headers = new Headers(result.headers);
      headers.set('X-App', 'astro-portfolio');
      return new Response(result.body, {
        status: result.status,
        statusText: result.statusText,
        headers
      });
    }

    const safe = {
      note: 'Non-Response returned from next()',
      type: typeof result,
      ctor:
        result && typeof result === 'object'
          ? (result as { constructor?: { name?: string } }).constructor?.name ?? null
          : null,
      keys: result && typeof result === 'object' ? Object.keys(result as object) : null
    };

    return new Response(JSON.stringify(safe, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);

    return new Response(
      `<!doctype html><meta charset="utf-8" /><title>Server Error</title><pre>${escapeHtml(message)}</pre>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    );
  }
};

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
