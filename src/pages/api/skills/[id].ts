import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    const { name, icon, description, category, categoryId, level } = await request.json();
    await db.prepare(`
      UPDATE Skills SET name = ?, icon = ?, description = ?, category = ?, categoryId = ?, level = ?
      WHERE id = ?
    `).bind(name, icon || null, description || null, category, categoryId || null, level, id).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update skill' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    await db.prepare('DELETE FROM Skills WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete skill' }), { status: 500 });
  }
};
