import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, url }) => {
  const env = locals.runtime?.env;
  const keys = env ? Object.keys(env) : [];

  const summary = {
    url: url.toString(),
    hasRuntime: Boolean(locals.runtime),
    keys,
    hasDB: Boolean(env?.DB),
    hasR2: Boolean(env?.R2_ASSETS),
    hasR2PublicBaseUrl: Boolean(env?.R2_PUBLIC_BASE_URL)
  };

  return new Response(JSON.stringify(summary, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
};

