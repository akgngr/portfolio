import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, locals } = context;

  // Sadece /admin ile başlayan rotaları koru
  if (url.pathname.startsWith('/admin')) {
    const adminEmail = request.headers.get('Cf-Access-Authenticated-User-Email');

    // Yerel geliştirmede (localhost) Cloudflare header'ı olmayacağı için geçişe izin ver
    // Prod ortamında ise header yoksa 403 döndür
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const effectiveEmail = adminEmail || (isLocal ? 'admin@local.test' : null);

    if (!effectiveEmail) {
      return new Response('Not Authorized: Cloudflare Access header missing. Please access through Cloudflare Zero Trust.', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Locals içine kullanıcı bilgisini koy (sayfalarda kullanabilmek için)
    locals.user = { email: effectiveEmail };
  }

  return next();
});
