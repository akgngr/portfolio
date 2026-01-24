import { defineMiddleware } from 'astro:middleware';

// React 19 SSR polyfill for Cloudflare Workers
if (typeof MessageChannel === 'undefined') {
  try {
    // @ts-ignore
    const { MessageChannel: NodeMessageChannel } = await import('node:worker_threads');
    // @ts-ignore
    globalThis.MessageChannel = NodeMessageChannel;
  } catch (e) {
    // Fallback for environments where node:worker_threads is not available
    // @ts-ignore
    globalThis.MessageChannel = class MessageChannel {
      port1: any;
      port2: any;
      constructor() {
        this.port1 = { onmessage: null, postMessage: (msg: any) => this.port2?.onmessage?.({ data: msg }) };
        this.port2 = { onmessage: null, postMessage: (msg: any) => this.port1?.onmessage?.({ data: msg }) };
      }
    };
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, locals } = context;

  // Sadece /admin ve hassas API rotalarını koru
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/projects')) {
    
    // Cloudflare bazen header isimlerini küçük harfe zorlayabilir
    const adminEmail = 
      request.headers.get('Cf-Access-Authenticated-User-Email') || 
      request.headers.get('cf-access-authenticated-user-email');

    // Ortam kontrolü
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isDev = import.meta.env.DEV;
    
    const effectiveEmail = adminEmail || (isLocal || isDev ? 'admin@local.test' : null);

    if (!effectiveEmail) {
      // Hata durumunda hangi header'ların geldiğini görmek için (debug amaçlı)
      const headerKeys = Array.from(request.headers.keys()).join(', ');
      
      return new Response(
        `Not Authorized: Cloudflare Access header missing.\n\n` +
        `Gelen Header'lar: ${headerKeys}\n\n` +
        `Lütfen Cloudflare Zero Trust panelinden /admin yolunun korunduğundan ve doğru politikaların uygulandığından emin olun.`, 
        { 
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        }
      );
    }

    // Locals içine kullanıcı bilgisini koy
    locals.user = { email: effectiveEmail };
  }

  return next();
});
