import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'polyfill-message-channel',
        transform(code, id, options) {
          // Prepend polyfill to the SSR entry point or chunks containing React DOM Server
          if (options?.ssr && (id.includes('entry') || code.includes('requireReactDomServer') || code.includes('MessageChannel'))) {
            return {
              code: `if (typeof globalThis.MessageChannel === 'undefined') {
                globalThis.MessageChannel = class MessageChannel {
                  constructor() {
                    this.port1 = { onmessage: null, postMessage: (msg) => { if (this.port2.onmessage) this.port2.onmessage({ data: msg }); } };
                    this.port2 = { onmessage: null, postMessage: (msg) => { if (this.port1.onmessage) this.port1.onmessage({ data: msg }); } };
                  }
                };
              }\n${code}`,
              map: null
            };
          }
        }
      }
    ],
    server: {
      watch: {
        ignored: ['**/.wrangler/**']
      }
    },
    ssr: {
      external: ['node:buffer'],
      // Force Vite to process Lexical for SSR/Hydration
      noExternal: ['lexical', '@lexical/react', '@lexical/utils', '@lexical/rich-text', '@lexical/list', '@lexical/link', '@lexical/table', '@lexical/code', '@lexical/history', '@lexical/selection', '@lexical/markdown', '@lexical/clipboard', '@lexical/overflow', '@lexical/plain-text', '@lexical/text', '@lexical/file', '@lexical/hashtag', '@lexical/html']
    },
    optimizeDeps: {
      // Do NOT include @lexical/react here as it lacks a root "." export
      include: ['lexical']
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }
  },

  integrations: [react()],
});
