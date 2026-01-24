import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    const { name, icon, sortOrder } = await request.json();
    await db.prepare(`
      UPDATE SkillCategories SET name = ?, icon = ?, sortOrder = ?
      WHERE id = ?
    `).bind(name, icon || null, sortOrder || 0, id).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update category' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    // Check if skills are using this category
    const skillsUsing = await db.prepare('SELECT COUNT(*) as count FROM Skills WHERE categoryId = ?').bind(id).first('count');
    if (skillsUsing > 0) {
      return new Response(JSON.stringify({ error: 'Category is in use by skills. Delete or reassign skills first.' }), { status: 400 });
    }

    await db.prepare('DELETE FROM SkillCategories WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), { status: 500 });
  }
};
