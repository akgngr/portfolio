import type { APIRoute } from 'astro';
import { getProfile } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const profile = await getProfile(db);
    return new Response(JSON.stringify(profile), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const body = await request.json();
    await db.prepare('UPDATE Settings SET value = ? WHERE key = "profile"')
      .bind(JSON.stringify(body))
      .run();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), { status: 500 });
  }
};
