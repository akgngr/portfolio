import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    const { company, position, period, description, logo, categoryId } = await request.json();
    await db.prepare(`
      UPDATE Experiences SET company = ?, position = ?, period = ?, description = ?, logo = ?, categoryId = ?
      WHERE id = ?
    `).bind(company, position, period, JSON.stringify(description || []), logo || null, categoryId || null, id).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update experience' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    await db.prepare('DELETE FROM Experiences WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete experience' }), { status: 500 });
  }
};
