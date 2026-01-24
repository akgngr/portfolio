import type { APIRoute } from 'astro';
import { getCategories } from '../../../lib/db';

export const GET: APIRoute = async ({ url, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  const type = url.searchParams.get('type') as 'project' | 'blog' | null;

  try {
    const categories = await getCategories(db, type || undefined);
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const { name, slug, description, type, parentId, sortOrder } = await request.json();
    
    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    await db.prepare(`
      INSERT INTO Categories (name, slug, description, type, parentId, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, finalSlug, description || null, type, parentId || null, sortOrder || 0).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to create category' }), { status: 500 });
  }
};
