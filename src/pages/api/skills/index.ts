import type { APIRoute } from 'astro';
import { getSkills } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const skills = await getSkills(db);
    return new Response(JSON.stringify(skills), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch skills' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const { name, icon, description, category, categoryId, level } = await request.json();
    await db.prepare(`
      INSERT INTO Skills (name, icon, description, category, categoryId, level)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, icon || null, description || null, category, categoryId || null, level || 50).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create skill' }), { status: 500 });
  }
};
