import type { APIRoute } from 'astro';
import { getProjects } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database connection missing' }), { status: 500 });
  }

  try {
    const projects = await getProjects(db);
    return new Response(JSON.stringify(projects), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database connection missing' }), { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, description, longDescription, tags, imageUrl, category, categoryIds, demoUrl, githubUrl, features, gallery, role, year } = body;
    
    const id = crypto.randomUUID();
    const publishedAt = new Date().toISOString();

    // Use a transaction or batch to ensure atomicity
    const statements = [
      db.prepare(`
        INSERT INTO Projects (id, title, description, longDescription, tags, imageUrl, category, demoUrl, githubUrl, features, gallery, role, year, publishedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, 
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
        year || new Date().getFullYear().toString(),
        publishedAt
      )
    ];

    if (categoryIds && Array.isArray(categoryIds)) {
      categoryIds.forEach(catId => {
        statements.push(
          db.prepare('INSERT INTO ProjectCategories (projectId, categoryId) VALUES (?, ?)').bind(id, catId)
        );
      });
    }

    await db.batch(statements);

    return new Response(JSON.stringify({ id, success: true }), { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create project' }), { status: 500 });
  }
};
