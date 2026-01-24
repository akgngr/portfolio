import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    const { 
      title, excerpt, content, imageUrl, category, categoryIds, readTime, slug,
      metaTitle, metaDescription, focusKeyword, ogImageUrl
    } = await request.json();
    
    const statements = [
      db.prepare(`
        UPDATE BlogPosts SET 
          title = ?, excerpt = ?, content = ?, imageUrl = ?, category = ?, readTime = ?, slug = ?,
          metaTitle = ?, metaDescription = ?, focusKeyword = ?, ogImageUrl = ?
        WHERE id = ?
      `).bind(
        title, excerpt, content, imageUrl, category || 'Tech', readTime, slug,
        metaTitle || null, metaDescription || null, focusKeyword || null, ogImageUrl || null,
        id
      ),
      db.prepare('DELETE FROM BlogCategories WHERE blogPostId = ?').bind(id)
    ];

    if (categoryIds && Array.isArray(categoryIds)) {
      categoryIds.forEach(catId => {
        statements.push(
          db.prepare('INSERT INTO BlogCategories (blogPostId, categoryId) VALUES (?, ?)').bind(id, catId)
        );
      });
    }

    await db.batch(statements);
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update blog post' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) return new Response(JSON.stringify({ error: 'DB or ID missing' }), { status: 400 });

  try {
    await db.prepare('DELETE FROM BlogPosts WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete blog post' }), { status: 500 });
  }
};
