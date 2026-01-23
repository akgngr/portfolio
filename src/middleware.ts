import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (_context, next) => {
  try {
    return await next();
  } catch (err) {
    console.error('Middleware Error:', err);
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return new Response(
      `<!doctype html><meta charset="utf-8" /><title>Server Error</title><body><h1>Server Error</h1><pre>${message}</pre></body>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
};
