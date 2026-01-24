import type { APIRoute } from 'astro';
import { getProjectById } from '../../../lib/db';

export const GET: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) {
    return new Response(JSON.stringify({ error: 'Missing DB or ID' }), { status: 400 });
  }

  try {
    const project = await getProjectById(db, id);
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(project), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch project' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) {
    return new Response(JSON.stringify({ error: 'Missing DB or ID' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, description, longDescription, tags, imageUrl, category, categoryIds, demoUrl, githubUrl, features, gallery, role, year } = body;

    const statements = [
      db.prepare(`
        UPDATE Projects 
        SET title = ?, description = ?, longDescription = ?, tags = ?, imageUrl = ?, category = ?, 
            demoUrl = ?, githubUrl = ?, features = ?, gallery = ?, role = ?, year = ?
        WHERE id = ?
      `).bind(
        title, 
        description, 
        longDescription || null, 
        JSON.stringify(tags || []), 
        imageUrl, 
        category || 'Web', 
        demoUrl || '#', 
        githubUrl || '#', 
        JSON.stringify(features || []), 
        JSON.stringify(gallery || []), 
        role || 'Developer', 
        year || '2023',
        id
      ),
      // Clear existing categories
      db.prepare('DELETE FROM ProjectCategories WHERE projectId = ?').bind(id)
    ];

    // Add new categories
    if (categoryIds && Array.isArray(categoryIds)) {
      categoryIds.forEach(catId => {
        statements.push(
          db.prepare('INSERT INTO ProjectCategories (projectId, categoryId) VALUES (?, ?)').bind(id, catId)
        );
      });
    }

    await db.batch(statements);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Project update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update project' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime?.env?.DB;
  const { id } = params;

  if (!db || !id) {
    return new Response(JSON.stringify({ error: 'Missing DB or ID' }), { status: 400 });
  }

  try {
    await db.prepare('DELETE FROM Projects WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete project' }), { status: 500 });
  }
};
