import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, locals } = context;

  // Protect /admin routes and /api/todos
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/todos')) {
    const adminEmail = request.headers.get('Cf-Access-Authenticated-User-Email');

    // In local development, we might not have this header. 
    // You can set a dummy email for local dev if needed.
    const isLocal = import.meta.env.DEV;
    const effectiveEmail = adminEmail || (isLocal ? 'admin@local.test' : null);

    if (!effectiveEmail) {
      return new Response('Not Authorized: Cloudflare Access header missing.', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Store in locals for use in pages/components
    locals.user = { email: effectiveEmail };
  }

  return next();
});
