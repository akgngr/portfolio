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
    plugins: [tailwindcss()],
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
    }
  },

  integrations: [react()],
});
