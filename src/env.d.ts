/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

type ENV = {
  DB: D1Database;
  R2_ASSETS: R2Bucket;
  R2_PUBLIC_BASE_URL: string;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      email: string;
    };
  }
}
