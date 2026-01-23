export const onRequest = async (context, next) => {
  try {
    return await next();
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

function escapeHtml(input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

