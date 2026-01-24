import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const categories = await db.prepare('SELECT * FROM SkillCategories ORDER BY sortOrder ASC, name ASC').all();
    return new Response(JSON.stringify(categories.results), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const { name, icon, sortOrder } = await request.json();
    await db.prepare(`
      INSERT INTO SkillCategories (name, icon, sortOrder)
      VALUES (?, ?, ?)
    `).bind(name, icon || null, sortOrder || 0).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create category' }), { status: 500 });
  }
};
