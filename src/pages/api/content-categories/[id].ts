import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    const { name, slug, description, type, parentId, sortOrder } = await request.json();
    
    await db.prepare(`
      UPDATE Categories 
      SET name = ?, slug = ?, description = ?, type = ?, parentId = ?, sortOrder = ?
      WHERE id = ?
    `).bind(name, slug, description || null, type, parentId || null, sortOrder || 0, id).run();
    
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
    // Check if category has children
    const children = await db.prepare('SELECT COUNT(*) as count FROM Categories WHERE parentId = ?').bind(id).first('count');
    if (children > 0) {
      return new Response(JSON.stringify({ error: 'Category has subcategories. Delete them first.' }), { status: 400 });
    }

    // Delete associations first (though ON DELETE CASCADE should handle it if defined, but let's be explicit)
    await db.prepare('DELETE FROM ProjectCategories WHERE categoryId = ?').bind(id).run();
    await db.prepare('DELETE FROM BlogCategories WHERE categoryId = ?').bind(id).run();
    
    await db.prepare('DELETE FROM Categories WHERE id = ?').bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), { status: 500 });
  }
};
